import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectClearItem } from '@/components/ui/select';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface SearchFilters {
  query: string;
  category: string;
  seasons: string[];
  occasions: string[];
  brand: string;
  color: string;
  sortBy: 'newest' | 'oldest' | 'name' | 'most_worn' | 'least_worn';
  sortOrder: 'asc' | 'desc';
}

interface ClothingSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
  availableBrands: string[];
  availableColors: string[];
}

const CATEGORIES = [
  'T-Shirts', 'Shirts', 'Hoodies', 'Sweaters', 'Jackets', 'Coats',
  'Jeans', 'Pants', 'Shorts', 'Shoes', 'Sneakers', 'Boots',
  'Accessories', 'Other'
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

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'most_worn', label: 'Most Worn' },
  { value: 'least_worn', label: 'Least Worn' },
];

export const ClothingSearch = ({
  filters,
  onFiltersChange,
  onClearFilters,
  availableBrands,
  availableColors
}: ClothingSearchProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSortOrder = () => {
    updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const hasActiveFilters = filters.query || filters.category || filters.seasons.length > 0 || 
    filters.occasions.length > 0 || filters.brand || filters.color;

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.category) count++;
    if (filters.seasons.length > 0) count++;
    if (filters.occasions.length > 0) count++;
    if (filters.brand) count++;
    if (filters.color) count++;
    return count;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, brand, color, or category..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <Select value={filters.sortBy} onValueChange={(value: any) => updateFilter('sortBy', value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="px-2"
            >
              {filters.sortOrder === 'asc' ? 
                <SortAsc className="h-4 w-4" /> : 
                <SortDesc className="h-4 w-4" />
              }
            </Button>
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.query && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {filters.query}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => updateFilter('query', '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.category}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => updateFilter('category', '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.seasons.map((season) => (
              <Badge key={season} variant="secondary" className="flex items-center gap-1">
                {season}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => updateFilter('seasons', filters.seasons.filter(s => s !== season))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {filters.occasions.map((occasion) => (
              <Badge key={occasion} variant="secondary" className="flex items-center gap-1">
                {occasion}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => updateFilter('occasions', filters.occasions.filter(o => o !== occasion))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {filters.brand && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Brand: {filters.brand}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => updateFilter('brand', '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.color && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Color: {filters.color}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => updateFilter('color', '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}

        {/* Expandable Filters */}
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectClearItem>All categories</SelectClearItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand</label>
                <Select value={filters.brand} onValueChange={(value) => updateFilter('brand', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectClearItem>All brands</SelectClearItem>
                    {availableBrands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <Select value={filters.color} onValueChange={(value) => updateFilter('color', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All colors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectClearItem>All colors</SelectClearItem>
                    {availableColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Seasons Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Seasons</label>
                <MultiSelect
                  options={SEASON_OPTIONS}
                  selected={filters.seasons}
                  onChange={(selected) => updateFilter('seasons', selected)}
                  placeholder="Select seasons..."
                />
              </div>

              {/* Occasions Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Occasions</label>
                <MultiSelect
                  options={OCCASION_OPTIONS}
                  selected={filters.occasions}
                  onChange={(selected) => updateFilter('occasions', selected)}
                  placeholder="Select occasions..."
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};