import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { SearchFilters } from '@/components/clothing/ClothingSearch';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  color?: string;
  image_url: string;
  seasons?: string[];
  occasions?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ClothingUsage {
  clothing_item_id: string;
  total_wears: number;
  last_worn?: string;
}

export const useClothingSearch = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    seasons: [],
    occasions: [],
    brand: '',
    color: '',
    sortBy: 'newest',
    sortOrder: 'desc'
  });

  // Fetch clothing items
  const { data: clothingItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['clothing-items', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClothingItem[];
    },
    enabled: !!user?.id
  });

  // Fetch clothing usage data
  const { data: usageData = [], isLoading: isLoadingUsage } = useQuery({
    queryKey: ['clothing-usage', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('clothing_usage')
        .select('clothing_item_id, total_wears, last_worn')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as ClothingUsage[];
    },
    enabled: !!user?.id
  });

  // Create usage lookup map
  const usageMap = useMemo(() => {
    const map = new Map<string, ClothingUsage>();
    usageData.forEach((usage) => {
      map.set(usage.clothing_item_id, usage);
    });
    return map;
  }, [usageData]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = [...clothingItems];

    // Apply text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.brand && item.brand.toLowerCase().includes(query)) ||
        (item.color && item.color.toLowerCase().includes(query)) ||
        (item.notes && item.notes.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filters.category) {
      items = items.filter(item => item.category === filters.category);
    }

    // Apply brand filter
    if (filters.brand) {
      items = items.filter(item => item.brand === filters.brand);
    }

    // Apply color filter
    if (filters.color) {
      items = items.filter(item => item.color === filters.color);
    }

    // Apply seasons filter
    if (filters.seasons.length > 0) {
      items = items.filter(item => 
        item.seasons && item.seasons.some(season => filters.seasons.includes(season))
      );
    }

    // Apply occasions filter
    if (filters.occasions.length > 0) {
      items = items.filter(item => 
        item.occasions && item.occasions.some(occasion => filters.occasions.includes(occasion))
      );
    }

    // Apply sorting
    items.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'newest':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'oldest':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'most_worn':
          const aWears = usageMap.get(a.id)?.total_wears || 0;
          const bWears = usageMap.get(b.id)?.total_wears || 0;
          comparison = bWears - aWears;
          break;
        case 'least_worn':
          const aWearsLeast = usageMap.get(a.id)?.total_wears || 0;
          const bWearsLeast = usageMap.get(b.id)?.total_wears || 0;
          comparison = aWearsLeast - bWearsLeast;
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'desc' ? comparison : -comparison;
    });

    return items;
  }, [clothingItems, filters, usageMap]);

  // Get available filter options
  const availableBrands = useMemo(() => {
    const brands = clothingItems
      .map(item => item.brand)
      .filter((brand): brand is string => Boolean(brand))
      .filter((brand, index, arr) => arr.indexOf(brand) === index)
      .sort();
    return brands;
  }, [clothingItems]);

  const availableColors = useMemo(() => {
    const colors = clothingItems
      .map(item => item.color)
      .filter((color): color is string => Boolean(color))
      .filter((color, index, arr) => arr.indexOf(color) === index)
      .sort();
    return colors;
  }, [clothingItems]);

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      seasons: [],
      occasions: [],
      brand: '',
      color: '',
      sortBy: 'newest',
      sortOrder: 'desc'
    });
  };

  return {
    filters,
    setFilters,
    clearFilters,
    filteredItems,
    availableBrands,
    availableColors,
    isLoading: isLoadingItems || isLoadingUsage,
    totalItems: clothingItems.length,
    filteredCount: filteredItems.length,
    usageMap
  };
};