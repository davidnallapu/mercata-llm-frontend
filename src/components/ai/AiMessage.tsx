
import React, { useState, useEffect } from 'react';
import { TypewriterText } from './TypewriterText';

interface AiMessageProps {
  message: string;
  delay?: number;
}

export const AiMessage: React.FC<AiMessageProps> = ({ message, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(showTimer);
  }, [delay]);
  
  return (
    <div className={`ai-message transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      {isVisible && (
        <TypewriterText 
          text={message} 
          speed={30} 
        />
      )}
    </div>
  );
};
