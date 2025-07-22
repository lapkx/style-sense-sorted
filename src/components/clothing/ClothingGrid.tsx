import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Search, Filter, Trash2, Edit } from 'lucide-react';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  color?: string;
  seasons?: string[];
  occasions?: string[];
  image_url: string;
  notes?: string;
  created_at: string;
}

interface ClothingGridProps {
  refreshTrigger?: number;
}

export const ClothingGrid = ({ refreshTrigger }: ClothingGridProps) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSeason, setFilterSeason] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchClothingItems = async () => {
    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load your clothing items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId: string, imageUrl: string) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Delete image from storage
      const imagePath = imageUrl.split('/').slice(-2).join('/');
      await supabase.storage
        .from('clothing-images')
        .remove([imagePath]);

      setItems(items.filter(item => item.id !== itemId));
      toast({
        title: "Item deleted",
        description: "The clothing item has been removed from your closet.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete the item",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchClothingItems();
    }
  }, [user, refreshTrigger]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.color?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesSeason = !filterSeason || item.seasons?.includes(filterSeason);
    
    return matchesSearch && matchesCategory && matchesSeason;
  });

  const categories = [...new Set(items.map(item => item.category))];
  const seasons = [...new Set(items.flatMap(item => item.seasons || []))].filter(Boolean);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">
            Your closet is empty
          </h2>
          <p className="text-muted-foreground">
            Start building your digital wardrobe by adding your first clothing item
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your closet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSeason} onValueChange={setFilterSeason}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Seasons</SelectItem>
              {seasons.map((season) => (
                <SelectItem key={season} value={season}>
                  {season}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredItems.length} of {items.length} items
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="group hover:shadow-lg transition-shadow">
            <div className="relative overflow-hidden">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0"
                    onClick={() => deleteItem(item.id, item.image_url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2 line-clamp-2">{item.name}</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                {item.brand && <p>Brand: {item.brand}</p>}
                {item.color && <p>Color: {item.color}</p>}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
                {item.seasons?.map((season, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {season}
                  </Badge>
                ))}
                {item.occasions?.map((occasion, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {occasion}
                  </Badge>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};