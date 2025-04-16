
import React, { useEffect, useState } from 'react';

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
      
      {/* Use the uploaded image as our AI core if loaded */}
      <div className="ai-orb z-10">
        {isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src="/lovable-uploads/f2324b04-9615-45c0-a004-bbd0053ffa68.png" 
              alt="AI Core" 
              className={`w-28 h-28 object-contain transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}
              style={{ filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.8))' }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.8" />
                <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2" strokeOpacity="0.8" fill="rgba(0, 229, 255, 0.4)" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="absolute -bottom-6">
        <div className="status-message text-xs">■ Neural core active</div>
      </div>
    </div>
  );
};
