"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search, User, Film } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchBar } from "@/components/ui/searchbar";

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => <p>Loading Graph...</p>,
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
        style={{ cursor: "pointer" }}
      >
        {query.split("\n").map((line, i) => (
          <div key={i} className="hover:bg-gray-50">
            {line}
          </div>
        ))}
      </pre>
    </div>
  );
};

const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};
const DetailsCard = ({ data, type }) => {
  if (!data) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const calculateAge = (birthDate, deathDate) => {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();

    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // Actor Card
  if (type === "actor" && data.actor && data.movies) {
    const { actor, movies } = data;
    const imageUrl = actor?.profile_path
      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
      : null;

    const age = calculateAge(actor.date_of_birth, actor.date_of_death);

    return (
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-32 h-40">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={actor.name}
                  className="w-full h-full object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{actor.name}</h2>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Gender:</span>{" "}
                      {actor.gender || "Not specified"}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Born:</span>{" "}
                      {formatDate(actor.date_of_birth)}
                      {age &&
                        ` (${age} years${
                          actor.date_of_death ? " old at death" : ""
                        })`}
                    </p>
                    {actor.date_of_death && (
                      <p className="text-gray-600">
                        <span className="font-medium">Died:</span>{" "}
                        {formatDate(actor.date_of_death)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500">Movies</span>
                  <span className="font-medium text-lg">{movies.length}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div>
                  <span className="text-gray-500">First Movie</span>
                  <p className="font-medium">
                    {movies[movies.length - 1]?.title || "N/A"} (
                    {movies[movies.length - 1]?.year || "N/A"})
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Latest Movie</span>
                  <p className="font-medium">
                    {movies[0]?.title || "N/A"} ({movies[0]?.year || "N/A"})
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Movie Card
  if (type === "movie" && data.movie && data.actors) {
    const { movie, actors } = data;
    const imageUrl = movie?.profile_path
      ? `https://image.tmdb.org/t/p/w185${movie.profile_path}`
      : null;

    return (
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-32 h-48">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                  <Film className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
                  <div className="space-y-1">
                    {movie.year && (
                      <p className="text-gray-600">
                        <span className="font-medium">Release Year:</span>{" "}
                        {movie.year}
                      </p>
                    )}
                    <p className="text-gray-600">
                      <span className="font-medium">Cast:</span> {actors.length}{" "}
                      {actors.length === 1 ? "actor" : "actors"}
                    </p>
                  </div>
                </div>
                {movie.rating && (
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-500">Rating</span>
                    <span className="font-medium text-lg">{movie.rating}</span>
                  </div>
                )}
              </div>

              {movie.overview && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    Overview
                  </h3>
                  <p className="text-sm text-gray-800">{movie.overview}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

const addActorFromTMDB = async (actorName) => {
  try {
    const response = await fetch(
      `http://localhost:10000/add_actor_from_tmdb/${encodeURIComponent(
        actorName
      )}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add actor");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding actor:", error);
    throw error;
  }
};

const NotFoundMessage = ({ type, query, onAddActor }) => (
  <div className="text-center py-12">
    <div className="mb-4">
      <span className="text-6xl">🔍</span>
    </div>
    <h2 className="text-2xl font-bold mb-2">
      No {capitalizeFirstLetter(type)} Found
    </h2>
    <p className="text-gray-600 mb-6">
      We couldn't find any {type === "actor" ? "actor" : "movie"} matching "
      {query}"
    </p>
    {type === "actor" && (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Would you like to add this actor from TMDB?
        </p>
        <Button onClick={onAddActor} className="bg-blue-500 hover:bg-blue-600">
          Add Actor from TMDB
        </Button>
      </div>
    )}
  </div>
);

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ForceGraphRef = useRef();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("actor");
  const [searchResults, setSearchResults] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [showCypherQuery, setShowCypherQuery] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");

  // Initialize state from URL on component mount
  useEffect(() => {
    const query = searchParams.get("q");
    const type = searchParams.get("type");

    if (query) {
      setSearchQuery(query);
      setSearchType(type || "actor");
      handleSearch(query, type || "actor");
    }
  }, []);

  // Update URL when search is performed
  const updateURL = (query, type) => {
    const params = new URLSearchParams();
    params.set("q", query);
    params.set("type", type);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const transformToGraphData = (data, type) => {
    const nodes = [];
    const links = [];

    if (type === "actor" && data?.actor && data?.movies) {
      // Add actor node
      nodes.push({
        id: data.actor.name,
        name: data.actor.name,
        type: "actor",
        val: 20,
      });

      // Add movie nodes and connections
      data.movies.forEach((movie) => {
        nodes.push({
          id: movie.title,
          name: movie.title,
          type: "movie",
          val: 15,
          year: movie.year,
        });

        links.push({
          source: data.actor.name,
          target: movie.title,
        });
      });
    } else if (type === "movie" && data?.movie && data?.actors) {
      // Add movie node in the center
      nodes.push({
        id: data.movie.title,
        name: data.movie.title,
        type: "movie",
        val: 20,
        year: data.movie.year,
      });

      // Add actor nodes and connections
      data.actors.forEach((actor) => {
        nodes.push({
          id: actor.name,
          name: actor.name,
          type: "actor",
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
  const handleTypeChange = (newType) => {
    setSearchType(newType);
    setSearchQuery("");
    setSelectedNode(null);
    setSearchResults(null);
    setGraphData({ nodes: [], links: [] });
    setCurrentQuery("");
    setNotFound(false);
    setLastSearchedQuery("");

    router.push("/", { scroll: false });
  };

  const handleSearch = async (query = searchQuery, type = searchType) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setNotFound(false);
    setSelectedNode(null);
    setLastSearchedQuery(query);
    updateURL(query, type);

    // Set the current Cypher query based on search type
    const cypherQuery =
      type === "actor"
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
      const response = await fetch(
        `http://localhost:10000/${type}s/${encodeURIComponent(query)}/${
          type === "actor" ? "filmography" : "cast"
        }`
      );

      if (response.status === 404) {
        setNotFound(true);
        setSearchResults(null);
        setGraphData({ nodes: [], links: [] });
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      // Check if the response is empty

      if (
        !data ||
        (type === "actor" && (!data.actor || !data.movies?.length)) ||
        (type === "movie" && (!data.movie || !data.actors?.length))
      ) {
        setNotFound(true);
        setSearchResults(null);
        setGraphData({ nodes: [], links: [] });
      } else {
        setSearchResults(data);
        setGraphData(transformToGraphData(data, type));
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback(async (node) => {
    setSelectedNode(node);

    // If clicking on a movie node, search for that movie's cast
    if (node.type === "movie") {
      setSearchQuery(node.name);
      setSearchType("movie");
      await handleSearch(node.name, "movie");
    }
    // If clicking on an actor node, search for that actor's filmography
    else if (node.type === "actor") {
      setSearchQuery(node.name);
      setSearchType("actor");
      await handleSearch(node.name, "actor");
    }
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAddActor = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await addActorFromTMDB(searchQuery);

      // After successfully adding the actor, perform a new search
      if (result) {
        await handleSearch(searchQuery, "actor");
      }
    } catch (error) {
      setError("Failed to add actor from TMDB. Please try again.");
      setNotFound(true); // Keep the not found state if addition fails
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Movie Database Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchType={searchType}
            onSearch={(suggestion) => handleSearch(suggestion || searchQuery)}
            onTypeChange={handleTypeChange}
          />

          {error && (
            <div className="text-red-500 mb-4 p-4 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : notFound ? (
            <NotFoundMessage
              type={searchType}
              query={lastSearchedQuery}
              onAddActor={handleAddActor}
            />
          ) : graphData.nodes.length > 0 ? (
            <div className="space-y-8">
              {searchResults && (
                <DetailsCard data={searchResults} type={searchType} />
              )}
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
              <div className="h-[600px] border rounded-lg overflow-hidden bg-white relative">
                <ForceGraph2D
                  ref={ForceGraphRef}
                  graphData={graphData}
                  nodeLabel="name"
                  nodeColor={(node) =>
                    selectedNode?.id === node.id
                      ? "#fbbf24"
                      : node.type === "actor"
                      ? "#ff6b6b"
                      : "#4ecdc4"
                  }
                  width={window.innerWidth * 0.65} // Reduced from 0.8 to 0.65
                  height={600}
                  centerAt={[window.innerWidth * 0.3, 300]} // Wrapped in array brackets
                  nodeRelSize={8}
                  linkWidth={2}
                  linkColor={() => "#cbd5e1"}
                  backgroundColor="#ffffff"
                  onNodeClick={handleNodeClick}
                  enableZoom={true}
                  minZoom={0.5}
                  maxZoom={4}
                  cooldownTicks={50}
                  linkDistance={100}
                  d3AlphaDecay={0.02}
                  d3VelocityDecay={0.3}
                  autoPauseRedraw={false}
                  nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    const isSelected = selectedNode?.id === node.id;

                    ctx.beginPath();
                    ctx.arc(
                      node.x,
                      node.y,
                      isSelected ? 8 : 5,
                      0,
                      2 * Math.PI,
                      false
                    );
                    ctx.fillStyle = isSelected
                      ? "#fbbf24"
                      : node.type === "actor"
                      ? "#ff6b6b"
                      : "#4ecdc4";
                    ctx.fill();

                    if (isSelected) {
                      ctx.strokeStyle = "#f59e0b";
                      ctx.lineWidth = 2;
                      ctx.stroke();
                    }

                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "#000000";
                    ctx.fillText(label, node.x, node.y + 12);
                  }}
                  onEngineStop={() => {
                    const graphBounds = {
                      x: { min: Infinity, max: -Infinity },
                      y: { min: Infinity, max: -Infinity },
                    };

                    graphData.nodes.forEach((node) => {
                      graphBounds.x.min = Math.min(
                        graphBounds.x.min,
                        node.x || 0
                      );
                      graphBounds.x.max = Math.max(
                        graphBounds.x.max,
                        node.x || 0
                      );
                      graphBounds.y.min = Math.min(
                        graphBounds.y.min,
                        node.y || 0
                      );
                      graphBounds.y.max = Math.max(
                        graphBounds.y.max,
                        node.y || 0
                      );
                    });

                    const graphWidth = graphBounds.x.max - graphBounds.x.min;
                    const graphHeight = graphBounds.y.max - graphBounds.y.min;
                    const graphCenter = {
                      x: (graphBounds.x.min + graphWidth / 2) * 0.8, // Added multiplier to shift left
                      y: graphBounds.y.min + graphHeight / 2,
                    };

                    const zoomLevel =
                      Math.min(
                        (window.innerWidth * 0.65) / graphWidth, // Updated to match new width
                        600 / graphHeight
                      ) * 0.9;

                    ForceGraphRef.current?.centerAt(
                      graphCenter.x,
                      graphCenter.y,
                      1000
                    );
                    ForceGraphRef.current?.zoom(zoomLevel, 1000);
                  }}
                />
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
              </div>
              {/* Results List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-semibold">
                    {searchType === "actor"
                      ? "Filmography (Newest First)"
                      : "Cast (Alphabetical)"}
                  </h2>
                  <div className="text-sm text-gray-500">
                    {searchType === "actor" && searchResults?.movies
                      ? `${searchResults.movies.length} movies`
                      : searchType === "movie" && searchResults?.actors
                      ? `${searchResults.actors.length} actors`
                      : ""}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchType === "actor" && searchResults?.movies
                    ? searchResults.movies.map((movie, index) => (
                        <Card
                          key={index}
                          className={`cursor-pointer transition-colors ${
                            selectedNode?.id === movie.title
                              ? "bg-yellow-50 border-yellow-400"
                              : ""
                          }`}
                          onClick={() =>
                            handleNodeClick({
                              id: movie.title,
                              name: movie.title,
                              type: "movie",
                              year: movie.year,
                            })
                          }
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
                    : searchType === "movie" && searchResults?.actors
                    ? searchResults.actors.map((actor, index) => (
                        <Card
                          key={index}
                          className={`cursor-pointer transition-colors ${
                            selectedNode?.id === actor.name
                              ? "bg-yellow-50 border-yellow-400"
                              : ""
                          }`}
                          onClick={() =>
                            handleNodeClick({
                              id: actor.name,
                              name: actor.name,
                              type: "actor",
                            })
                          }
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
                    : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 h-96 flex items-center justify-center">
              Search for {searchType === "actor" ? "an actor" : "a movie"} to
              see their connections
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
