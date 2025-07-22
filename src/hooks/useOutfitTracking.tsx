import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OutfitHistory {
  id: string;
  outfit_id: string;
  worn_date: string;
  notes?: string;
}

interface OutfitRating {
  id: string;
  outfit_id: string;
  rating: number;
  notes?: string;
}

export function useOutfitTracking() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const markOutfitAsWorn = async (outfitId: string, date: Date, notes?: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Add to outfit history
      const { error: historyError } = await supabase
        .from('outfit_history')
        .insert({
          user_id: user.id,
          outfit_id: outfitId,
          worn_date: date.toISOString().split('T')[0],
          notes,
        });

      if (historyError) throw historyError;

      // Get the outfit's clothing items
      const { data: outfit, error: outfitError } = await supabase
        .from('weekly_outfits')
        .select('clothing_item_ids')
        .eq('id', outfitId)
        .single();

      if (outfitError) throw outfitError;

      // Update clothing usage for each item
      if (outfit?.clothing_item_ids) {
        for (const itemId of outfit.clothing_item_ids) {
          const { data: existingUsage, error: fetchError } = await supabase
            .from('clothing_usage')
            .select('*')
            .eq('user_id', user.id)
            .eq('clothing_item_id', itemId)
            .maybeSingle();

          if (fetchError) throw fetchError;

          if (existingUsage) {
            // Update existing usage
            const { error: updateError } = await supabase
              .from('clothing_usage')
              .update({
                last_worn: date.toISOString().split('T')[0],
                total_wears: existingUsage.total_wears + 1,
              })
              .eq('id', existingUsage.id);

            if (updateError) throw updateError;
          } else {
            // Create new usage record
            const { error: insertError } = await supabase
              .from('clothing_usage')
              .insert({
                user_id: user.id,
                clothing_item_id: itemId,
                last_worn: date.toISOString().split('T')[0],
                total_wears: 1,
              });

            if (insertError) throw insertError;
          }
        }
      }

      toast({
        title: "Success",
        description: "Outfit marked as worn and usage updated",
      });

      return true;
    } catch (error) {
      console.error('Error marking outfit as worn:', error);
      toast({
        title: "Error",
        description: "Failed to mark outfit as worn",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rateOutfit = async (outfitId: string, rating: number, notes?: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('outfit_ratings')
        .upsert({
          user_id: user.id,
          outfit_id: outfitId,
          rating,
          notes,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Outfit rated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error rating outfit:', error);
      toast({
        title: "Error",
        description: "Failed to rate outfit",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getOutfitHistory = async (outfitId: string): Promise<OutfitHistory[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('outfit_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('outfit_id', outfitId)
        .order('worn_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching outfit history:', error);
      return [];
    }
  };

  const getOutfitRating = async (outfitId: string): Promise<OutfitRating | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('outfit_ratings')
        .select('*')
        .eq('user_id', user.id)
        .eq('outfit_id', outfitId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching outfit rating:', error);
      return null;
    }
  };

  const getUnwornItems = async (days: number = 30) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from('clothing_usage')
        .select(`
          *,
          clothing_items (
            name,
            category,
            color,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .or(`last_worn.is.null,last_worn.lt.${cutoffDate.toISOString().split('T')[0]}`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching unworn items:', error);
      return [];
    }
  };

  return {
    markOutfitAsWorn,
    rateOutfit,
    getOutfitHistory,
    getOutfitRating,
    getUnwornItems,
    loading,
  };
}