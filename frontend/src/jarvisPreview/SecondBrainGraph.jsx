import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, Plus, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AREA, CONFIG, createSynapseSeeds, generateRelations } from "@/jarvisPreview/constants";

export function SecondBrainGraph({ notes, activeId, onOpenNote, onReset }) {
  const relations = useMemo(() => generateRelations(notes), [notes]);

  const graph = useMemo(() => {
    const center = { x: 500, y: 215 };
    const radiusX = 300;
    const radiusY = 146;
    const positions = new Map();
    const connectionCount = new Map();

    relations.forEach(([a, b]) => {
      connectionCount.set(a, (connectionCount.get(a) || 0) + 1);
      connectionCount.set(b, (connectionCount.get(b) || 0) + 1);
    });

    notes.forEach((note, index) => {
      const angle = (Math.PI * 2 * index) / notes.length - Math.PI / 2;
      positions.set(note.id, {
        x: center.x + Math.cos(angle) * radiusX,
        y: center.y + Math.sin(angle) * radiusY,
        r: 18 + Math.min((connectionCount.get(note.id) || 1) * 2.2, 16),
      });
    });

    const edges = relations
      .map(([a, b], edgeIndex) => {
        const start = positions.get(a);
        const end = positions.get(b);
        if (!start || !end) {
          return null;
        }

        const control = {
          x: (start.x + end.x) / 2 + (center.x - (start.x + end.x) / 2) * 0.35,
          y: (start.y + end.y) / 2 + (center.y - (start.y + end.y) / 2) * 0.35,
        };

        return { id: `edge-${edgeIndex}`, a, b, start, end, control };
      })
      .filter(Boolean);

    return { center, positions, connectionCount, edges };
  }, [notes, relations]);

  const [synapses, setSynapses] = useState(() => createSynapseSeeds(graph.edges.length));

  useEffect(() => {
    setSynapses(createSynapseSeeds(graph.edges.length));
  }, [graph.edges.length]);

  useEffect(() => {
    if (!graph.edges.length) {
      return undefined;
    }

    let frameId;
    const animate = () => {
      setSynapses((current) =>
        current.map((pulse, index) => {
          const nextT = pulse.t + pulse.speed;
          if (nextT < 1) {
            return { ...pulse, t: nextT };
          }

          return {
            ...pulse,
            t: 0,
            edgeIndex: (pulse.edgeIndex + index + 1) % graph.edges.length,
          };
        }),
      );
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [graph.edges]);

  const areaList = Array.from(new Set(notes.map((note) => note.area)));

  return (
    <section className="brain-dock" data-testid="brain-section">
      <div className="brain-dock-top">
        <div>
          <div className="brain-dock-title-row">
            <BrainCircuit size={16} strokeWidth={1.8} />
            <span data-testid="second-brain-title">SECOND BRAIN</span>
          </div>
          <p className="brain-dock-subtitle" data-testid="second-brain-subtitle">
            Memória estratégica conectada ao núcleo principal.
          </p>
        </div>

        <div className="brain-dock-tools">
          <div className="brain-dock-counts" data-testid="second-brain-counts">
            {notes.length} notas · {areaList.length} áreas
          </div>
          <div className="brain-dock-actions">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="dock-icon-button"
              data-testid="brain-reset-button"
              onClick={onReset}
              aria-label="Restaurar prévia"
            >
              <RefreshCw size={15} />
            </Button>
            <Button
              type="button"
              size="icon"
              className="dock-icon-button dock-icon-button-primary"
              data-testid="brain-add-note-button"
              onClick={() => onOpenNote(null)}
              aria-label="Adicionar nota"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="brain-viewport" data-testid="second-brain-graph-shell">
        <svg
          viewBox="0 0 1000 470"
          className="brain-svg"
          data-testid="second-brain-graph"
          role="img"
          aria-label="Grafo neural do second brain"
        >
          <defs>
            <linearGradient id="brain-edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B7CFF" />
              <stop offset="55%" stopColor="#2DD4FF" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <radialGradient id="brain-core-gradient" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#f0fdff" />
              <stop offset="22%" stopColor="#60a5fa" />
              <stop offset="55%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#111827" />
            </radialGradient>
            <filter id="brain-core-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="11" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {graph.edges.map((edge) => {
            const d = `M ${edge.start.x} ${edge.start.y} Q ${edge.control.x} ${edge.control.y} ${edge.end.x} ${edge.end.y}`;
            return (
              <g key={edge.id}>
                <path d={d} className="brain-edge-path" />
                <path
                  d={`M ${graph.center.x} ${graph.center.y} L ${edge.end.x} ${edge.end.y}`}
                  className="brain-core-ray"
                  stroke={AREA[notes.find((note) => note.id === edge.b)?.area || "meta"].color}
                />
              </g>
            );
          })}

          <g filter="url(#brain-core-glow)">
            <circle cx={graph.center.x} cy={graph.center.y} r="72" className="brain-core-shell" />
            <circle cx={graph.center.x} cy={graph.center.y} r="55" fill="url(#brain-core-gradient)" />
            <circle cx={graph.center.x} cy={graph.center.y} r="34" className="brain-core-inner-pulse" />
            <text x={graph.center.x} y={graph.center.y + 7} textAnchor="middle" className="brain-core-text">
              CORE
            </text>
          </g>

          {notes.map((note) => {
            const point = graph.positions.get(note.id);
            if (!point) {
              return null;
            }

            return (
              <g key={note.id}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={point.r + 8}
                  className={`brain-node-breath ${activeId === note.id ? "is-active" : ""}`}
                  stroke={AREA[note.area].color}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={point.r}
                  fill={AREA[note.area].color}
                  fillOpacity="0.18"
                  stroke={AREA[note.area].color}
                  strokeWidth="1.8"
                  className={`brain-node-core ${activeId === note.id ? "is-active" : ""}`}
                />
                <text x={point.x} y={point.y + 5} textAnchor="middle" className="brain-node-index">
                  {Math.min(graph.connectionCount.get(note.id) || 1, 9)}
                </text>
                <foreignObject
                  x={point.x - point.r - 11}
                  y={point.y - point.r - 11}
                  width={(point.r + 11) * 2}
                  height={(point.r + 11) * 2}
                >
                  <button
                    type="button"
                    className="brain-node-hit"
                    data-testid={`brain-node-${note.id}`}
                    onClick={() => onOpenNote(note.id)}
                    aria-label={`Editar nota ${note.title}`}
                  />
                </foreignObject>
                <text x={point.x} y={point.y + point.r + 20} textAnchor="middle" className="brain-node-label">
                  {note.title}
                </text>
              </g>
            );
          })}

          {synapses.map((pulse) => {
            const edge = graph.edges[pulse.edgeIndex];
            if (!edge) {
              return null;
            }

            const t = pulse.t;
            const x = (1 - t) * (1 - t) * edge.start.x + 2 * (1 - t) * t * edge.control.x + t * t * edge.end.x;
            const y = (1 - t) * (1 - t) * edge.start.y + 2 * (1 - t) * t * edge.control.y + t * t * edge.end.y;
            const opacity = t < 0.5 ? 0.35 + t : 1 - (t - 0.5) * 1.35;

            return <circle key={pulse.id} cx={x} cy={y} r="3.8" fill="#ffffff" opacity={opacity} className="brain-synapse" />;
          })}
        </svg>
      </div>

      <div className="brain-dock-footer">
        <div className="brain-legend-list">
          {areaList.map((areaKey) => (
            <span key={areaKey} className="brain-legend-item" data-testid={`legend-item-${areaKey}`}>
              <span className="brain-legend-dot" style={{ backgroundColor: AREA[areaKey].color }} />
              {AREA[areaKey].label}
            </span>
          ))}
        </div>

        <div className="brain-context-pill" data-testid="brain-context-status">
          <ShieldCheck size={14} /> contexto injetado em todos os comandos do {CONFIG.name}
        </div>
      </div>
    </section>
  );
}
