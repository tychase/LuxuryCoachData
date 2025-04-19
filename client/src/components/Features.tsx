import React from 'react';

const Features: React.FC = () => {
  return (
    <section className="py-16 bg-[var(--neutral-100)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-['Playfair_Display'] font-bold mb-3">The Prestige Difference</h2>
          <p className="text-[var(--neutral-500)] max-w-2xl mx-auto">
            We provide an unparalleled experience for luxury coach buyers with our premium services and attention to detail.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-[var(--neutral-200)] flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[var(--navy-900)] rounded-full flex items-center justify-center mb-5">
              <i className="fas fa-search text-[var(--gold-500)] text-xl"></i>
            </div>
            <h3 className="font-['Playfair_Display'] font-semibold text-xl mb-3">Curated Selection</h3>
            <p className="text-[var(--neutral-500)]">
              We meticulously source and verify each luxury coach in our collection, ensuring only the finest vehicles are presented.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border border-[var(--neutral-200)] flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[var(--navy-900)] rounded-full flex items-center justify-center mb-5">
              <i className="fas fa-shield-alt text-[var(--gold-500)] text-xl"></i>
            </div>
            <h3 className="font-['Playfair_Display'] font-semibold text-xl mb-3">Verified Information</h3>
            <p className="text-[var(--neutral-500)]">
              All coach details are meticulously verified and presented with comprehensive specifications and high-quality imagery.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border border-[var(--neutral-200)] flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[var(--navy-900)] rounded-full flex items-center justify-center mb-5">
              <i className="fas fa-concierge-bell text-[var(--gold-500)] text-xl"></i>
            </div>
            <h3 className="font-['Playfair_Display'] font-semibold text-xl mb-3">Concierge Service</h3>
            <p className="text-[var(--neutral-500)]">
              Our dedicated concierge team assists with all aspects of your purchase, from initial inquiry through delivery and beyond.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
