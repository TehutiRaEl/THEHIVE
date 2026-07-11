import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface GraphNode {
  id: string
  name: string
  type: string
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  type?: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

const TYPE_COLORS: Record<string, string> = {
  colony: '#f59e0b',
  hive: '#ef4444',
  guild: '#8b5cf6',
  module: '#06b6d4',
  philosophy: '#ffd700',
  repo: '#10b981',
  default: '#6b7280',
}

interface Props {
  height?: number
  onNodeClick?: (node: GraphNode) => void
}

export function MemoryGraph({ height = 500, onNodeClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('./memory/_graph.json')
      .then((r) => r.json())
      .then((d) => setGraphData(d as GraphData))
      .catch(() =>
        setGraphData({
          nodes: [
            { id: 'THEHIVE', name: 'THEHIVE', type: 'hive' },
            { id: 'NAR2', name: 'NAR2', type: 'colony' },
            { id: 'aether', name: 'aether', type: 'colony' },
            { id: 'automatisch', name: 'automatisch', type: 'colony' },
            { id: 'LocalAGI', name: 'LocalAGI', type: 'colony' },
          ],
          links: [
            { source: 'THEHIVE', target: 'NAR2' },
            { source: 'THEHIVE', target: 'aether' },
            { source: 'THEHIVE', target: 'automatisch' },
            { source: 'THEHIVE', target: 'LocalAGI' },
          ],
        })
      )
    setError(null)
  }, [])

  useEffect(() => {
    if (!graphData || !svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const { width } = svgRef.current.getBoundingClientRect()
    const h = height

    const sim = d3
      .forceSimulation(graphData.nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(graphData.links).id((d: d3.SimulationNodeDatum) => (d as GraphNode).id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, h / 2))

    const link = svg
      .append('g')
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1)

    const node = svg
      .append('g')
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .data(graphData.nodes)
      .join('circle')
      .attr('r', (d) => (d.type === 'hive' ? 12 : d.type === 'philosophy' ? 10 : 7))
      .attr('fill', (d) => TYPE_COLORS[d.type] ?? TYPE_COLORS.default)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (_evt, d) => onNodeClick?.(d))
      .call(
        d3
          .drag<SVGCircleElement, GraphNode>()
          .on('start', (_evt, d) => { d.fx = d.x; d.fy = d.y })
          .on('drag', (evt, d) => { d.fx = evt.x; d.fy = evt.y })
          .on('end', (_evt, d) => { d.fx = null; d.fy = null })
      )

    const label = svg
      .append('g')
      .selectAll('text')
      .data(graphData.nodes)
      .join('text')
      .text((d) => d.name)
      .attr('font-size', 9)
      .attr('fill', '#94a3b8')
      .attr('text-anchor', 'middle')
      .attr('dy', -10)
      .style('pointer-events', 'none')

    sim.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0)
      node.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0)
      label.attr('x', (d) => d.x ?? 0).attr('y', (d) => d.y ?? 0)
    })

    return () => { sim.stop() }
  }, [graphData, height, onNodeClick])

  if (error) return <div style={{ color: '#ef4444', padding: '1rem' }}>{error}</div>

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}
    />
  )
}

export default MemoryGraph
