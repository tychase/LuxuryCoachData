import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useSearch } from 'wouter';
import SearchFilters from '@/components/SearchFilters';
import CoachCard from '@/components/CoachCard';
import Pagination from '@/components/Pagination';
import { Coach } from '@shared/schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CoachListing: React.FC = () => {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  
  const [currentPage, setCurrentPage] = useState(
    searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1
  );
  
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  
  // Extract filters from URL
  const filters = {
    search: searchParams.get('search') || '',
    year: searchParams.get('year') || '',
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  };
  
  // Fetch coaches with filters
  const { data, isLoading } = useQuery<{ coaches: Coach[], total: number }>({
    queryKey: ['/api/coaches', { 
      ...filters, 
      page: currentPage,
      limit: 6,
    }],
  });
  
  const totalPages = data?.total ? Math.ceil(data.total / 6) : 0;
  
  // Handle filter changes
  const handleApplyFilters = (newFilters: any) => {
    const params = new URLSearchParams();
    
    // Add filters to URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value as string);
      }
    });
    
    // Keep sort value
    if (sortBy) {
      params.set('sortBy', sortBy);
    }
    
    // Reset page to 1 when filters change
    params.set('page', '1');
    
    setCurrentPage(1);
    setLocation(`/coaches?${params.toString()}`);
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    
    const params = new URLSearchParams(search);
    params.set('sortBy', value);
    params.set('page', currentPage.toString());
    
    setLocation(`/coaches?${params.toString()}`);
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    const params = new URLSearchParams(search);
    params.set('page', page.toString());
    
    setLocation(`/coaches?${params.toString()}`);
  };
  
  return (
    <section id="explore" className="bg-white py-10 border-b border-[var(--neutral-200)]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Search Filters */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <SearchFilters
              onApplyFilters={handleApplyFilters}
              initialFilters={filters}
            />
          </div>
          
          {/* Results Section */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-['Playfair_Display'] font-semibold">
                {data?.total === 0 ? 'No Coaches Found' : 
                  data?.total === 1 ? '1 Coach Found' : 
                  `${data?.total || 'Loading'} Coaches Found`}
              </h2>
              <div className="flex items-center">
                <span className="text-sm text-[var(--neutral-500)] mr-2">Sort by:</span>
                <Select 
                  value={sortBy} 
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[180px] p-2 border border-[var(--neutral-300)] rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--gold-300)]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                    <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Coach Cards Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md border border-[var(--neutral-200)] h-80 animate-pulse">
                    <div className="h-48 bg-[var(--neutral-200)]"></div>
                    <div className="p-5">
                      <div className="h-6 bg-[var(--neutral-200)] rounded mb-2"></div>
                      <div className="h-4 bg-[var(--neutral-200)] rounded w-2/3 mb-3"></div>
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 w-20 bg-[var(--neutral-200)] rounded"></div>
                        <div className="h-6 w-20 bg-[var(--neutral-200)] rounded"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-6 w-24 bg-[var(--neutral-200)] rounded"></div>
                        <div className="h-6 w-24 bg-[var(--neutral-200)] rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : data?.coaches.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[var(--neutral-200)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-[var(--neutral-500)] text-xl"></i>
                </div>
                <h3 className="font-['Playfair_Display'] font-semibold text-xl mb-2">No Coaches Found</h3>
                <p className="text-[var(--neutral-500)]">
                  Try adjusting your search filters to find more coaches.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.coaches.map((coach) => (
                  <CoachCard
                    key={coach.id}
                    id={coach.id}
                    title={coach.title}
                    year={coach.year}
                    make={coach.make}
                    model={coach.model}
                    price={coach.price}
                    featuredImage={coach.featuredImage}
                    isFeatured={coach.isFeatured}
                    isNewArrival={coach.isNewArrival}
                    status={coach.status}
                    features={[
                      coach.slideCount ? `${coach.slideCount === 4 ? 'Quad' : coach.slideCount === 3 ? 'Triple' : coach.slideCount === 2 ? 'Double' : 'Single'} Slide` : '',
                      coach.bedType || '',
                      'Luxury Interior'
                    ].filter(Boolean)}
                  />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoachListing;
