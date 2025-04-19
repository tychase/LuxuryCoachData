import React from 'react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";

const Hero: React.FC = () => {
  return (
    <section className="relative bg-[var(--navy-900)] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1619349983236-9276218b0816?q=80&w=1470&auto=format&fit=crop" 
          alt="Luxury coach interior" 
          className="object-cover w-full h-full opacity-40"
        />
      </div>
      <div className="relative container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold mb-4 leading-tight">
            Experience Unparalleled Luxury on the Road
          </h1>
          <p className="text-lg md:text-xl mb-8 font-montserrat font-light">
            Discover the world's finest luxury coaches, meticulously curated for discerning travelers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              asChild
              size="lg"
              className="px-8 py-3 bg-[var(--gold-500)] hover:bg-[var(--gold-700)] transition-colors text-[var(--navy-900)] rounded font-semibold"
            >
              <Link href="/coaches">
                <a>Explore Collection</a>
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline" 
              size="lg"
              className="px-8 py-3 border border-white hover:bg-white hover:text-[var(--navy-900)] transition-colors rounded font-semibold"
            >
              <Link href="#about">
                <a>Our Services</a>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
