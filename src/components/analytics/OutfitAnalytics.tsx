import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, TrendingUp, Clock, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OutfitHistory {
  id: string;
  outfit_id: string;
  worn_date: string;
  notes?: string;
  weekly_outfits: {
    clothing_item_ids: string[];
    date: string;
    is_ai_generated: boolean;
  };
}

interface OutfitRating {
  id: string;
  outfit_id: string;
  rating: number;
  notes?: string;
}

interface ClothingUsage {
  id: string;
  clothing_item_id: string;
  last_worn?: string;
  total_wears: number;
  clothing_items: {
    name: string;
    category: string;
    color?: string;
    image_url: string;
  };
}

interface OutfitAnalyticsProps {
  onClose?: () => void;
}

export default function OutfitAnalytics({ onClose }: OutfitAnalyticsProps) {
  const [history, setHistory] = useState<OutfitHistory[]>([]);
  const [ratings, setRatings] = useState<OutfitRating[]>([]);
  const [usage, setUsage] = useState<ClothingUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch outfit history
      const { data: historyData, error: historyError } = await supabase
        .from('outfit_history')
        .select(`
          *,
          weekly_outfits (
            clothing_item_ids,
            date,
            is_ai_generated
          )
        `)
        .eq('user_id', user.id)
        .order('worn_date', { ascending: false });

      if (historyError) throw historyError;

      // Fetch outfit ratings
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('outfit_ratings')
        .select('*')
        .eq('user_id', user.id);

      if (ratingsError) throw ratingsError;

      // Fetch clothing usage with item details
      const { data: usageData, error: usageError } = await supabase
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
        .order('total_wears', { ascending: false });

      if (usageError) throw usageError;

      setHistory(historyData || []);
      setRatings(ratingsData || []);
      setUsage(usageData || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const rateOutfit = async (outfitId: string, rating: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const existingRating = ratings.find(r => r.outfit_id === outfitId);

      const { error } = await supabase
        .from('outfit_ratings')
        .upsert({
          id: existingRating?.id,
          user_id: user.id,
          outfit_id: outfitId,
          rating,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Outfit rating updated successfully",
      });

      fetchAnalyticsData();
    } catch (error) {
      console.error('Error rating outfit:', error);
      toast({
        title: "Error",
        description: "Failed to update outfit rating",
        variant: "destructive",
      });
    }
  };

  const getOutfitRating = (outfitId: string) => {
    return ratings.find(r => r.outfit_id === outfitId)?.rating || 0;
  };

  const getUnwornItems = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return usage.filter(item => 
      !item.last_worn || new Date(item.last_worn) < thirtyDaysAgo
    );
  };

  const getMostWornItems = () => {
    return usage.slice(0, 5);
  };

  const getRecentOutfits = () => {
    return history.slice(0, 10);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Outfit Analytics</h1>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Back to Closet
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{history.length}</p>
                <p className="text-xs text-muted-foreground">Outfits Worn</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {ratings.length > 0 ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1) : '0'}
                </p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{getMostWornItems().length}</p>
                <p className="text-xs text-muted-foreground">Favorite Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{getUnwornItems().length}</p>
                <p className="text-xs text-muted-foreground">Need Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Outfits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Outfits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRecentOutfits().map((outfit) => (
                <div key={outfit.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {new Date(outfit.worn_date).toLocaleDateString()}
                    </span>
                    {outfit.weekly_outfits.is_ai_generated && (
                      <Badge variant="secondary">AI Generated</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {outfit.weekly_outfits.clothing_item_ids.length} items
                    </span>
                    
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => rateOutfit(outfit.outfit_id, star)}
                          className={`h-4 w-4 ${
                            star <= getOutfitRating(outfit.outfit_id)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {outfit.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {outfit.notes}
                    </p>
                  )}
                </div>
              ))}
              
              {history.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No outfit history yet. Start wearing your planned outfits!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Most Worn Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Most Worn Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getMostWornItems().map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.clothing_items.image_url}
                    alt={item.clothing_items.name}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.clothing_items.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.clothing_items.category}
                      {item.clothing_items.color && ` • ${item.clothing_items.color}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.total_wears}</p>
                    <p className="text-xs text-muted-foreground">wears</p>
                  </div>
                </div>
              ))}
              
              {usage.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No usage data yet. Start tracking your outfits!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Needing Attention */}
      {getUnwornItems().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Items You Haven't Worn Lately
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {getUnwornItems().slice(0, 12).map((item) => (
                <div key={item.id} className="text-center">
                  <img
                    src={item.clothing_items.image_url}
                    alt={item.clothing_items.name}
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                  <p className="text-sm font-medium">{item.clothing_items.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.last_worn 
                      ? `Last worn ${new Date(item.last_worn).toLocaleDateString()}`
                      : 'Never worn'
                    }
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}