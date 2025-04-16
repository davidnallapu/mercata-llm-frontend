
import React, { useEffect, useState } from 'react';

interface StatusMessagesProps {
  messages?: string[];
}

export const StatusMessages: React.FC<StatusMessagesProps> = ({ 
  messages = [
    "Establishing MK to AI core...",
    "Neural sochs synced.",
    "Quantum linkage stable.",
    "AI kernel online."
  ] 
}) => {
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  
  useEffect(() => {
    const showMessages = async () => {
      for (let i = 0; i < messages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setVisibleMessages(prev => [...prev, messages[i]]);
      }
    };
    
    showMessages();
  }, [messages]);
  
  return (
    <div className="flex justify-between w-full max-w-2xl mx-auto px-4 absolute top-10">
      <div className="status-message">
        {visibleMessages[0] ? `> ${visibleMessages[0]}` : ''}
      </div>
      <div className="status-message">
        {visibleMessages[visibleMessages.length - 1] ? `< ${visibleMessages[visibleMessages.length - 1]}` : ''}
      </div>
    </div>
  );
};
