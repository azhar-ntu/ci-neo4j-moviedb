"use client";

import { useState, useCallback, useEffect } from 'react';
import { Search, User, Film } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <p>Loading Graph...</p>
});

const CypherQueryDisplay = ({ query }) => {
  if (!query) return null;
  
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-700">Current Cypher Query</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Click query to copy</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(query);
            }}
          >
            Copy
          </Button>
        </div>
      </div>
      <pre
        className="bg-white p-4 rounded-md overflow-x-auto text-sm font-mono text-gray-800"
        onClick={() => {
          navigator.clipboard.writeText(query);
        }}
        style={{ cursor: 'pointer' }}
      >
        {query.split('\n').map((line, i) => (
          <div key={i} className="hover:bg-gray-50">
            {line}
          </div>
        ))}
      </pre>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('actor');
  const [searchResults, setSearchResults] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [showCypherQuery, setShowCypherQuery] = useState(true);

  // Initialize state from URL on component mount
  useEffect(() => {
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    
    if (query) {
      setSearchQuery(query);
      setSearchType(type || 'actor');
      handleSearch(query, type || 'actor');
    }
  }, []);

  // Update URL when search is performed
  const updateURL = (query, type) => {
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('type', type);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const transformToGraphData = (data, type) => {
    const nodes = [];
    const links = [];

    if (type === 'actor' && data?.actor && data?.movies) {
      // Add actor node
      nodes.push({
        id: data.actor.name,
        name: data.actor.name,
        type: 'actor',
        val: 20,
      });

      // Add movie nodes and connections
      data.movies.forEach(movie => {
        nodes.push({
          id: movie.title,
          name: movie.title,
          type: 'movie',
          val: 15,
          year: movie.year
        });

        links.push({
          source: data.actor.name,
          target: movie.title,
        });
      });
    } else if (type === 'movie' && data?.movie && data?.actors) {
      // Add movie node in the center
      nodes.push({
        id: data.movie.title,
        name: data.movie.title,
        type: 'movie',
        val: 20,
        year: data.movie.year
      });

      // Add actor nodes and connections
      data.actors.forEach(actor => {
        nodes.push({
          id: actor.name,
          name: actor.name,
          type: 'actor',
          val: 15,
        });

        links.push({
          source: data.movie.title,
          target: actor.name,
        });
      });
    }

    return { nodes, links };
  };

  const handleSearch = async (query = searchQuery, type = searchType) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    updateURL(query, type);
    
    // Set the current Cypher query based on search type
    const cypherQuery = type === 'actor' 
      ? `MATCH (a:Actor {name: "${query}"})-[:ACTED_IN]->(m:Movie)
WITH a as actor, m
ORDER BY m.year DESC, m.title
WITH actor, collect(m) as movies
RETURN actor, movies`
      : `MATCH (m:Movie {title: "${query}"})
OPTIONAL MATCH (a:Actor)-[:ACTED_IN]->(m)
WITH m as movie, a
ORDER BY a.name
WITH movie, collect(a) as actors
RETURN movie, actors`;
    
    setCurrentQuery(cypherQuery);
    
    try {
      let response;
      if (type === 'actor') {
        console.log(`Fetching actor: ${query}`);
        response = await fetch(`http://localhost:10000/actors/${encodeURIComponent(query)}/filmography`);
      } else {
        console.log(`Fetching movie: ${query}`);
        response = await fetch(`http://localhost:10000/movies/${encodeURIComponent(query)}/cast`);
      }
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      setSearchResults(data);
      
      const newGraphData = transformToGraphData(data, type);
      setGraphData(newGraphData);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback(async (node) => {
    setSelectedNode(node);
    
    // If clicking on a movie node, search for that movie's cast
    if (node.type === 'movie') {
      setSearchQuery(node.name);
      setSearchType('movie');
      await handleSearch(node.name, 'movie');
    }
    // If clicking on an actor node, search for that actor's filmography
    else if (node.type === 'actor') {
      setSearchQuery(node.name);
      setSearchType('actor');
      await handleSearch(node.name, 'actor');
    }
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Movie Database Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-8">
            <div className="flex-1">
              <Input
                placeholder={`Search for ${searchType === 'actor' ? 'an actor' : 'a movie'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={searchType === 'actor' ? 'default' : 'outline'}
                onClick={() => {
                  setSearchType('actor');
                  setSelectedNode(null);
                }}
              >
                <User className="w-4 h-4 mr-2" />
                Actor
              </Button>
              <Button
                variant={searchType === 'movie' ? 'default' : 'outline'}
                onClick={() => {
                  setSearchType('movie');
                  setSelectedNode(null);
                }}
              >
                <Film className="w-4 h-4 mr-2" />
                Movie
              </Button>
            </div>
            <Button onClick={() => handleSearch()}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {error && (
            <div className="text-red-500 mb-4 p-4 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {selectedNode && (
            <div className="mb-4 p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">
                {selectedNode.type === 'actor' ? 'Actor' : 'Movie'}: {selectedNode.name}
              </h3>
              {selectedNode.year && (
                <p className="text-gray-600">Year: {selectedNode.year}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Click on other nodes to explore connections
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : graphData.nodes.length > 0 ? (
            <div className="space-y-8">
              {/* Add Checkbox Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-cypher"
                  checked={showCypherQuery}
                  onCheckedChange={setShowCypherQuery}
                />
                <label
                  htmlFor="show-cypher"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show Cypher Query
                </label>
              </div>

              {/* Conditionally Render CypherQueryDisplay */}
              {showCypherQuery && <CypherQueryDisplay query={currentQuery} />}


              {/* Graph Visualization */}
              <div className="h-[600px] border rounded-lg overflow-hidden bg-white">
                <ForceGraph2D
                  graphData={graphData}
                  nodeLabel="name"
                  nodeColor={node => 
                    selectedNode?.id === node.id 
                      ? '#fbbf24' 
                      : node.type === 'actor' 
                        ? '#ff6b6b' 
                        : '#4ecdc4'
                  }
                  nodeRelSize={8}
                  linkWidth={2}
                  linkColor={() => '#cbd5e1'}
                  backgroundColor="#ffffff"
                  onNodeClick={handleNodeClick}
                  nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12/globalScale;
                    const isSelected = selectedNode?.id === node.id;
                    
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, isSelected ? 8 : 5, 0, 2 * Math.PI, false);
                    ctx.fillStyle = isSelected 
                      ? '#fbbf24' 
                      : node.type === 'actor' 
                        ? '#ff6b6b' 
                        : '#4ecdc4';
                    ctx.fill();
                    
                    if (isSelected) {
                      ctx.strokeStyle = '#f59e0b';
                      ctx.lineWidth = 2;
                      ctx.stroke();
                    }
                    
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#000000';
                    ctx.fillText(label, node.x, node.y + 12);
                  }}
                />
              </div>

              {/* Results List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-semibold">
                    {searchType === 'actor' 
                      ? 'Filmography (Newest First)' 
                      : 'Cast (Alphabetical)'}
                  </h2>
                  <div className="text-sm text-gray-500">
                    {searchType === 'actor' && searchResults?.movies
                      ? `${searchResults.movies.length} movies`
                      : searchType === 'movie' && searchResults?.actors
                      ? `${searchResults.actors.length} actors`
                      : ''}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchType === 'actor' && searchResults?.movies ? (
                    searchResults.movies.map((movie, index) => (
                      <Card 
                        key={index}
                        className={`cursor-pointer transition-colors ${
                          selectedNode?.id === movie.title ? 'bg-yellow-50 border-yellow-400' : ''
                        }`}
                        onClick={() => handleNodeClick({
                          id: movie.title,
                          name: movie.title,
                          type: 'movie',
                          year: movie.year
                        })}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{movie.title}</h3>
                            {movie.year && (
                              <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                                {movie.year}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Click to see cast
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : searchType === 'movie' && searchResults?.actors ? (
                    searchResults.actors.map((actor, index) => (
                      <Card 
                        key={index}
                        className={`cursor-pointer transition-colors ${
                          selectedNode?.id === actor.name ? 'bg-yellow-50 border-yellow-400' : ''
                        }`}
                        onClick={() => handleNodeClick({
                          id: actor.name,
                          name: actor.name,
                          type: 'actor'
                        })}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{actor.name}</h3>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Click to see filmography
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : null}
                </div>
              </div>

              {/* Graph Legend */}
              <div className="flex gap-4 justify-center text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#ff6b6b] mr-2"></div>
                  <span>Actors</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#4ecdc4] mr-2"></div>
                  <span>Movies</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#fbbf24] mr-2"></div>
                  <span>Selected</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 h-96 flex items-center justify-center">
              Search for {searchType === 'actor' ? 'an actor' : 'a movie'} to see their connections
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}