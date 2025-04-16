
import React from 'react';

export const VisualEffects: React.FC = () => {
  return (
    <>
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Lines that expand outward from center */}
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 8 }).map((_, index) => (
            <div 
              key={index}
              className="absolute w-full h-0.5 bg-neon-blue/5 origin-center animate-pulse"
              style={{ 
                transform: `rotate(${index * 45}deg)`,
                animationDelay: `${index * 0.2}s`
              }}
            />
          ))}
        </div>
        
        {/* Circular pulse from center */}
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 3 }).map((_, index) => (
            <div 
              key={index}
              className="absolute w-64 h-64 rounded-full border border-neon-blue/10 animate-pulse"
              style={{ 
                animationDelay: `${index * 0.7}s`,
                scale: `${1 + index * 0.5}`
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};
