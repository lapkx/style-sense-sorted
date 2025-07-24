import { ClothingGrid } from './ClothingGrid';
import { ClothingSearch } from './ClothingSearch';
import { useClothingSearch } from '@/hooks/useClothingSearch';

interface MyClosetProps {
  refreshTrigger?: number;
}

export const MyCloset = ({ refreshTrigger }: MyClosetProps) => {
  const {
    filters,
    setFilters,
    clearFilters,
    filteredItems,
    availableBrands,
    availableColors,
    isLoading
  } = useClothingSearch();

  return (
    <div className="space-y-6">
      <ClothingSearch
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        availableBrands={availableBrands}
        availableColors={availableColors}
      />
      <ClothingGrid
        items={filteredItems}
        loading={isLoading}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};