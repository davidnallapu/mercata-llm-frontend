
import React, { useEffect, useRef } from 'react';

export const GearBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const NUM_GEARS = 6;
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    // Create gears
    for (let i = 0; i < NUM_GEARS; i++) {
      const gear = document.createElement('div');
      
      // Determine if this gear spins clockwise or counter-clockwise
      const isClockwise = Math.random() > 0.5;
      gear.className = `gear ${isClockwise ? 'animate-gear-spin' : 'animate-gear-spin-reverse'}`;
      
      // Random size
      const size = 100 + Math.random() * 200;
      gear.style.width = `${size}px`;
      gear.style.height = `${size}px`;
      
      // Random position
      gear.style.left = `${Math.random() * containerWidth - size/2}px`;
      gear.style.top = `${Math.random() * containerHeight - size/2}px`;
      
      // Random animation duration
      gear.style.animationDuration = `${20 + Math.random() * 40}s`;
      
      container.appendChild(gear);
    }
    
    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);
  
  return <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none"></div>;
};
