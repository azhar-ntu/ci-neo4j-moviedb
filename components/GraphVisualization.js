import { useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function GraphVisualization({ data }) {
  const graphRef = useRef();

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge').strength(-300);
      graphRef.current.d3Force('link').distance(100);
    }
  }, []);

  return (
    <div className="h-96">
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        nodeLabel="id"
        nodeAutoColorBy="group"
        linkDirectionalParticles={2}
      />
    </div>
  );
}
