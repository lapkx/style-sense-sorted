import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ClothingGrid } from '@/components/clothing/ClothingGrid';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  image_url: string;
}

interface OutfitCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  onOutfitCreated: () => void;
}

export const OutfitCreator = ({ isOpen, onClose, date, onOutfitCreated }: OutfitCreatorProps) => {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchClothingItems();
    }
  }, [isOpen]);

  const fetchClothingItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .select('id, name, category, image_url')
        .eq('user_id', user?.id);

      if (error) throw error;
      setClothingItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching clothing items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSaveOutfit = async () => {
    if (!date || selectedItems.length === 0) {
      toast({
        title: "Cannot save outfit",
        description: "Please select a date and at least one clothing item.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from('weekly_outfits').upsert({
        user_id: user?.id,
        date: date.toISOString().split('T')[0],
        clothing_item_ids: selectedItems,
        is_ai_generated: false,
      });

      if (error) throw error;

      toast({
        title: "Outfit saved!",
        description: "Your outfit has been added to your weekly plan.",
      });
      onOutfitCreated();
      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to save outfit",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredItems = clothingItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Outfit for {date ? date.toLocaleDateString() : ''}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="max-h-[50vh] overflow-y-auto">
            <ClothingGrid
              items={filteredItems}
              selectedItems={selectedItems}
              onSelectItem={handleSelectItem}
              loading={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveOutfit}>Save Outfit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
