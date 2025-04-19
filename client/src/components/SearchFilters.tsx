import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface SearchFiltersProps {
  onApplyFilters: (filters: {
    search?: string;
    year?: string;
    make?: string;
    model?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
  }) => void;
  initialFilters?: {
    search?: string;
    year?: string;
    make?: string;
    model?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
  };
  className?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onApplyFilters, 
  initialFilters = {}, 
  className = "" 
}) => {
  const [filters, setFilters] = useState({
    search: initialFilters.search || '',
    year: initialFilters.year || '',
    make: initialFilters.make || '',
    model: initialFilters.model || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
  });
  
  // Fetch available makes, models, and years for filters
  const { data: makes = [] } = useQuery<string[]>({ 
    queryKey: ['/api/makes'] 
  });
  
  const { data: models = [] } = useQuery<string[]>({ 
    queryKey: ['/api/models'] 
  });
  
  const { data: years = [] } = useQuery<number[]>({ 
    queryKey: ['/api/years'] 
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string, name: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(filters);
  };
  
  return (
    <div className={`bg-[var(--neutral-100)] p-6 rounded-lg shadow-sm ${className}`}>
      <h3 className="text-lg font-['Playfair_Display'] font-semibold mb-4">Find Your Coach</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Search input */}
        <div className="mb-4">
          <Label htmlFor="search" className="block text-[var(--neutral-500)] text-sm mb-2">
            Search
          </Label>
          <div className="relative">
            <Input
              id="search"
              name="search"
              value={filters.search}
              onChange={handleInputChange}
              className="w-full p-3 border border-[var(--neutral-300)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold-300)] transition-all"
              placeholder="Keywords..."
            />
            <button className="absolute right-3 top-3 text-[var(--neutral-500)]">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
        
        {/* Year filter */}
        <div className="mb-4">
          <Label htmlFor="year" className="block text-[var(--neutral-500)] text-sm mb-2">
            Year
          </Label>
          <Select 
            value={filters.year} 
            onValueChange={(value) => handleSelectChange(value, 'year')}
          >
            <SelectTrigger className="w-full p-3 border border-[var(--neutral-300)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold-300)] bg-white">
              <SelectValue placeholder="Any Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Year</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Make filter */}
        <div className="mb-4">
          <Label htmlFor="make" className="block text-[var(--neutral-500)] text-sm mb-2">
            Make
          </Label>
          <Select 
            value={filters.make} 
            onValueChange={(value) => handleSelectChange(value, 'make')}
          >
            <SelectTrigger className="w-full p-3 border border-[var(--neutral-300)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold-300)] bg-white">
              <SelectValue placeholder="Any Make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Make</SelectItem>
              {makes.map(make => (
                <SelectItem key={make} value={make}>
                  {make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Model filter */}
        <div className="mb-4">
          <Label htmlFor="model" className="block text-[var(--neutral-500)] text-sm mb-2">
            Model
          </Label>
          <Select 
            value={filters.model} 
            onValueChange={(value) => handleSelectChange(value, 'model')}
          >
            <SelectTrigger className="w-full p-3 border border-[var(--neutral-300)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold-300)] bg-white">
              <SelectValue placeholder="Any Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Model</SelectItem>
              {models.map(model => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Price Range */}
        <div className="mb-6">
          <Label className="block text-[var(--neutral-500)] text-sm mb-2">
            Price Range
          </Label>
          <div className="flex items-center justify-between gap-3">
            <Input
              type="text"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleInputChange}
              className="w-full p-3 border border-[var(--neutral-300)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold-300)]"
              placeholder="Min"
            />
            <span className="text-[var(--neutral-500)]">-</span>
            <Input
              type="text"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleInputChange}
              className="w-full p-3 border border-[var(--neutral-300)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold-300)]"
              placeholder="Max"
            />
          </div>
        </div>
        
        <Button 
          type="submit"
          className="w-full py-3 bg-[var(--navy-900)] hover:bg-[var(--navy-800)] text-white rounded font-medium transition-colors"
        >
          Apply Filters
        </Button>
      </form>
    </div>
  );
};

export default SearchFilters;
