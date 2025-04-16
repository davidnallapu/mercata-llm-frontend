
import React, { useState, useEffect } from 'react';
import { AiOrb } from '@/components/ai/AiOrb';
import { StatusMessages } from '@/components/ai/StatusMessages';
import { MatrixBackground } from '@/components/ai/MatrixBackground';
import { GearBackground } from '@/components/ai/GearBackground';
import { AiMessage } from '@/components/ai/AiMessage';
import { SearchBar } from '@/components/ai/SearchBar';
import { ProcessingOverlay } from '@/components/ai/ProcessingOverlay';
import { VisualEffects } from '@/components/ai/VisualEffects';
import { AnimatedCircuits } from '@/components/ai/AnimatedCircuits';
import { ThinkingIndicator } from '@/components/ai/ThinkingIndicator';

const Index = () => {
  const [messages, setMessages] = useState<{ text: string; isAi: boolean }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initial greeting message after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        { 
          text: "Hello! I'm Mark Attenborough or Mercata for short", 
          isAi: true 
        }
      ]);
      setIsInitialized(true);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleQuerySubmit = (query: string) => {
    // Add user's query to messages
    setMessages(prevMessages => [
      ...prevMessages,
      { text: query, isAi: false }
    ]);
    
    // Simulate AI processing
    setIsProcessing(true);
  };
  
  const handleProcessingComplete = () => {
    setIsProcessing(false);
    
    // Simulate AI response
    const responses = [
      "I understand your query. Let me analyze this for you.",
      "That's an interesting question. Based on my analysis, here's what I found.",
      "I've processed your request and can provide the following information.",
      "According to my neural networks, here's the optimal response to your query."
    ];
    
    // Choose random response
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Add AI response after a short delay
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: randomResponse, isAi: true }
      ]);
    }, 500);
  };
  
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between py-10 px-4 overflow-hidden">
      {/* Ambient background elements */}
      <div className="noise-bg"></div>
      <div className="grid-lines"></div>
      <MatrixBackground />
      <GearBackground />
      <VisualEffects />
      <AnimatedCircuits />
      
      {/* Status messages at top */}
      <StatusMessages />
      
      {/* Main content area */}
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center z-10">
        {/* AI Orb */}
        <AiOrb />
        
        {/* AI thinking indicator (only when processing) */}
        {isProcessing && (
          <div className="my-4">
            <ThinkingIndicator />
          </div>
        )}
        
        {/* Message display area */}
        <div className="w-full flex flex-col items-center mb-12">
          {messages.map((message, index) => (
            message.isAi ? (
              <AiMessage 
                key={index} 
                message={message.text} 
                delay={index === 0 ? 0 : 500} 
              />
            ) : (
              <div 
                key={index} 
                className="self-end mb-4 p-3 rounded-lg bg-neon-purple/20 border border-neon-purple/30 text-white max-w-xl"
              >
                {message.text}
              </div>
            )
          ))}
        </div>
      </div>
      
      {/* Search input at bottom */}
      <div className="w-full max-w-2xl mx-auto mt-auto mb-8 z-10">
        <SearchBar onSubmit={handleQuerySubmit} />
      </div>
      
      {/* Processing overlay */}
      <ProcessingOverlay 
        isProcessing={isProcessing} 
        onProcessingComplete={handleProcessingComplete} 
      />
    </div>
  );
};

export default Index;
