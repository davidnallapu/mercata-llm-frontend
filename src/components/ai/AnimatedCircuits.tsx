
import React, { useEffect, useRef } from 'react';

export const AnimatedCircuits: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Define circuit nodes
    const nodes: {x: number, y: number, connections: number[]}[] = [];
    const totalNodes = 30;
    
    // Create nodes in a grid-like pattern
    for (let i = 0; i < totalNodes; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      
      nodes.push({
        x,
        y,
        connections: []
      });
    }
    
    // Connect nodes (each node connects to 1-3 closest nodes)
    nodes.forEach((node, i) => {
      // Calculate distances to all other nodes
      const distances = nodes.map((otherNode, j) => {
        if (i === j) return { index: j, distance: Infinity };
        const dx = node.x - otherNode.x;
        const dy = node.y - otherNode.y;
        return {
          index: j,
          distance: Math.sqrt(dx * dx + dy * dy)
        };
      });
      
      // Sort by distance
      distances.sort((a, b) => a.distance - b.distance);
      
      // Connect to closest 1-3 nodes
      const connectionsCount = 1 + Math.floor(Math.random() * 3);
      for (let c = 0; c < connectionsCount && c < distances.length; c++) {
        node.connections.push(distances[c].index);
      }
    });
    
    // Animation variables
    const pulseDuration = 10000; // 10 seconds for a full pulse cycle
    let lastTime = 0;
    let pulsePhase = 0;
    
    // Animation function
    const animate = (currentTime: number) => {
      if (!ctx) return;
      
      // Calculate time delta and update pulse phase
      if (lastTime === 0) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      pulsePhase = (pulsePhase + deltaTime / pulseDuration) % 1;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections with pulse effect
      ctx.lineWidth = 1;
      nodes.forEach((node, i) => {
        node.connections.forEach(connIndex => {
          const connNode = nodes[connIndex];
          
          // Calculate pulse position (0 to 1) along this line
          const dx = connNode.x - node.x;
          const dy = connNode.y - node.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          
          // Draw faded line
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(connNode.x, connNode.y);
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
          ctx.stroke();
          
          // Draw pulse along the line
          const pulsePos = (pulsePhase + i * 0.05) % 1;
          const pulseX = node.x + dx * pulsePos;
          const pulseY = node.y + dy * pulsePos;
          
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
          ctx.fill();
        });
      });
      
      // Draw nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    const animationFrame = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-20 z-0"
    />
  );
};
