import React, { useEffect, useState } from 'react';
import { AiEyes } from './AiEyes';

export const AiOrb: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Simulate AI activation
    const timer = setTimeout(() => {
      setIsActive(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Preload the AI core image
    const img = new Image();
    img.src = "/lovable-uploads/f2324b04-9615-45c0-a004-bbd0053ffa68.png";
    img.onload = () => setIsLoaded(true);
  }, []);
  
  return (
    <div className="relative flex items-center justify-center my-12">
      <div className="absolute animate-rotate-slow opacity-10">
        <div className="w-64 h-64 rounded-full border-2 border-dashed border-steel-gray/30"></div>
      </div>
      <div className="absolute animate-rotate-slow opacity-20" style={{ animationDuration: '25s' }}>
        <div className="w-52 h-52 rounded-full border-2 border-dashed border-neon-blue/20"></div>
      </div>
      
      {/* Replace the image with our new AI eyes */}
      <div className="ai-orb z-10">
        <div className="absolute inset-0 flex items-center justify-center">
          <AiEyes isActive={isActive} />
        </div>
      </div>
      
      <div className="absolute -bottom-6">
        <div className="status-message text-xs">■ Neural core active</div>
      </div>
    </div>
  );
};
