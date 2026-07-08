'use client';
import { useState, useEffect } from 'react';

export function NavbarScrollWrapper({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If we're at the very top, always show
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[100] transition-transform duration-300 ease-in-out flex justify-center pointer-events-none pt-4 ${
        isVisible ? 'translate-y-0' : '-translate-y-[120%]'
      }`}
    >
      {children}
    </div>
  );
}
