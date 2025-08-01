import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useOutfitTracking } from '@/hooks/useOutfitTracking';
import { useWeather } from '@/hooks/useWeather';
import { WeatherCard } from '@/components/weather/WeatherCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Sparkles, Plus, X, CloudSun } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ColorMatcher } from '@/utils/colorCombinations';
import { OutfitCreator } from './OutfitCreator';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  color?: string;
  image_url: string;
  temperature_range?: string;
  weather_conditions?: string[];
}

interface WeeklyOutfit {
  id: string;
  date: string;
  clothing_item_ids: string[];
  notes?: string;
  is_ai_generated: boolean;
  items?: ClothingItem[];
}

interface MyWeekProps {
  onClose?: () => void;
}

export const MyWeek = ({ onClose }: MyWeekProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [outfits, setOutfits] = useState<WeeklyOutfit[]>([]);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { markOutfitAsWorn } = useOutfitTracking();
  const { currentWeather, forecast, getTemperatureRange, getWeatherConditions } = useWeather();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchData();
  }, [currentWeek]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch clothing items
      const { data: items, error: itemsError } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', user?.id);

      if (itemsError) throw itemsError;
      setClothingItems(items || []);

      // Fetch weekly outfits
      const weekEnd = addDays(weekStart, 6);
      const { data: outfitData, error: outfitError } = await supabase
        .from('weekly_outfits')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'));

      if (outfitError) throw outfitError;

      // Map outfit items
      const outfitsWithItems = (outfitData || []).map(outfit => ({
        ...outfit,
        items: items?.filter(item => outfit.clothing_item_ids.includes(item.id)) || []
      }));

      setOutfits(outfitsWithItems);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getOutfitForDay = (date: Date): WeeklyOutfit | undefined => {
    return outfits.find(outfit => {
      // Fix: Parse date string as local time to avoid timezone issues
      const [year, month, day] = outfit.date.split('-').map(Number);
      const outfitDate = new Date(year, month - 1, day);
      return isSameDay(outfitDate, date);
    });
  };

  const generateAIOutfit = async (date: Date) => {
    try {
      // Get weather-based parameters
      const season = format(date, 'MMM');
      const occasion = 'Casual';
      
      // Get weather forecast for the selected date or current weather
      const forecastForDate = forecast.find(f => f.date === format(date, 'yyyy-MM-dd'));
      const weatherForDay = forecastForDate || currentWeather;
      
      // Determine temperature range and weather conditions for filtering
      let targetTempRange = '';
      let targetWeatherConditions: string[] = [];
      
      if (weatherForDay) {
        const temp = 'temperature' in weatherForDay ? 
          weatherForDay.temperature : 
          (weatherForDay as any).temperature?.max || 20; // fallback to 20°C
        targetTempRange = getTemperatureRange(temp);
        targetWeatherConditions = getWeatherConditions(weatherForDay.condition);
      }

      // Filter clothing items based on weather suitability
      const weatherSuitableItems = clothingItems.filter(item => {
        // If item has no weather data, include it (assume suitable for all weather)
        if (!item.temperature_range && !item.weather_conditions?.length) return true;
        
        // Check temperature suitability
        const tempSuitable = !item.temperature_range || item.temperature_range === targetTempRange;
        
        // Check weather condition suitability
        const weatherSuitable = !item.weather_conditions?.length || 
          item.weather_conditions.some(condition => targetWeatherConditions.includes(condition));
        
        return tempSuitable && weatherSuitable;
      });

      const selectedItems: ClothingItem[] = [];
      
      // Step 1: Pick a base item (top) that's weather-appropriate
      const topCategories = ['T-Shirts', 'Shirts'];
      const availableTops = weatherSuitableItems.filter(item => 
        topCategories.includes(item.category)
      );
      
      if (availableTops.length > 0) {
        const baseTop = availableTops[Math.floor(Math.random() * availableTops.length)];
        selectedItems.push(baseTop);
        
        // Step 2: Find compatible bottom based on color and weather
        const bottomCategories = ['Pants', 'Jeans', 'Shorts'];
        const availableBottoms = weatherSuitableItems.filter(item => 
          bottomCategories.includes(item.category)
        );
        
        if (availableBottoms.length > 0) {
          // Filter bottoms by color compatibility
          const compatibleBottoms = availableBottoms.filter(bottom => {
            if (!baseTop.color || !bottom.color) return true; // No color info, assume compatible
            return ColorMatcher.areColorsCompatible(baseTop.color, bottom.color, occasion);
          });
          
          const selectedBottoms = compatibleBottoms.length > 0 ? compatibleBottoms : availableBottoms;
          const bottom = selectedBottoms[Math.floor(Math.random() * selectedBottoms.length)];
          selectedItems.push(bottom);
        }
        
        // Step 3: Add shoes that work with the outfit and weather
        const shoeCategories = ['Shoes', 'Sneakers', 'Boots'];
        const availableShoes = weatherSuitableItems.filter(item => 
          shoeCategories.includes(item.category)
        );
        
        if (availableShoes.length > 0) {
          const outfitColors = selectedItems.map(item => item.color).filter(Boolean);
          const compatibleShoes = availableShoes.filter(shoe => {
            if (!shoe.color) return true;
            return outfitColors.some(color => 
              ColorMatcher.areColorsCompatible(color!, shoe.color!, occasion)
            );
          });
          
          const selectedShoes = compatibleShoes.length > 0 ? compatibleShoes : availableShoes;
          const shoe = selectedShoes[Math.floor(Math.random() * selectedShoes.length)];
          selectedItems.push(shoe);
        }
      }

      if (selectedItems.length === 0) {
        toast({
          title: "No items available",
          description: "Add some clothing items to generate outfits.",
          variant: "destructive"
        });
        return;
      }

      // Calculate color harmony score
      const colors = selectedItems.map(item => item.color).filter(Boolean) as string[];
      const colorScore = ColorMatcher.scoreOutfitColors(colors, occasion, season);
      
      const itemIds = selectedItems.map(item => item.id);
      const weatherNote = weatherForDay ? `Weather-appropriate for ${weatherForDay.condition} (${targetTempRange.replace('_', ' ')})` : '';
      const notes = `AI-generated outfit (Color harmony: ${colorScore}%)${weatherNote ? ` - ${weatherNote}` : ''}`;
      await saveOutfit(date, itemIds, notes, true);
      
      toast({
        title: "AI Outfit Generated!",
        description: `Weather-appropriate outfit with ${colorScore}% color harmony created for ${weatherForDay?.condition || 'today'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to generate outfit",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const saveOutfit = async (date: Date, itemIds: string[], notes?: string, isAiGenerated = false) => {
    try {
      const { error } = await supabase
        .from('weekly_outfits')
        .upsert({
          user_id: user?.id,
          date: format(date, 'yyyy-MM-dd'),
          clothing_item_ids: itemIds,
          notes: notes || null,
          is_ai_generated: isAiGenerated
        });

      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      toast({
        title: "Failed to save outfit",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeOutfit = async (date: Date, isAiGenerated: boolean) => {
    try {
      let query = supabase
        .from('weekly_outfits')
        .delete()
        .eq('user_id', user?.id)
        .eq('date', format(date, 'yyyy-MM-dd'));

      if (isAiGenerated) {
        query = query.eq('is_ai_generated', true);
      }

      const { error } = await query;

      if (error) throw error;
      await fetchData();
      
      toast({
        title: "Outfit removed",
        description: "The outfit has been removed from your week.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to remove outfit",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>My Week</span>
            </CardTitle>
            <CardDescription>
              Plan your outfits for the week of {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Current Weather Display */}
        {currentWeather && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <CloudSun className="h-4 w-4" />
              <span className="text-sm font-medium">Today's Weather</span>
            </div>
            <WeatherCard weather={currentWeather} className="max-w-md" />
          </div>
        )}
        
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayName = format(day, 'EEE');
            const dayDate = format(day, 'd');
            const outfit = getOutfitForDay(day);
            
            return (
              <div key={index} className="space-y-3">
                {/* Day Header */}
                <div className="text-center">
                  <div className="font-semibold text-sm">{dayName}</div>
                  <div className="text-2xl font-bold">{dayDate}</div>
                </div>

                {/* Outfit Card */}
                <Card className="min-h-48 relative">
                  <CardContent className="p-3">
                    {outfit ? (
                      <div className="space-y-2">
                        {/* Outfit Items */}
                        <div className="grid grid-cols-1 gap-1">
                          {outfit.items?.slice(0, 3).map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center space-x-2">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-8 h-8 object-cover rounded-sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                              </div>
                            </div>
                          ))}
                          {outfit.items && outfit.items.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{outfit.items.length - 3} more
                            </p>
                          )}
                        </div>

                        {/* AI Badge */}
                        {outfit.is_ai_generated && (
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-1">
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                            onClick={() => markOutfitAsWorn(outfit.id, day)}
                          >
                            Mark as Worn
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-destructive hover:text-destructive"
                            onClick={() => removeOutfit(day, outfit.is_ai_generated)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 text-center">
                        <div className="text-sm text-muted-foreground">No outfit planned</div>
                        
                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setSelectedDay(day);
                              setIsCreatorOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Create
                          </Button>
                          
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            onClick={() => generateAIOutfit(day)}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Suggest
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Week Navigation */}
        <div className="flex justify-center space-x-4 mt-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
          >
            Previous Week
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCurrentWeek(new Date())}
          >
            This Week
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
          >
            Next Week
          </Button>
        </div>
      </CardContent>
      <OutfitCreator
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        date={selectedDay}
        onOutfitCreated={() => {
          fetchData();
          setIsCreatorOpen(false);
        }}
      />
    </Card>
  );
};