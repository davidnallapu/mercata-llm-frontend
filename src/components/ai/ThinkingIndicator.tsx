
import React, { useEffect, useState } from 'react';

const thinkingPhrases = [
  "Analyzing input patterns...",
  "Processing neural pathways...",
  "Calculating response vectors...",
  "Optimizing thought matrices...",
  "Generating semantic models...",
  "Cross-referencing knowledge bases...",
  "Evaluating contextual relevance...",
  "Synthesizing response framework..."
];

export const ThinkingIndicator: React.FC = () => {
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [phraseCursor, setPhraseIndex] = useState(0);
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    // Cycle through thinking phrases
    const phraseInterval = setInterval(() => {
      setPhraseIndex(prevIndex => (prevIndex + 1) % thinkingPhrases.length);
      setCurrentPhrase(thinkingPhrases[phraseCursor]);
    }, 2000);
    
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 400);
    
    return () => {
      clearInterval(phraseInterval);
      clearInterval(dotsInterval);
    };
  }, [phraseCursor]);
  
  return (
    <div className="font-ibm text-sm text-neon-blue/80 my-2 animate-pulse">
      <span className="opacity-80">{currentPhrase}</span>
      <span className="ml-1">{dots}</span>
    </div>
  );
};
