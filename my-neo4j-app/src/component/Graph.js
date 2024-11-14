import React, { useEffect, useRef } from 'react';
import { Network, DataSet } from 'vis-network/standalone/esm/vis-network';

const Graph = () => {
  const graphRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/graph-data');
        const data = await response.json();

        // Create DataSets for nodes and edges
        const nodes = new DataSet(data.nodes);
        const edges = new DataSet(data.edges);

        const container = graphRef.current;
        const networkData = { nodes, edges };
        const options = {
          nodes: {
            shape: 'dot',
            size: 16,
            font: {
              size: 16,
            },
          },
          edges: {
            font: {
              size: 12,
            },
            arrows: {
              to: { enabled: true, scaleFactor: 0.5 },
            },
          },
        };

        // Initialize the network graph
        new Network(container, networkData, options);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return <div ref={graphRef} style={{ height: '500px', width: '100%' }}></div>;
};

export default Graph;
