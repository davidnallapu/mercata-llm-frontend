import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import DataTable from 'react-data-table-component';

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
  
  // Helper to parse markdown tables into data for react-data-table-component
  const parseTableData = (children: React.ReactNode) => {
    try {
      const tableContent = React.Children.toArray(children);
      const headers: string[] = [];
      const rows: Record<string, any>[] = [];
      
      // Find the thead and extract column names
      const thead = tableContent.find((child: any) => child.type === 'thead');
      if (thead && thead.props && thead.props.children) {
        const headerRow = React.Children.toArray(thead.props.children)[0];
        if (headerRow && headerRow.props && headerRow.props.children) {
          React.Children.forEach(headerRow.props.children, (th: any) => {
            if (th.props && th.props.children) {
              headers.push(String(th.props.children));
            }
          });
        }
      }
      
      // Find the tbody and extract rows
      const tbody = tableContent.find((child: any) => child.type === 'tbody');
      if (tbody && tbody.props && tbody.props.children) {
        React.Children.forEach(tbody.props.children, (tr: any) => {
          if (tr.props && tr.props.children) {
            const rowData: Record<string, any> = {};
            React.Children.forEach(tr.props.children, (td: any, index: number) => {
              if (td.props && td.props.children && headers[index]) {
                rowData[headers[index]] = td.props.children;
              }
            });
            rows.push(rowData);
          }
        });
      }
      
      return { columns: headers.map(h => ({ name: h, selector: (row: any) => row[h] })), data: rows };
    } catch (error) {
      console.error('Error parsing table data:', error);
      return { columns: [], data: [] };
    }
  };

  // Custom theme for DataTable - improving text contrast for better readability
  const customTableStyles = {
    table: {
      style: {
        backgroundColor: '#1f2937',
        color: 'white',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#374151',
        color: '#00FFFF', // Keeping bright color for headers
        fontWeight: 'bold',
        borderBottom: '1px solid #4B5563',
      },
    },
    headCells: {
      style: {
        padding: '16px',
        fontSize: '1rem',
      },
    },
    rows: {
      style: {
        backgroundColor: '#1f2937',
        '&:nth-of-type(odd)': {
          backgroundColor: '#111827',
        },
        '&:hover': {
          backgroundColor: '#2d3748',
          cursor: 'pointer',
        },
        minHeight: '48px',
      },
    },
    cells: {
      style: {
        padding: '16px',
        fontSize: '0.9rem',
        color: 'white', // Ensuring cell text is white for better contrast
      },
    },
    pagination: {
      style: {
        color: 'white', // Ensuring pagination text is white
        backgroundColor: '#1f2937',
      },
      pageButtonsStyle: {
        color: 'white',
        fill: 'white',
      },
    },
  };

  // Fixed renderResponse function to properly handle tables
  const renderResponse = (markdownContent: string) => {
    // Check if the content contains table markers
    if (markdownContent.includes('|') && markdownContent.includes('\n')) {
      // Extract tables from markdown content
      const lines = markdownContent.split('\n');
      const tableSegments = [];
      const otherSegments = [];
      
      let inTable = false;
      let currentTable = '';
      let currentNonTable = '';
      
      // Process the markdown content line by line
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if this line looks like part of a table (has multiple | characters)
        if (line.trim().startsWith('|') && line.trim().endsWith('|') && line.split('|').length > 2) {
          if (!inTable) {
            // Add accumulated non-table content
            if (currentNonTable) {
              otherSegments.push(currentNonTable);
              currentNonTable = '';
            }
            inTable = true;
            currentTable = line + '\n';
          } else {
            currentTable += line + '\n';
          }
        } else {
          if (inTable) {
            // End of a table
            if (currentTable.trim()) {
              tableSegments.push(currentTable);
              currentTable = '';
            }
            inTable = false;
            currentNonTable = line + '\n';
          } else {
            currentNonTable += line + '\n';
          }
        }
      }
      
      // Add final segments
      if (inTable && currentTable.trim()) {
        tableSegments.push(currentTable);
      }
      if (currentNonTable.trim()) {
        otherSegments.push(currentNonTable);
      }
      
      // If we found tables, render the content with tables properly integrated
      if (tableSegments.length > 0) {
        return (
          <div>
            {otherSegments.map((segment, segmentIndex) => {
              // Find if there should be a table after this segment
              if (segmentIndex < tableSegments.length) {
                return (
                  <React.Fragment key={segmentIndex}>
                    <ReactMarkdown
                      components={{
                        code({node, inline, className, children, ...props}) {
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
                        // Include other component customizations but exclude table-related ones
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
                      {segment}
                    </ReactMarkdown>
                    
                    {/* Render table after this segment */}
                    {(() => {
                      const tableContent = tableSegments[segmentIndex];
                      const parsedTable = parseMarkdownTable(tableContent);
                      if (parsedTable.columns.length > 0) {
                        return (
                          <div className="my-6 overflow-hidden rounded-lg">
                            <DataTable
                              columns={parsedTable.columns}
                              data={parsedTable.data}
                              customStyles={customTableStyles}
                              pagination
                              highlightOnHover
                              responsive
                              striped
                            />
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </React.Fragment>
                );
              } else {
                // Just render the segment without a table
                return (
                  <ReactMarkdown
                    key={segmentIndex}
                    components={{
                      code({node, inline, className, children, ...props}) {
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
                      // Include other component customizations
                      pre({node, children, ...props}) {
                        return (
                          <pre className="bg-gray-900 p-3 rounded-md overflow-x-auto text-sm font-mono" {...props}>
                            {children}
                          </pre>
                        );
                      },
                      // ... other components as in the original code
                    }}
                  >
                    {segment}
                  </ReactMarkdown>
                );
              }
            })}
            
            {/* If there are more tables than non-table segments, render the remaining tables */}
            {tableSegments.slice(otherSegments.length).map((tableContent, index) => {
              const parsedTable = parseMarkdownTable(tableContent);
              if (parsedTable.columns.length > 0) {
                return (
                  <div key={`extra-table-${index}`} className="my-6 overflow-hidden rounded-lg">
                    <DataTable
                      columns={parsedTable.columns}
                      data={parsedTable.data}
                      customStyles={customTableStyles}
                      pagination
                      highlightOnHover
                      responsive
                      striped
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        );
      }
    }
    
    // Default rendering if no tables detected - unchanged
    return (
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
        {markdownContent}
      </ReactMarkdown>
    );
  };

  // Fix the parseMarkdownTable function to better handle the table format
  const parseMarkdownTable = (tableContent: string) => {
    const lines = tableContent.split('\n').filter(line => line.trim());
    if (lines.length < 3) return { columns: [], data: [] };
    
    // Parse headers - remove leading/trailing pipes and split by pipes
    const headerLine = lines[0];
    const headers = headerLine
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);
    
    // Skip the separator line (index 1)
    
    // Parse data rows
    const data = [];
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const rowData = {};
      const cells = line
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
      
      // Match cells to headers
      headers.forEach((header, idx) => {
        if (idx < cells.length) {
          rowData[header] = cells[idx];
        } else {
          rowData[header] = ''; // Empty cell if no data
        }
      });
      
      data.push(rowData);
    }
    
    return {
      columns: headers.map(h => ({ 
        name: h, 
        selector: (row: any) => row[h],
        sortable: true,
        cell: (row) => <div className="text-white">{row[h]}</div> // Ensure text is white for visibility
      })),
      data
    };
  };

  // Create a conversation-style layout
  return (
    <div className="flex flex-col h-full w-full max-w-10xl mx-auto">
      {/* Conversation area (scrollable) */}
      <div className="flex-grow overflow-y-auto mb-4 space-y-6">
        {/* Show past queries and responses in a conversation style */}
        {queryHistory.length > 0 && (
          <div className="space-y-6">
            {queryHistory.map((q, index) => (
              <div key={index} className="space-y-4">
                {/* User query */}
                <div className="flex justify-end">
                  <div className="bg-neon-blue text-black rounded-lg p-3 max-w-[70%]">
                    <p>{q}</p>
                  </div>
                </div>
                
                {/* AI response - show either completed response or loading state */}
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-lg p-4 max-w-[95%] w-full">
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
                          {renderResponse(response)}
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
        <form onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto">
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
