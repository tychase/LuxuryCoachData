import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Show button when user scrolls down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };
  
  // Scroll to top on click
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);
  
  return (
    <Button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 bg-[var(--navy-900)] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-opacity duration-300 hover:bg-[var(--navy-800)] ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-label="Scroll to top"
    >
      <i className="fas fa-chevron-up"></i>
    </Button>
  );
};

export default ScrollToTop;
