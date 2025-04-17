import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SearchBarProps {
  onSubmit: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSubmit }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [currentIteration, setCurrentIteration] = useState<number | null>(null);
  const [maxIterations, setMaxIterations] = useState<number | null>(null);
  const [iterationHistory, setIterationHistory] = useState<string[]>([]);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
      
      // Save current query before resetting
      const currentQuery = query;
      
      // Check if this query is already the last one in history to prevent duplicates
      if (queryHistory.length === 0 || queryHistory[queryHistory.length - 1] !== currentQuery) {
        // Add query to history only if it's not a duplicate of the last query
        setQueryHistory(prev => [...prev, currentQuery]);
      }
      
      setLoading(true);
      setResponse(null);
      setLogs([]);
      setStatus('Starting query...');
      setCurrentIteration(null);
      setMaxIterations(null);
      setIterationHistory([]);
      
      // Stream query from localhost:5000
      fetch('http://localhost:5000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: currentQuery,
          min_iterations: 3,
          max_iterations: 8,
          model: 'gpt-4.1',
          stream: true // Enable streaming
        }),
      })
      .then(response => {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        const processStream = async () => {
          if (!reader) return;
          
          try {
            const { done, value } = await reader.read();
            
            if (done) {
              setLoading(false);
              setStatus('Complete');
              return;
            }
            
            // Process the stream data
            const chunk = decoder.decode(value);
            
            // Process each line separately (each is a JSON object)
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              try {
                const event = JSON.parse(line);
                
                // Update UI based on event type
                switch (event.type) {
                  case 'start':
                    setStatus(`Query started: ${event.query}`);
                    setLogs(prev => [...prev, `Query started: ${event.query}`]);
                    break;
                  case 'log':
                    setStatus(event.message);
                    setLogs(prev => [...prev, event.message]);
                    break;
                  case 'iteration_start':
                    setCurrentIteration(event.iteration);
                    setMaxIterations(event.max_iterations);
                    setIterationHistory(prev => [...prev, `Iteration ${event.iteration} of ${event.max_iterations}`]);
                    setLogs(prev => [...prev, `Starting iteration ${event.iteration}/${event.max_iterations}`]);
                    break;
                  case 'llm_response':
                    setLogs(prev => [...prev, `LLM response for iteration ${event.iteration}`]);
                    break;
                  case 'iteration_complete':
                    setLogs(prev => [...prev, `Completed iteration ${event.iteration}/${event.max_iterations}`]);
                    break;
                  case 'result':
                    setResponse(event.response);
                    setLogs(prev => [...prev, `Received final response`]);
                    setLoading(false);
                    setStatus('Complete');
                    break;
                  case 'error':
                    setLogs(prev => [...prev, `Error: ${event.message}`]);
                    setStatus(`Error: ${event.message}`);
                    setLoading(false);
                    break;
                  default:
                    // Handle legacy or unknown event types
                    setLogs(prev => [...prev, `Event: ${event.type || 'unknown'}`]);
                    
                    // Handle legacy event types for backward compatibility
                    if (event.type === 'status') {
                      setStatus(event.message);
                    } else if (event.type === 'response' && event.content) {
                      if (event.partial) {
                        setResponse(prev => (prev || '') + event.content);
                      } else {
                        setResponse(event.content);
                      }
                      
                      if (event.final === true) {
                        setLoading(false);
                        setStatus('Complete');
                      }
                    }
                }
              } catch (e) {
                console.error('Error parsing event:', e, line);
                setLogs(prev => [...prev, `Error parsing event: ${String(e)}, Raw data: ${line}`]);
              }
            }
            
            // Continue reading
            processStream();
          } catch (error) {
            console.error('Error reading stream:', error);
            setLoading(false);
            setStatus('Error reading stream');
          }
        };
        
        processStream();
      })
      .catch(error => {
        console.error('Error sending query to server:', error);
        setLoading(false);
        setStatus('Error connecting to server');
      });
      
      setQuery('');
    }
  };
  
  // Debug info
  console.log("Render state:", { 
    queryHistory, 
    responseExists: !!response, 
    loading,
    queryHistoryLength: queryHistory.length
  });
  
  // Create a conversation-style layout
  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto">
      {/* Conversation area (scrollable) */}
      <div className="flex-grow overflow-y-auto mb-4 space-y-6">
        {/* Show past queries and responses in a conversation style */}
        {queryHistory.length > 0 && (
          <div className="space-y-6">
            {queryHistory.map((q, index) => (
              <div key={index} className="space-y-4">
                {/* User query */}
                <div className="flex justify-end">
                  <div className="bg-neon-blue text-black rounded-lg p-3 max-w-[80%]">
                    <p>{q}</p>
                  </div>
                </div>
                
                {/* AI response - show either completed response or loading state */}
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-lg p-4 max-w-[90%] w-full">
                    {index === queryHistory.length - 1 ? (
                      loading ? (
                        <div className="flex flex-col">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mr-2"></div>
                            <p className="text-gray-300">{status || 'Processing...'}</p>
                          </div>
                          
                          {iterationHistory.length > 0 && (
                            <div className="mb-2 text-sm text-gray-400">
                              {iterationHistory.map((iteration, i) => (
                                <div key={i}>{iteration}</div>
                              ))}
                            </div>
                          )}
                          
                          {logs.length > 0 && (
                            <details className="mt-2">
                              <summary className="text-sm text-gray-400 cursor-pointer">Show processing logs</summary>
                              <pre className="whitespace-pre-wrap text-xs text-gray-400 font-mono mt-2 bg-gray-900 p-2 rounded">
                                {logs.join('\n')}
                              </pre>
                            </details>
                          )}
                        </div>
                      ) : response ? (
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              code({node, inline, className, children, ...props}: {
                                node: any;
                                inline?: boolean;
                                className?: string;
                                children: React.ReactNode;
                                [key: string]: any;
                              }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={tomorrow}
                                    language={match[1]}
                                    PreTag="div"
                                    className="rounded-md"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={`bg-gray-700 px-1 py-0.5 rounded text-white font-mono text-sm`} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              table({node, children, ...props}) {
                                return (
                                  <div className="overflow-x-auto">
                                    <table className="border-collapse border border-gray-600 my-4 w-full" {...props}>
                                      {children}
                                    </table>
                                  </div>
                                );
                              },
                              th({node, children, ...props}) {
                                return (
                                  <th className="border border-gray-600 bg-gray-700 p-2 text-left" {...props}>
                                    {children}
                                  </th>
                                );
                              },
                              td({node, children, ...props}) {
                                return (
                                  <td className="border border-gray-600 p-2" {...props}>
                                    {children}
                                  </td>
                                );
                              },
                              pre({node, children, ...props}) {
                                return (
                                  <pre className="bg-gray-900 p-3 rounded-md overflow-x-auto text-sm font-mono" {...props}>
                                    {children}
                                  </pre>
                                );
                              },
                              p({node, children, ...props}) {
                                return (
                                  <p className="mb-4 leading-relaxed" {...props}>
                                    {children}
                                  </p>
                                );
                              },
                              h1({node, children, ...props}) {
                                return <h1 className="text-2xl font-bold mb-4 text-neon-blue" {...props}>{children}</h1>;
                              },
                              h2({node, children, ...props}) {
                                return <h2 className="text-xl font-bold mb-3 text-neon-blue" {...props}>{children}</h2>;
                              },
                              h3({node, children, ...props}) {
                                return <h3 className="text-lg font-bold mb-2 text-neon-blue" {...props}>{children}</h3>;
                              },
                              ul({node, children, ...props}) {
                                return <ul className="list-disc pl-6 mb-4 space-y-2" {...props}>{children}</ul>;
                              },
                              ol({node, children, ...props}) {
                                return <ol className="list-decimal pl-6 mb-4 space-y-2" {...props}>{children}</ol>;
                              },
                              li({node, children, ...props}) {
                                return <li className="mb-1" {...props}>{children}</li>;
                              },
                              blockquote({node, children, ...props}) {
                                return (
                                  <blockquote className="border-l-4 border-neon-blue pl-4 italic my-4" {...props}>
                                    {children}
                                  </blockquote>
                                );
                              },
                              a({node, children, ...props}) {
                                return (
                                  <a className="text-neon-blue hover:underline" {...props}>
                                    {children}
                                  </a>
                                );
                              },
                              hr({...props}) {
                                return <hr className="my-4 border-gray-600" {...props} />;
                              },
                            }}
                          >
                            {response}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-gray-300">Waiting for response...</p>
                      )
                    ) : (
                      <p className="text-gray-300">Previous response</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Fixed search input at the bottom */}
      <div className="sticky bottom-0 bg-gray-900 pt-4 pb-4">
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
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowRight className="w-5 h-5 text-black" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
