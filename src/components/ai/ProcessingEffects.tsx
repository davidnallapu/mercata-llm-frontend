
import React, { useEffect, useRef } from 'react';

export const ProcessingEffects: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Matrix-like characters
    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const rainDrops: number[] = [];
    
    // Initialize drops at random positions
    for (let i = 0; i < columns; i++) {
      rainDrops[i] = Math.floor(Math.random() * canvas.height / fontSize) * -1;
    }
    
    const draw = () => {
      // Add semi-transparent black rectangle on top of previous frame
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set text style
      ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
      ctx.font = `${fontSize}px monospace`;
      
      // Draw characters
      for (let i = 0; i < columns; i++) {
        // Choose a random character
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        
        // Draw the character
        const x = i * fontSize;
        const y = rainDrops[i] * fontSize;
        
        ctx.fillText(char, x, y);
        
        // If the drop reached the bottom or randomly, reset it to top
        if (y > canvas.height || Math.random() > 0.99) {
          rainDrops[i] = 0;
        } else {
          // Move the drop down
          rainDrops[i]++;
        }
      }
    };
    
    // Animation loop
    const interval = setInterval(draw, 60);
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      clearInterval(interval);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};
