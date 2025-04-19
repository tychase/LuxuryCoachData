import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import CallToAction from '@/components/CallToAction';
import CoachCard from '@/components/CoachCard';
import { Coach } from '@shared/schema';
import { Link } from 'wouter';

const Home: React.FC = () => {
  // Fetch featured coaches
  const { data, isLoading } = useQuery<{ coaches: Coach[], total: number }>({
    queryKey: ['/api/coaches', { limit: 6, isFeatured: true }],
  });

  return (
    <>
      <Hero />
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-['Playfair_Display'] font-semibold">Featured Coaches</h2>
            <Link href="/coaches">
              <a className="text-[var(--gold-500)] hover:text-[var(--gold-700)] font-medium">
                View All Inventory →
              </a>
            </Link>
          </div>
          
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
        </div>
      </section>
      
      <Features />
      <Testimonials />
      <CallToAction />
    </>
  );
};

export default Home;
