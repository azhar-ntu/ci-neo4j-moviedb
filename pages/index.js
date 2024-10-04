import { useState } from 'react';
import Head from 'next/head';
import ActorDetails from '../components/ActorDetails';
import MovieDetails from '../components/MovieDetails';
import SearchBar from '../components/SearchBar';
import GraphVisualization from '../components/GraphVisualization';

export default function Home() {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [graphData, setGraphData] = useState(null);

  const handleSearch = (entity) => {
    setSelectedEntity(entity);
    // Fetch graph data for the selected entity
    // This is a placeholder, you'll need to implement the actual API call
    setGraphData({
      nodes: [{ id: entity.name || entity.title }],
      links: []
    });
  };

  return (
    <div className="container mx-auto px-4">
      <Head>
        <title>Actor and Movie Database</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Actor and Movie Database</h1>
        <SearchBar onSearch={handleSearch} />
        <div className="flex flex-wrap mt-8">
          <div className="w-full md:w-1/2 pr-4">
            {selectedEntity && (selectedEntity.name ? (
              <ActorDetails actor={selectedEntity} />
            ) : (
              <MovieDetails movie={selectedEntity} />
            ))}
          </div>
          <div className="w-full md:w-1/2 pl-4">
            {graphData && <GraphVisualization data={graphData} />}
          </div>
        </div>
      </main>
    </div>
  );
}
