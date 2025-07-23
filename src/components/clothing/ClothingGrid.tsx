import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Edit } from 'lucide-react';
import { ClothingSearch } from './ClothingSearch';
import { useClothingSearch } from '@/hooks/useClothingSearch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClothingGridProps {
  refreshTrigger?: number;
}

export const ClothingGrid = ({ refreshTrigger }: ClothingGridProps) => {
  const { 
    filters, 
    setFilters, 
    clearFilters, 
    filteredItems, 
    availableBrands, 
    availableColors, 
    isLoading, 
    totalItems, 
    filteredCount,
    usageMap 
  } = useClothingSearch();
  
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
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
      </div>
    );
  }

  if (totalItems === 0) {
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
      <ClothingSearch
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        availableBrands={availableBrands}
        availableColors={availableColors}
      />

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredCount} of {totalItems} items
        {filteredCount !== totalItems && " (filtered)"}
      </div>

      {/* No Results */}
      {filteredCount === 0 && totalItems > 0 && (
        <div className="text-center py-12">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-muted-foreground">
              No items match your filters
            </h2>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or clearing filters
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {filteredCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const usage = usageMap.get(item.id);
            return (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                <div className="relative overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete clothing item</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{item.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteItem(item.id, item.image_url)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  {/* Usage indicator */}
                  {usage && usage.total_wears > 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        Worn {usage.total_wears}x
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{item.name}</h3>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {item.brand && <p>Brand: {item.brand}</p>}
                    {item.color && <p>Color: {item.color}</p>}
                    {usage?.last_worn && (
                      <p>Last worn: {new Date(usage.last_worn).toLocaleDateString()}</p>
                    )}
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
            );
          })}
        </div>
      )}

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