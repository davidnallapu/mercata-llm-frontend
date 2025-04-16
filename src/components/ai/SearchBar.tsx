
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface SearchBarProps {
  onSubmit: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSubmit }) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
      setQuery('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input font-space"
        placeholder="Ask me anything..."
        aria-label="Ask the AI assistant"
      />
      <button 
        type="submit" 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-neon-blue flex items-center justify-center transition-all hover:bg-neon-blue/80"
        aria-label="Submit query"
      >
        <ArrowRight className="w-5 h-5 text-black" />
      </button>
    </form>
  );
};
