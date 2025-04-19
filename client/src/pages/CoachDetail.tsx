import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Coach, CoachFeature, CoachImage } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CoachDetailData extends Coach {
  images: CoachImage[];
  features: CoachFeature[];
}

const CoachDetail: React.FC = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const { data: coach, isLoading, error } = useQuery<CoachDetailData>({
    queryKey: [`/api/coaches/${id}`],
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-10 bg-[var(--neutral-200)] w-2/3 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[400px] bg-[var(--neutral-200)] rounded"></div>
            <div>
              <div className="h-8 bg-[var(--neutral-200)] w-1/2 rounded mb-4"></div>
              <div className="h-6 bg-[var(--neutral-200)] w-1/3 rounded mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-[var(--neutral-200)] rounded"></div>
                <div className="h-4 bg-[var(--neutral-200)] rounded"></div>
                <div className="h-4 bg-[var(--neutral-200)] rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !coach) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-['Playfair_Display'] font-semibold mb-4">Coach Not Found</h2>
              <p className="text-[var(--neutral-500)] mb-6">
                The coach you're looking for could not be found or may have been removed.
              </p>
              <Button asChild>
                <Link href="/coaches">
                  <a>Return to Inventory</a>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Format price for display
  const formattedPrice = typeof coach.price === 'number' 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(coach.price))
    : coach.price;
  
  const handleContactClick = () => {
    toast({
      title: "Contact Request Sent",
      description: "Thank you for your interest. A specialist will contact you shortly.",
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center mb-8 text-sm">
        <Link href="/">
          <a className="text-[var(--neutral-500)] hover:text-[var(--gold-500)]">Home</a>
        </Link>
        <span className="mx-2 text-[var(--neutral-400)]">/</span>
        <Link href="/coaches">
          <a className="text-[var(--neutral-500)] hover:text-[var(--gold-500)]">Inventory</a>
        </Link>
        <span className="mx-2 text-[var(--neutral-400)]">/</span>
        <span className="text-[var(--neutral-800)]">{coach.title}</span>
      </div>
      
      {/* Coach Title */}
      <h1 className="text-3xl md:text-4xl font-['Playfair_Display'] font-bold mb-6">{coach.title}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div>
          <div className="mb-4 rounded-lg overflow-hidden bg-[var(--neutral-100)] border border-[var(--neutral-200)]">
            <img 
              src={coach.images[activeImageIndex]?.imageUrl || coach.featuredImage} 
              alt={coach.title} 
              className="w-full h-[400px] object-cover object-center"
            />
          </div>
          
          {/* Thumbnail Gallery */}
          {coach.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {coach.images.map((image, index) => (
                <div 
                  key={image.id}
                  className={`cursor-pointer rounded border-2 ${
                    activeImageIndex === index 
                      ? 'border-[var(--gold-500)]' 
                      : 'border-transparent hover:border-[var(--gold-300)]'
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img 
                    src={image.imageUrl} 
                    alt={`${coach.title} - image ${index + 1}`} 
                    className="w-20 h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Coach Info */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {coach.isFeatured && (
              <Badge className="bg-[var(--burgundy-500)] text-white border-none">
                Featured
              </Badge>
            )}
            {coach.isNewArrival && (
              <Badge className="bg-[var(--status-success)] text-white border-none">
                New Arrival
              </Badge>
            )}
            {coach.status === 'pending' && (
              <Badge className="bg-[var(--status-warning)] text-[var(--navy-900)] border-none">
                Sale Pending
              </Badge>
            )}
          </div>
          
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[var(--navy-900)] mb-2">{formattedPrice}</h2>
            <p className="text-[var(--neutral-500)]">{coach.make} {coach.model} • {coach.year}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {coach.mileage ? (
              <div>
                <p className="text-sm text-[var(--neutral-500)]">Mileage</p>
                <p className="font-medium">{new Intl.NumberFormat('en-US').format(coach.mileage)} miles</p>
              </div>
            ) : null}
            
            {coach.length ? (
              <div>
                <p className="text-sm text-[var(--neutral-500)]">Length</p>
                <p className="font-medium">{coach.length}</p>
              </div>
            ) : null}
            
            {coach.slideCount ? (
              <div>
                <p className="text-sm text-[var(--neutral-500)]">Slides</p>
                <p className="font-medium">
                  {coach.slideCount === 4 ? 'Quad Slide' :
                   coach.slideCount === 3 ? 'Triple Slide' :
                   coach.slideCount === 2 ? 'Double Slide' :
                   'Single Slide'}
                </p>
              </div>
            ) : null}
            
            {coach.bedType ? (
              <div>
                <p className="text-sm text-[var(--neutral-500)]">Bed Type</p>
                <p className="font-medium">{coach.bedType}</p>
              </div>
            ) : null}
            
            {coach.exteriorColor ? (
              <div>
                <p className="text-sm text-[var(--neutral-500)]">Exterior Color</p>
                <p className="font-medium">{coach.exteriorColor}</p>
              </div>
            ) : null}
            
            {coach.interiorColor ? (
              <div>
                <p className="text-sm text-[var(--neutral-500)]">Interior Color</p>
                <p className="font-medium">{coach.interiorColor}</p>
              </div>
            ) : null}
          </div>
          
          {/* Features */}
          {coach.features.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {coach.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="bg-[var(--neutral-100)] text-[var(--neutral-700)] px-3 py-1 rounded-md text-sm border-none">
                    {feature.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button 
              onClick={handleContactClick}
              className="px-6 py-3 bg-[var(--gold-500)] hover:bg-[var(--gold-700)] text-[var(--navy-900)] rounded font-semibold"
              size="lg"
            >
              Contact Specialist
            </Button>
            <Button 
              variant="outline"
              onClick={handleContactClick}
              className="px-6 py-3 border border-[var(--navy-900)] hover:bg-[var(--navy-900)] hover:text-white rounded font-semibold"
              size="lg"
            >
              Schedule Viewing
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-[var(--neutral-500)]">
            <p>Source ID: {coach.sourceId}</p>
          </div>
        </div>
      </div>
      
      {/* Description Tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="border-b border-[var(--neutral-200)] w-full justify-start rounded-none">
          <TabsTrigger value="description" className="text-lg rounded-t-lg py-3 px-6">Description</TabsTrigger>
          <TabsTrigger value="specs" className="text-lg rounded-t-lg py-3 px-6">Specifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="py-6">
          <div className="prose max-w-none">
            <p className="text-[var(--neutral-700)] leading-relaxed">
              {coach.description || 'No detailed description available for this luxury coach.'}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="specs" className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Exterior</h3>
              <ul className="space-y-2">
                <li className="flex justify-between border-b border-[var(--neutral-200)] py-2">
                  <span className="text-[var(--neutral-500)]">Make</span>
                  <span className="font-medium">{coach.make}</span>
                </li>
                <li className="flex justify-between border-b border-[var(--neutral-200)] py-2">
                  <span className="text-[var(--neutral-500)]">Model</span>
                  <span className="font-medium">{coach.model}</span>
                </li>
                <li className="flex justify-between border-b border-[var(--neutral-200)] py-2">
                  <span className="text-[var(--neutral-500)]">Year</span>
                  <span className="font-medium">{coach.year}</span>
                </li>
                {coach.exteriorColor && (
                  <li className="flex justify-between border-b border-[var(--neutral-200)] py-2">
                    <span className="text-[var(--neutral-500)]">Exterior Color</span>
                    <span className="font-medium">{coach.exteriorColor}</span>
                  </li>
                )}
                {coach.length && (
                  <li className="flex justify-between border-b border-[var(--neutral-200)] py-2">
                    <span className="text-[var(--neutral-500)]">Length</span>
                    <span className="font-medium">{coach.length}</span>
                  </li>
                )}
                {coach.slideCount && (
                  <li className="flex justify-between border-b border-[var(--neutral-200)] py-2">
                    <span className="text-[var(--neutral-500)]">Slide Count</span>
                    <span className="font-medium">{coach.slideCount}</span>
                  </li>
                )}
                {coach.mileage && (
                  <li className="flex justify-between border-b border-[var(--neutral-200)] py-2">
                    <span className="text-[var(--neutral-500)]">Mileage</span>
                    <span className="font-medium">{new Intl.NumberFormat('en-US').format(coach.mileage)}</span>
                  </li>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Interior</h3>
              <ul className="space-y-2">
                {coach.interiorColor && (
                  <li className="flex justify-between border-b border-[var(--neutral-200)] py-2">
                    <span className="text-[var(--neutral-500)]">Interior Color</span>
                    <span className="font-medium">{coach.interiorColor}</span>
                  </li>
                )}
                {coach.bedType && (
                  <li className="flex justify-between border-b border-[var(--neutral-200)] py-2">
                    <span className="text-[var(--neutral-500)]">Bed Type</span>
                    <span className="font-medium">{coach.bedType}</span>
                  </li>
                )}
                
                {/* Additional interior features */}
                {coach.features
                  .filter(f => f.name.toLowerCase().includes('interior') || 
                            f.name.toLowerCase().includes('kitchen') || 
                            f.name.toLowerCase().includes('bathroom') ||
                            f.name.toLowerCase().includes('bed'))
                  .map((feature, index) => (
                    <li key={index} className="flex justify-between border-b border-[var(--neutral-200)] py-2">
                      <span className="text-[var(--neutral-500)]">Feature</span>
                      <span className="font-medium">{feature.name}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Disclaimer */}
      <div className="bg-[var(--neutral-100)] p-6 rounded-lg mb-12">
        <h3 className="text-lg font-semibold mb-2">Disclaimer</h3>
        <p className="text-sm text-[var(--neutral-600)]">
          While we strive to provide accurate information, all vehicle information and pricing is subject to verification. 
          We recommend that you confirm all details with a sales representative prior to purchase.
        </p>
      </div>
    </div>
  );
};

export default CoachDetail;
