import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Edit } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClothingGridProps {
  items: any[];
  loading: boolean;
  selectedItems?: string[];
  onSelectItem?: (id: string) => void;
  refreshTrigger?: number;
}

export const ClothingGrid = ({ items, loading, selectedItems, onSelectItem, refreshTrigger }: ClothingGridProps) => {
  const [deleteDialogItem, setDeleteDialogItem] = useState<{id: string, imageUrl: string} | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);
  const { toast } = useToast();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;

    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .update({
          name: editItem.name,
          brand: editItem.brand,
          color: editItem.color,
          category: editItem.category,
          seasons: editItem.seasons,
          occasions: editItem.occasions,
        })
        .eq('id', editItem.id);

      if (error) throw error;

      toast({
        title: "Item updated",
        description: "The clothing item has been updated.",
      });
      setEditItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update the item",
        variant: "destructive",
      });
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
    } finally {
      setDeleteDialogItem(null);
    }
  };

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
        <p className="text-muted-foreground">No items found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className={`group hover:shadow-lg transition-shadow ${selectedItems?.includes(item.id) ? 'border-primary' : ''}`}
            onClick={() => onSelectItem?.(item.id)}
          >
            <div className="relative overflow-hidden">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {onSelectItem && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <p className="text-white font-bold">
                    {selectedItems?.includes(item.id) ? 'Selected' : 'Select'}
                  </p>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2 line-clamp-2">{item.name}</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                {item.brand && <p>Brand: {item.brand}</p>}
                {item.color && <p>Color: {item.color}</p>}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Badge variant="secondary" className="text-xs">
                {item.category}
              </Badge>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {editItem && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={editItem.name} onChange={(e) => setEditItem({...editItem, name: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" value={editItem.brand} onChange={(e) => setEditItem({...editItem, brand: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input id="color" value={editItem.color} onChange={(e) => setEditItem({...editItem, color: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={editItem.category} onChange={(e) => setEditItem({...editItem, category: e.target.value})} />
              </div>
              {/* TODO: Add multi-select for seasons and occasions */}
              <Button type="submit">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};