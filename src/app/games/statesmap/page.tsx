"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";

type StateData = {
  id: string;
  name: string;
  shape: string;
};

const STATES_JSON_URL = "/states.json";

// Northeast states that scale together as a unit on hover
const NORTHEAST_IDS = new Set([
  "ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA", "DE", "MD",
]);
const NORTHEAST_HOVER_SCALE = 1.8;

const VISITED_STORAGE_KEY = "statesmap-visited";

function loadVisitedFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(VISITED_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export default function StatesMapPage() {
  const [statesData, setStatesData] = useState<StateData[] | null>(null);
  const [visited, setVisited] = useState<Set<string>>(loadVisitedFromStorage);
  const [labelPositions, setLabelPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [hoverNortheast, setHoverNortheast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const northeastCenter = useMemo(() => {
    const neStates = statesData?.filter((s) => NORTHEAST_IDS.has(s.id)) ?? [];
    if (neStates.length === 0) return { x: 865, y: 150 };
    let sx = 0;
    let sy = 0;
    let n = 0;
    for (const s of neStates) {
      const pos = labelPositions[s.id];
      if (pos) {
        sx += pos.x;
        sy += pos.y;
        n += 1;
      }
    }
    if (n === 0) return { x: 865, y: 150 };
    return { x: sx / n, y: sy / n };
  }, [statesData, labelPositions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(VISITED_STORAGE_KEY, JSON.stringify(Array.from(visited)));
    } catch {
      // ignore storage errors (e.g. private mode, quota)
    }
  }, [visited]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(STATES_JSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load map data");
        return res.json();
      })
      .then((data: StateData[]) => {
        if (!cancelled) {
          setStatesData(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load map");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg || !statesData?.length) return;
    const positions: Record<string, { x: number; y: number }> = {};
    const paths = svg.querySelectorAll<SVGPathElement>("path[id]");
    const GRID_STEP = 4; // sample every 4 units in viewBox (960x600)

    paths.forEach((path) => {
      const id = path.getAttribute("id");
      if (!id) return;
      const bbox = path.getBBox();
      const inFill: { x: number; y: number }[] = [];
      for (let x = bbox.x; x <= bbox.x + bbox.width; x += GRID_STEP) {
        for (let y = bbox.y; y <= bbox.y + bbox.height; y += GRID_STEP) {
          if (path.isPointInFill(new DOMPoint(x, y))) {
            inFill.push({ x, y });
          }
        }
      }
      if (inFill.length > 0) {
        const cx = inFill.reduce((s, p) => s + p.x, 0) / inFill.length;
        const cy = inFill.reduce((s, p) => s + p.y, 0) / inFill.length;
        positions[id] = { x: cx, y: cy };
      } else {
        positions[id] = {
          x: bbox.x + bbox.width / 2,
          y: bbox.y + bbox.height / 2,
        };
      }
    });
    setLabelPositions(positions);
  }, [statesData]);

  const toggleState = useCallback((id: string) => {
    setVisited((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const count = visited.size;
  const totalStates = statesData?.length ?? 0;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-foreground/80">Loading map...</p>
      </div>
    );
  }

  if (error || !statesData?.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-500">{error || "No map data available."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 md:p-6">
      <div className="flex w-full max-w-4xl flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          States I&apos;ve been to
        </h1>
        <div className="flex items-center gap-3">
          <span
            className="rounded-full bg-primary/20 px-4 py-2 text-lg font-medium text-foreground"
            aria-live="polite"
          >
            {count} / {totalStates} states
          </span>
        </div>
      </div>
      <p className="text-center text-sm text-foreground/70">
        Click a state to mark it as visited.
      </p>
      <div className="flex w-full justify-center overflow-visible">
        <svg
          ref={svgRef}
          viewBox="0 0 960 600"
          className="h-auto w-full max-w-4xl cursor-pointer select-none overflow-visible"
          style={{ overflow: "visible" }}
          aria-label="US map - click states to mark visited"
        >
          {statesData
            .filter((s) => !NORTHEAST_IDS.has(s.id))
            .map((state) => {
              const isVisited = visited.has(state.id);
              return (
                <path
                  key={state.id}
                  id={state.id}
                  d={state.shape}
                  fill={isVisited ? "var(--primary)" : "var(--background)"}
                  stroke="var(--foreground)"
                  strokeWidth="1"
                  className="outline-none transition-colors duration-150 hover:opacity-90"
                  style={{ outline: "none" }}
                  onClick={() => toggleState(state.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleState(state.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isVisited}
                  aria-label={`${state.name}, ${isVisited ? "visited" : "not visited"}`}
                />
              );
            })}
          <g pointerEvents="none" aria-hidden>
            {statesData
              .filter((s) => !NORTHEAST_IDS.has(s.id))
              .map((state) => {
                const pos = labelPositions[state.id];
                if (!pos) return null;
                return (
                  <text
                    key={`label-${state.id}`}
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-[10px] font-medium"
                    style={{ fontSize: "10px" }}
                  >
                    {state.name}
                  </text>
                );
              })}
          </g>
          <g
            transform={`translate(${northeastCenter.x}, ${northeastCenter.y}) scale(${hoverNortheast ? NORTHEAST_HOVER_SCALE : 1}) translate(${-northeastCenter.x}, ${-northeastCenter.y})`}
            style={{ transition: "transform 0.2s ease-out" }}
            onMouseEnter={() => setHoverNortheast(true)}
            onMouseLeave={() => setHoverNortheast(false)}
          >
            {statesData
              .filter((s) => NORTHEAST_IDS.has(s.id))
              .map((state) => {
                const isVisited = visited.has(state.id);
                return (
                  <path
                    key={state.id}
                    id={state.id}
                    d={state.shape}
                    fill={isVisited ? "var(--primary)" : "var(--background)"}
                    stroke="var(--foreground)"
                    strokeWidth="1"
                    className="outline-none transition-colors duration-150 hover:opacity-90"
                    style={{ outline: "none" }}
                    onClick={() => toggleState(state.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleState(state.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isVisited}
                    aria-label={`${state.name}, ${isVisited ? "visited" : "not visited"}`}
                  />
                );
              })}
            {NORTHEAST_IDS.size > 0 && (() => {
              const neScale = hoverNortheast ? NORTHEAST_HOVER_SCALE : 1;
              return (
                <g pointerEvents="none" aria-hidden>
                  {statesData
                    .filter((s) => NORTHEAST_IDS.has(s.id))
                    .map((state) => {
                      const pos = labelPositions[state.id];
                      if (!pos) return null;
                      return (
                        <g
                          key={`label-${state.id}`}
                          transform={`translate(${pos.x}, ${pos.y}) scale(${1 / neScale}) translate(${-pos.x}, ${-pos.y})`}
                        >
                          <text
                            x={pos.x}
                            y={pos.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-foreground text-[10px] font-medium"
                            style={{ fontSize: "10px" }}
                          >
                            {state.name}
                          </text>
                        </g>
                      );
                    })}
                </g>
              );
            })()}
          </g>
        </svg>
      </div>
      <section className="w-full max-w-4xl" aria-label="States not yet visited">
        <h2 className="mb-3 text-lg font-medium text-foreground">
          Not yet visited ({totalStates - count})
        </h2>
        <ul className="flex flex-wrap gap-2">
          {statesData
            .filter((s) => !visited.has(s.id))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((state) => (
              <li key={state.id}>
                <button
                  type="button"
                  onClick={() => toggleState(state.id)}
                  className="rounded-md border border-foreground/30 bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {state.name}
                </button>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
