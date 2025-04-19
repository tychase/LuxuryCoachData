import React from 'react';
import { Link } from 'wouter';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--navy-800)] text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/">
              <a className="flex items-center mb-4">
                <div className="mr-3">
                  <Logo />
                </div>
                <h3 className="text-xl font-['Playfair_Display'] font-bold">Prestige Coaches</h3>
              </a>
            </Link>
            <p className="text-[var(--neutral-300)] mb-4">
              Connecting discerning buyers with the world's finest luxury coaches since 2010.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-[var(--neutral-400)] hover:text-[var(--gold-500)] transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-[var(--neutral-400)] hover:text-[var(--gold-500)] transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-[var(--neutral-400)] hover:text-[var(--gold-500)] transition-colors">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="#" className="text-[var(--neutral-400)] hover:text-[var(--gold-500)] transition-colors">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-['Playfair_Display'] font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-[var(--neutral-300)] hover:text-[var(--gold-500)] transition-colors">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/coaches">
                  <a className="text-[var(--neutral-300)] hover:text-[var(--gold-500)] transition-colors">Inventory</a>
                </Link>
              </li>
              <li>
                <Link href="#about">
                  <a className="text-[var(--neutral-300)] hover:text-[var(--gold-500)] transition-colors">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="#services">
                  <a className="text-[var(--neutral-300)] hover:text-[var(--gold-500)] transition-colors">Services</a>
                </Link>
              </li>
              <li>
                <Link href="#blog">
                  <a className="text-[var(--neutral-300)] hover:text-[var(--gold-500)] transition-colors">Blog</a>
                </Link>
              </li>
              <li>
                <Link href="#contact">
                  <a className="text-[var(--neutral-300)] hover:text-[var(--gold-500)] transition-colors">Contact</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-['Playfair_Display'] font-semibold text-lg mb-4">Coach Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/coaches?model=H3-45">
                  <a className="text-[var(--neutral-300)] hover:text-[var(--gold-500)] transition-colors">Prevost H3-45</a>
                </Link>
              </li>
              <li>
                <Link href="/coaches?model=X3-45">
                  <a className="text-[var(--neutral-300)] hover:text-[var(--gold-500)] transition-colors">Prevost X3-45</a>
                </Link>
              </li>
              <li>
                <Link href="/coaches?make=Marathon">
                  <a className="text-[var(--neutral-300)] hover:text-[var(--gold-500)] transition-colors">Marathon Coaches</a>
                </Link>
              </li>
              <li>
                <Link href="/coaches?make=Liberty">
                  <a className="text-[var(--neutral-300)] hover:text-[var(--gold-500)] transition-colors">Liberty Coaches</a>
                </Link>
              </li>
              <li>
                <Link href="/coaches?make=Millennium">
                  <a className="text-[var(--neutral-300)] hover:text-[var(--gold-500)] transition-colors">Millennium Coaches</a>
                </Link>
              </li>
              <li>
                <Link href="/coaches?make=Emerald">
                  <a className="text-[var(--neutral-300)] hover:text-[var(--gold-500)] transition-colors">Emerald Coaches</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-['Playfair_Display'] font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-[var(--gold-500)]"></i>
                <span className="text-[var(--neutral-300)]">
                  123 Luxury Lane<br />Suite 400<br />Beverly Hills, CA 90210
                </span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone mr-3 text-[var(--gold-500)]"></i>
                <span className="text-[var(--neutral-300)]">(800) 555-COACH</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-3 text-[var(--gold-500)]"></i>
                <span className="text-[var(--neutral-300)]">info@prestigecoaches.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[var(--navy-700)] pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[var(--neutral-400)] text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Prestige Coaches. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-[var(--neutral-400)] text-sm hover:text-[var(--gold-500)] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-[var(--neutral-400)] text-sm hover:text-[var(--gold-500)] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-[var(--neutral-400)] text-sm hover:text-[var(--gold-500)] transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
