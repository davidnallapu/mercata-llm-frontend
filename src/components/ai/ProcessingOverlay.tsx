
import React, { useEffect, useState } from 'react';
import { ProcessingEffects } from './ProcessingEffects';

interface ProcessingOverlayProps {
  isProcessing: boolean;
  onProcessingComplete?: () => void;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ 
  isProcessing, 
  onProcessingComplete 
}) => {
  const [progress, setProgress] = useState(0);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  
  const messages = [
    "Analyzing query patterns...",
    "Cross-referencing indexing paths...",
    "Accessing neural network...",
    "Processing semantic context...",
    "Optimizing response parameters..."
  ];
  
  useEffect(() => {
    if (!isProcessing) {
      setProgress(0);
      setStatusMessages([]);
      return;
    }
    
    // Simulate processing with increasing progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            onProcessingComplete && onProcessingComplete();
          }, 500);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    
    // Display random status messages during processing
    const messageInterval = setInterval(() => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setStatusMessages(prev => [...prev.slice(-2), randomMessage]);
    }, 1200);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [isProcessing, onProcessingComplete]);
  
  if (!isProcessing) return null;
  
  return (
    <div className="fixed inset-0 bg-dark-bg/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      {/* Matrix effect */}
      <ProcessingEffects />
      
      {/* Spinning gear overlays */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-96 h-96 border-8 border-dashed border-steel-gray/30 rounded-full top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 animate-gear-spin"></div>
        <div className="absolute w-64 h-64 border-8 border-dashed border-steel-gray/30 rounded-full bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 animate-gear-spin-reverse"></div>
      </div>
      
      <div className="text-2xl font-space text-neon-blue mb-8 glowing-text typing-effect">
        Processing Query...
      </div>
      
      {/* Progress bar */}
      <div className="w-64 h-2 bg-dark-bg-accent/50 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-neon-blue rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%`, 
            boxShadow: '0 0 10px rgba(0, 229, 255, 0.7)'
          }}
        ></div>
      </div>
      
      {/* Status messages */}
      <div className="mt-6 text-center">
        {statusMessages.map((message, index) => (
          <div 
            key={index} 
            className="text-sm font-ibm text-neon-blue/80 my-1 animate-flicker"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            {message}
          </div>
        ))}
      </div>
    </div>
  );
};
