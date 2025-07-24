import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useLaundryManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({ itemId, needsWashing }: { itemId: string, needsWashing: boolean }) => {
      const { error } = await supabase
        .from('clothing_items')
        .update({ needs_washing: needsWashing })
        .eq('id', itemId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clothing-items'] });
      toast({
        title: 'Success',
        description: 'Item updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    markAsDirty: (itemId: string) => mutation.mutate({ itemId, needsWashing: true }),
    markAsClean: (itemId: string) => mutation.mutate({ itemId, needsWashing: false }),
    isUpdating: mutation.isPending,
  };
};
