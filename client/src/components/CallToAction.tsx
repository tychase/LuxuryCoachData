import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const CallToAction: React.FC = () => {
  return (
    <section className="py-16 bg-[var(--navy-900)] text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-['Playfair_Display'] font-bold mb-4">Ready to Find Your Dream Coach?</h2>
        <p className="max-w-2xl mx-auto mb-8 text-[var(--neutral-300)]">
          Join thousands of satisfied clients who have discovered their perfect luxury coach through our platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild
            size="lg"
            className="px-8 py-4 bg-[var(--gold-500)] hover:bg-[var(--gold-700)] transition-colors text-[var(--navy-900)] rounded font-semibold"
          >
            <Link href="/coaches">
              <a>Explore Our Collection</a>
            </Link>
          </Button>
          <Button 
            asChild
            variant="outline" 
            size="lg"
            className="px-8 py-4 border border-white hover:bg-white hover:text-[var(--navy-900)] transition-colors rounded font-semibold"
          >
            <Link href="#contact">
              <a>Contact a Specialist</a>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
