
import React, { useEffect, useRef } from 'react';

export const MatrixBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const MAX_COLUMNS = 20;
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    
    // Create matrix columns
    for (let i = 0; i < MAX_COLUMNS; i++) {
      const column = document.createElement('div');
      column.className = 'matrix-column';
      
      // Random position
      column.style.left = `${Math.random() * containerWidth}px`;
      
      // Random animation delay
      column.style.animationDelay = `${Math.random() * 8}s`;
      
      // Random animation duration
      column.style.animationDuration = `${8 + Math.random() * 10}s`;
      
      // Create matrix characters
      const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
      const columnLength = 10 + Math.floor(Math.random() * 15);
      
      for (let j = 0; j < columnLength; j++) {
        const charIndex = Math.floor(Math.random() * chars.length);
        column.innerHTML += chars[charIndex];
        if (j < columnLength - 1) column.innerHTML += '<br/>';
      }
      
      container.appendChild(column);
    }
    
    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);
  
  return <div ref={containerRef} className="matrix-rain"></div>;
};
