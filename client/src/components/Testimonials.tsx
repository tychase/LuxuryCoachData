import React from 'react';

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-['Playfair_Display'] font-bold mb-3">Client Testimonials</h2>
          <p className="text-[var(--neutral-500)] max-w-2xl mx-auto">
            Hear from our satisfied clients about their experience with Prestige Coaches.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[var(--neutral-100)] p-8 rounded-lg">
              <div className="text-[var(--gold-500)] mb-4">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p className="italic text-[var(--neutral-700)] mb-6">
                "The team at Prestige Coaches made finding our dream coach an absolute pleasure. Their attention to detail and knowledge of the market is unmatched. We couldn't be happier with our Prevost H3-45."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[var(--navy-900)] rounded-full flex items-center justify-center mr-4 text-white font-semibold">
                  JD
                </div>
                <div>
                  <h4 className="font-semibold">Jonathan Davis</h4>
                  <p className="text-sm text-[var(--neutral-500)]">Marathon Coach Owner</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[var(--neutral-100)] p-8 rounded-lg">
              <div className="text-[var(--gold-500)] mb-4">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p className="italic text-[var(--neutral-700)] mb-6">
                "After searching for months on my own, I found Prestige Coaches and they helped me locate the perfect Prevost within weeks. Their platform made the search process incredibly easy and transparent."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[var(--navy-900)] rounded-full flex items-center justify-center mr-4 text-white font-semibold">
                  SM
                </div>
                <div>
                  <h4 className="font-semibold">Sarah Mitchell</h4>
                  <p className="text-sm text-[var(--neutral-500)]">Liberty Coach Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
