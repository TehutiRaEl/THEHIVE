/**
 * MemoryGraphEnhanced.tsx
 * Enhanced memory graph with philosophy node treatment
 * Source: /v11/memory/graph + philosophy node treatment
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { useUIStore } from '../stores/uiStore';
import { MemoryNode, MemoryLink } from '../types';
import { getMemoryGraph } from '../services/api';

// Fallback mock data in case API fails
function generateFallbackMemoryGraphData(): { nodes: MemoryNode[]; links: MemoryLink[] } {
  const nodes: MemoryNode[] = [
    { id: 'THEHIVE', type: 'colony', name: 'THEHIVE', x: 0, y: 0, z: 0, size: 40, color: '#FFD700' },
    { id: 'NAR2', type: 'colony', name: 'NAR2', x: 100, y: -50, z: 0, size: 30, color: '#FF6B35' },
    { id: 'LocalAGI', type: 'colony', name: 'LocalAGI', x: -100, y: -50, z: 0, size: 25, color: '#00C851' },
    { id: 'hive-mind', type: 'hive', name: 'Hive Mind', x: 0, y: 50, z: 0, size: 35, color: '#FFD700' },
    { id: 'repo-soul', type: 'repo', name: 'Soul', x: 0, y: 150, z: 0, size: 25, color: '#33B5E5' },
    { id: 'philosophy-maat', type: 'philosophy', name: 'Maat', x: 0, y: -150, z: 0, size: 50, color: '#FFFFFF' }
  ];
  const links: MemoryLink[] = [
    { source: 'THEHIVE', target: 'NAR2', type: 'workflow', weight: 3 },
    { source: 'hive-mind', target: 'THEHIVE', type: 'coordination', weight: 5 },
    { source: 'repo-soul', target: 'THEHIVE', type: 'constitution', weight: 5 },
    { source: 'philosophy-maat', target: 'THEHIVE', type: 'foundation', weight: 5 }
  ];
  return { nodes, links };
}

// Function to normalize API memory graph data
const normalizeMemoryGraphData = (apiData: any): { nodes: MemoryNode[]; links: MemoryLink[] } => {
  if (!apiData) return generateFallbackMemoryGraphData();
  
  // Handle different API response formats
  if (apiData.nodes && apiData.links) {
    // Already in the expected format
    const nodes = Array.isArray(apiData.nodes) ? apiData.nodes : [apiData.nodes];
    const links = Array.isArray(apiData.links) ? apiData.links : [apiData.links];
    return { nodes, links };
  } else if (Array.isArray(apiData)) {
    // Array of nodes - try to extract links or create from relationships
    return { nodes: apiData, links: [] };
  } else if (typeof apiData === 'object') {
    // Single object - try to extract nodes and links
    const nodes = apiData.nodes || apiData.data || [apiData];
    const links = apiData.links || apiData.edges || [];
    return { nodes: Array.isArray(nodes) ? nodes : [nodes], links: Array.isArray(links) ? links : [links] };
  }
  
  return generateFallbackMemoryGraphData();
};

const NODE_CONFIG = {
  colony: { icon: '🏰', baseSize: 30 },
  hive: { icon: '🐝', baseSize: 25 },
  repo: { icon: '📁', baseSize: 20 },
  philosophy: { icon: '🕊️', baseSize: 40 }
};

const LINK_CONFIG = {
  workflow: { color: '#33B5E5', width: 2 },
  coordination: { color: '#FFD700', width: 3 },
  constitution: { color: '#FFFFFF', width: 3 },
  foundation: { color: '#FFFFFF', width: 4 }
};

interface MemoryGraphEnhancedProps {
  data?: { nodes: MemoryNode[]; links: MemoryLink[] };
}

const MemoryGraphEnhanced: React.FC<MemoryGraphEnhancedProps> = ({ data }) => {
  const { theme } = useUIStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [graphData, setGraphData] = useState<{ nodes: MemoryNode[]; links: MemoryLink[] }>(generateFallbackMemoryGraphData());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  // Fetch memory graph data from API
  useEffect(() => {
    const fetchMemoryGraphData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If data is provided via props, use it
        if (data) {
          setGraphData(normalizeMemoryGraphData(data));
        } else {
          // Fetch from API
          const apiData = await getMemoryGraph();
          setGraphData(normalizeMemoryGraphData(apiData));
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch memory graph data');
        console.error('Error fetching memory graph data:', err);
        // Keep fallback data on error
      } finally {
        setLoading(false);
      }
    };

    fetchMemoryGraphData();
  }, [data]);

  const filteredData = useMemo(() => {
    let filteredNodes = graphData.nodes;
    let filteredLinks = graphData.links;
    if (filterType) {
      filteredNodes = filteredNodes.filter(n => n.type === filterType);
      const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = filteredLinks.filter(l => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target));
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredNodes = filteredNodes.filter(n => n.name.toLowerCase().includes(query) || n.id.toLowerCase().includes(query));
      const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = filteredLinks.filter(l => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target));
    }
    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, searchQuery, filterType]);

  const nodeTypes = useMemo(() => Array.from(new Set(graphData.nodes.map(n => n.type))), [graphData]);
  const nodeTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    graphData.nodes.forEach(n => { counts[n.type] = (counts[n.type] || 0) + 1; });
    return counts;
  }, [graphData]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    svg.selectAll('*').remove();
    const g = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 10]).on('zoom', (event) => {
      g.attr('transform', event.transform.toString());
    });
    svg.call(zoom);

    const simulation = d3.forceSimulation<MemoryNode>(filteredData.nodes as any)
      .force('link', d3.forceLink<MemoryNode, MemoryLink>(filteredData.links as any).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody<MemoryNode>().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<MemoryNode>().radius((d: any) => (d.size || 20) + 5));

    const link = g.append('g').selectAll('line').data(filteredData.links as any).enter().append('line')
      .attr('stroke', (d: any) => (LINK_CONFIG[d.type as keyof typeof LINK_CONFIG] || LINK_CONFIG.workflow).color)
      .attr('stroke-width', (d: any) => (LINK_CONFIG[d.type as keyof typeof LINK_CONFIG] || LINK_CONFIG.workflow).width * (d.weight || 1))
      .attr('stroke-opacity', 0.6);

    const node = g.append('g').selectAll('g').data(filteredData.nodes as any).enter().append('g')
      .call((d3.drag<SVGGElement, MemoryNode>() as any).on('start', dragstarted).on('drag', dragged).on('end', dragended));

    node.append('circle')
      .attr('r', (d: any) => {
        const config = NODE_CONFIG[d.type as keyof typeof NODE_CONFIG] || { baseSize: 20 };
        return (d.size || config.baseSize);
      })
      .attr('fill', (d: any) => d.type === 'philosophy' ? 'url(#philosophy-gradient-' + d.id + ')' : (d.color || theme.primary))
      .attr('stroke', (d: any) => d.type === 'philosophy' ? '#FFFFFF' : (selectedNode?.id === d.id ? theme.primary : String(d3.color(d.color || theme.primary)?.brighter(0.5) || theme.border)))
      .attr('stroke-width', (d: any) => d.type === 'philosophy' ? 2 : (selectedNode?.id === d.id ? 3 : 1))
      .on('click', (event: any, d: any) => { event.stopPropagation(); setSelectedNode(selectedNode?.id === d.id ? null : d); });

    node.append('text')
      .text((d: any) => (d.size || 0) > 25 ? d.name : (d.name.length > 10 ? d.name.substring(0, 8) + '...' : d.name))
      .attr('x', (d: any) => { const config = NODE_CONFIG[d.type as keyof typeof NODE_CONFIG] || { baseSize: 20 }; const r = (d.size || config.baseSize) + 5; return d.name.length > 6 ? -r / 2 : r + 5; })
      .attr('y', 4)
      .attr('font-size', (d: any) => Math.min(12, (d.size || 20) / 2))
      .attr('fill', (d: any) => d.type === 'philosophy' ? '#000' : (theme.text === '#F8F9FA' ? '#000' : theme.text))
      .attr('text-anchor', (d: any) => d.name.length > 6 ? 'middle' : 'start');

    const defs = svg.append('defs');
    filteredData.nodes.forEach(n => {
      if (n.type === 'philosophy') {
        const gradient = defs.append('radialGradient').attr('id', 'philosophy-gradient-' + n.id).attr('cx', '50%').attr('cy', '50%').attr('r', '50%').attr('fx', '50%').attr('fy', '50%');
        gradient.append('stop').attr('offset', '0%').attr('stop-color', n.color || '#FFFFFF');
        gradient.append('stop').attr('offset', '100%').attr('stop-color', '#AAAAAA');
      }
    });

    function dragstarted(event: any, d: any) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
    function dragged(event: any, d: any) { d.fx = event.x; d.fy = event.y; }
    function dragended(event: any, d: any) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }

    simulation.on('tick', () => {
      link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y).attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
      node.attr('transform', (d: any) => 'translate(' + d.x + ',' + d.y + ')');
    });

    return () => { simulation.stop(); };
  }, [filteredData, theme, selectedNode]);

  const resetView = () => {
    if (svgRef.current) { const svg = d3.select(svgRef.current); svg.transition().duration(750).call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity); }
    setSelectedNode(null); setSearchQuery(''); setFilterType(null);
  };

  return (
    <div className="memory-graph-enhanced" style={{ background: theme.background, color: theme.text, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px', borderBottom: '1px solid ' + theme.border, display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '2em' }}>🧠</span>
        <div><h1 style={{ margin: 0, fontSize: '1.8em' }}>Memory Graph Enhanced</h1><p style={{ margin: '5px 0 0 0', color: theme.textSecondary }}>Philosophy-aware memory visualization</p></div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          <button style={{ padding: '8px 16px', background: theme.primary, color: theme.secondary, border: 'none', borderRadius: '6px', cursor: 'pointer' }} onClick={resetView}>Reset View</button>
        </div>
      </header>
      <div style={{ display: 'flex', padding: '20px', gap: '20px', borderBottom: '1px solid ' + theme.border }}>
        <div style={{ flex: 1 }}><input type="text" placeholder="Search nodes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px', background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '6px', color: theme.text, fontSize: '1em' }} /></div>
        <select value={filterType || ''} onChange={(e) => setFilterType(e.target.value || null)} style={{ padding: '10px', background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '6px', color: theme.text, fontSize: '1em', minWidth: '150px' }}>
          <option value="">All Types</option>
          {nodeTypes.map(type => <option key={type} value={type}>{type} ({nodeTypeCounts[type] || 0})</option>)}
        </select>
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: '500px' }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary }}>
            Loading memory graph from API...
          </div>
        ) : error ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF4444' }}>
            API Error: {error} (using fallback data)
          </div>
        ) : (
          <>
            <svg ref={svgRef} style={{ flex: 1, background: theme.surface, borderRight: '1px solid ' + theme.border }} />
            {selectedNode && <div style={{ width: '350px', padding: '20px', background: theme.background, overflowY: 'auto', borderLeft: '1px solid ' + theme.border }}>
              <h3 style={{ margin: '0 0 15px 0', color: theme.text }}>{NODE_CONFIG[selectedNode.type as keyof typeof NODE_CONFIG]?.icon} {selectedNode.name}</h3>
              <div style={{ marginBottom: '15px', padding: '10px', background: theme.surface, borderRadius: '6px' }}><p style={{ margin: '0 0 5px 0', color: theme.textSecondary, fontSize: '0.85em' }}>Type</p><p style={{ margin: 0, color: theme.text, fontWeight: 'bold' }}>{selectedNode.type}</p></div>
              <div style={{ marginBottom: '15px', padding: '10px', background: theme.surface, borderRadius: '6px' }}><p style={{ margin: '0 0 5px 0', color: theme.textSecondary, fontSize: '0.85em' }}>ID</p><p style={{ margin: 0, color: theme.text, fontSize: '0.85em', wordBreak: 'break-all' }}>{selectedNode.id}</p></div>
              {selectedNode.type === 'philosophy' && <div style={{ marginTop: '20px', padding: '15px', background: 'linear-gradient(135deg, ' + selectedNode.color + ' 0%, #AAAAAA 100%)', borderRadius: '8px', color: '#000' }}><p style={{ margin: 0, fontStyle: 'italic' }}><strong>Philosophical Principle:</strong> This is a foundational concept that guides the Hive operations.</p></div>}
            </div>}
          </>
        )}
      </div>
      <footer style={{ padding: '20px', borderTop: '1px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', color: theme.textSecondary, fontSize: '0.85em' }}>
        <div><p><strong>Nodes:</strong> {filteredData.nodes.length} / {graphData.nodes.length} | <strong>Links:</strong> {filteredData.links.length} / {graphData.links.length}</p></div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>{Object.entries(nodeTypeCounts).map(([type, count]) => <span key={type}>{NODE_CONFIG[type as keyof typeof NODE_CONFIG]?.icon} {type}: {count}</span>)}</div>
        <div><p><strong>Data Source:</strong> /v11/memory/graph + philosophy node treatment</p></div>
      </footer>
    </div>
  );
};

export default MemoryGraphEnhanced;