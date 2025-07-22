import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { Camera, Upload, X, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ClothingUploadProps {
  onUploadComplete?: () => void;
}

interface AIAnalysis {
  detectedCategory: string;
  detectedBrand?: string;
  detectedColor?: string;
  confidence: number;
  suggestedName: string;
  fallback?: boolean;
}

const CATEGORIES = [
  'T-Shirts',
  'Shirts',
  'Hoodies',
  'Sweaters',
  'Jackets',
  'Coats',
  'Jeans',
  'Pants',
  'Shorts',
  'Shoes',
  'Sneakers',
  'Boots',
  'Accessories',
  'Other'
];

const SEASON_OPTIONS: Option[] = [
  { label: 'Spring', value: 'Spring' },
  { label: 'Summer', value: 'Summer' },
  { label: 'Fall', value: 'Fall' },
  { label: 'Winter', value: 'Winter' },
  { label: 'All Year', value: 'All Year' },
];

const OCCASION_OPTIONS: Option[] = [
  { label: 'Casual', value: 'Casual' },
  { label: 'Work', value: 'Work' },
  { label: 'Formal', value: 'Formal' },
  { label: 'Gym', value: 'Gym' },
  { label: 'Party', value: 'Party' },
  { label: 'Date Night', value: 'Date Night' },
  { label: 'Travel', value: 'Travel' },
  { label: 'Other', value: 'Other' },
];

export const ClothingUpload = ({ onUploadComplete }: ClothingUploadProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    color: '',
    seasons: [] as string[],
    occasions: [] as string[],
    notes: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const analyzeImage = async (file: File) => {
    setAnalyzing(true);
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          resolve(base64Data);
        };
        reader.readAsDataURL(file);
      });

      // Call our AI analysis edge function
      const { data, error } = await supabase.functions.invoke('analyze-clothing', {
        body: { imageBase64: base64 }
      });

      if (error) throw error;

      setAiAnalysis(data);
      
      // Auto-fill form with AI suggestions
      if (data.suggestedName && !formData.name) {
        setFormData(prev => ({ ...prev, name: data.suggestedName }));
      }
      if (data.detectedCategory && !formData.category) {
        setFormData(prev => ({ ...prev, category: data.detectedCategory }));
      }
      if (data.detectedBrand && !formData.brand) {
        setFormData(prev => ({ ...prev, brand: data.detectedBrand }));
      }
      if (data.detectedColor && !formData.color) {
        setFormData(prev => ({ ...prev, color: data.detectedColor }));
      }

      toast({
        title: "AI Analysis Complete!",
        description: `Detected: ${data.detectedCategory}${data.detectedBrand ? ` by ${data.detectedBrand}` : ''}${data.detectedColor ? ` in ${data.detectedColor}` : ''}`,
      });
    } catch (error: any) {
      console.error('AI analysis failed:', error);
      toast({
        title: "AI analysis failed",
        description: "Don't worry, you can still fill out the details manually.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAiAnalysis(null);
    
    // Trigger AI analysis automatically
    analyzeImage(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('clothing-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('clothing-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage || !formData.name || !formData.category) {
      toast({
        title: "Missing information",
        description: "Please provide an image, name, and category.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Upload image to storage
      const imageUrl = await uploadImage(selectedImage);

      // Save clothing item to database
      const { error } = await supabase
        .from('clothing_items')
        .insert({
          user_id: user?.id,
          name: formData.name,
          category: formData.category,
          brand: formData.brand || null,
          color: formData.color || null,
          seasons: formData.seasons.length > 0 ? formData.seasons : null,
          occasions: formData.occasions.length > 0 ? formData.occasions : null,
          notes: formData.notes || null,
          image_url: imageUrl
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your clothing item has been added to your closet.",
      });

      // Reset form
      setSelectedImage(null);
      setPreviewUrl(null);
      setAiAnalysis(null);
      setFormData({
        name: '',
        category: '',
        brand: '',
        color: '',
        seasons: [],
        occasions: [],
        notes: ''
      });

      onUploadComplete?.();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Clothing Item</CardTitle>
        <CardDescription>
          Take a photo or upload an image of your clothing item
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            {!previewUrl ? (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center space-y-2"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-8 w-8" />
                  <span>Take Photo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center space-y-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8" />
                  <span>Upload Image</span>
                </Button>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Selected clothing"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* AI Analysis Results */}
          {(analyzing || aiAnalysis) && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">AI Analysis</span>
                </div>
                
                {analyzing ? (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing your clothing item...</span>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="default">{aiAnalysis.detectedCategory}</Badge>
                        {aiAnalysis.detectedBrand && (
                          <Badge variant="secondary">{aiAnalysis.detectedBrand}</Badge>
                        )}
                        {aiAnalysis.detectedColor && (
                          <Badge variant="outline">{aiAnalysis.detectedColor}</Badge>
                        )}
                        {aiAnalysis.fallback && (
                          <Badge variant="outline" className="text-xs">Fallback Mode</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(aiAnalysis.confidence * 100)}% confident
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI has pre-filled the form with detected information. You can edit any field as needed.
                    </p>
                    {selectedImage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => analyzeImage(selectedImage)}
                        className="text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Re-analyze
                      </Button>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Blue Denim Jacket"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="e.g., Nike, Levi's"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                placeholder="e.g., Navy Blue"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seasons">Seasons</Label>
              <MultiSelect
                options={SEASON_OPTIONS}
                selected={formData.seasons}
                onChange={(selected) => setFormData({ ...formData, seasons: selected })}
                placeholder="Select seasons..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occasions">Occasions</Label>
              <MultiSelect
                options={OCCASION_OPTIONS}
                selected={formData.occasions}
                onChange={(selected) => setFormData({ ...formData, occasions: selected })}
                placeholder="Select occasions..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes or styling tips..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add to Closet
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};