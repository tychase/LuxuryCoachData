import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface CoachCardProps {
  id: number;
  title: string;
  year: number;
  make: string;
  model: string;
  price: number | string;
  featuredImage: string;
  features?: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  status?: string;
}

const CoachCard: React.FC<CoachCardProps> = ({
  id,
  title,
  year,
  make,
  model,
  price,
  featuredImage,
  features = [],
  isFeatured = false,
  isNewArrival = false,
  status = 'available'
}) => {
  // Format price for display
  const formattedPrice = typeof price === 'number' 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
    : price;
  
  return (
    <Card className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-[var(--neutral-200)]">
      <div className="relative">
        <img 
          src={featuredImage || "https://images.unsplash.com/photo-1567941723610-db0bcb4cca61?q=80&w=1470&auto=format&fit=crop"} 
          alt={title} 
          className="w-full h-48 object-cover"
        />
        
        {isFeatured && (
          <div className="absolute top-3 right-3 bg-[var(--burgundy-500)] text-white px-3 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}
        
        {isNewArrival && (
          <div className="absolute top-3 right-3 bg-[var(--status-success)] text-white px-3 py-1 rounded-full text-xs font-semibold">
            New Arrival
          </div>
        )}
        
        {status === 'pending' && (
          <div className="absolute top-3 right-3 bg-[var(--status-warning)] text-[var(--navy-900)] px-3 py-1 rounded-full text-xs font-semibold">
            Sale Pending
          </div>
        )}
      </div>
      
      <CardContent className="p-5">
        <h3 className="font-['Playfair_Display'] font-semibold text-lg mb-2">{title}</h3>
        <p className="text-[var(--neutral-500)] text-sm mb-3">{make} {model}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {features.slice(0, 3).map((feature, index) => (
            <Badge key={index} variant="outline" className="bg-[var(--neutral-100)] text-[var(--neutral-700)] px-2 py-1 rounded-md text-xs border-none">
              {feature}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-[var(--navy-900)] font-semibold text-xl">{formattedPrice}</p>
          <Link href={`/coach/${id}`}>
            <a className="text-[var(--gold-500)] hover:text-[var(--gold-700)] font-medium">View Details →</a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoachCard;
