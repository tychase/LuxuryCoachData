import React from 'react';
import { Link } from 'wouter';
import Logo from './Logo';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  return (
    <header className="bg-[var(--navy-900)] text-white">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <Link href="/">
          <a className="flex items-center mb-4 md:mb-0">
            <div className="mr-3">
              <Logo />
            </div>
            <h1 className="text-2xl font-['Playfair_Display'] font-bold">Prestige Coaches</h1>
          </a>
        </Link>
        
        <nav className="flex items-center">
          <Link href="/">
            <a className="mx-3 hover:text-[var(--gold-500)] transition-colors font-montserrat font-medium">Home</a>
          </Link>
          <Link href="/coaches">
            <a className="mx-3 hover:text-[var(--gold-500)] transition-colors font-montserrat font-medium">Inventory</a>
          </Link>
          <Link href="#about">
            <a className="mx-3 hover:text-[var(--gold-500)] transition-colors font-montserrat font-medium">About</a>
          </Link>
          <Link href="#contact">
            <a className="mx-3 hover:text-[var(--gold-500)] transition-colors font-montserrat font-medium">Contact</a>
          </Link>
          <Button className="ml-6 bg-[var(--gold-500)] hover:bg-[var(--gold-700)] transition-colors text-[var(--navy-900)]">
            Sign In
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
