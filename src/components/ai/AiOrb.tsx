
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
    <div className="relative flex items-center justify-between my-12 w-full max-w-2xl mx-auto">
      <div className="relative flex-1">
        <div className="absolute animate-rotate-slow opacity-10">
          <div className="w-64 h-64 rounded-full border-2 border-dashed border-steel-gray/30"></div>
        </div>
        <div className="absolute animate-rotate-slow opacity-20" style={{ animationDuration: '25s' }}>
          <div className="w-52 h-52 rounded-full border-2 border-dashed border-neon-blue/20"></div>
        </div>
        
        <div className="ai-orb z-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <AiEyes isActive={isActive} />
          </div>
        </div>
      </div>

      {/* Status metrics panel */}
      <div className="flex-1 ml-8">
        <div className="bg-dark-bg-accent/30 p-4 rounded-lg border border-neon-blue/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-steel-gray">Neural Core</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse"></div>
                <span className="text-xs text-neon-blue">Active</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-steel-gray">CPU Usage</div>
              <div className="text-xs text-neon-blue">78.3%</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-steel-gray">AI Swarm</div>
              <div className="text-xs text-neon-blue">92.7%</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-steel-gray">Memory Load</div>
              <div className="text-xs text-neon-blue">64.1%</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-steel-gray">Neural Sync</div>
              <div className="text-xs text-neon-blue">99.9%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
