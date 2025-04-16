
import React from 'react';

export const AiEyes: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <svg 
      width="140" 
      height="70" 
      viewBox="0 0 140 70" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Left eye */}
      <g className="animate-pulse" style={{ animationDuration: '3s' }}>
        <circle cx="35" cy="35" r="30" stroke="#00e5ff" strokeWidth="2"/>
        <circle cx="35" cy="35" r="20" stroke="#00e5ff" strokeWidth="2"/>
        <circle cx="35" cy="35" r="5" fill="#00e5ff"/>
      </g>
      
      {/* Right eye */}
      <g className="animate-pulse" style={{ animationDuration: '3s' }}>
        <circle cx="105" cy="35" r="30" stroke="#00e5ff" strokeWidth="2"/>
        <circle cx="105" cy="35" r="20" stroke="#00e5ff" strokeWidth="2"/>
        <circle cx="105" cy="35" r="5" fill="#00e5ff"/>
      </g>
      
      {/* Bridge */}
      <path 
        d="M65 35 H75" 
        stroke="#00e5ff" 
        strokeWidth="4"
      />
    </svg>
  );
};
