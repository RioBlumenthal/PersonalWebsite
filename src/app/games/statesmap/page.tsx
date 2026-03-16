"use client";

import { useEffect, useState, useCallback } from "react";

type StateData = {
  id: string;
  name: string;
  shape: string;
};

const STATES_JSON_URL = "/states.json";

const STORAGE_KEY = "states-visited";

function loadVisited(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveVisited(visited: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited]));
  } catch {
    // ignore
  }
}

export default function StatesMapPage() {
  const [statesData, setStatesData] = useState<StateData[] | null>(null);
  const [visited, setVisited] = useState<Set<string>>(loadVisited);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const toggleState = useCallback((id: string) => {
    setVisited((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveVisited(next);
      return next;
    });
  }, []);

  const count = visited.size;

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
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          States I&apos;ve been to
        </h1>
        <div className="flex items-center gap-3">
          <span
            className="rounded-full bg-primary/20 px-4 py-2 text-lg font-medium text-foreground"
            aria-live="polite"
          >
            {count} / {statesData.length} states
          </span>
        </div>
      </div>
      <p className="text-sm text-foreground/70">
        Click a state to mark it as visited. Your selection is saved in this
        browser.
      </p>
      <div className="overflow-auto rounded-lg border border-border bg-card">
        <svg
          viewBox="0 0 960 600"
          className="h-auto w-full max-w-4xl cursor-pointer select-none"
          aria-label="US map - click states to mark visited"
        >
          {statesData.map((state) => {
            const isVisited = visited.has(state.id);
            return (
              <path
                key={state.id}
                id={state.id}
                d={state.shape}
                fill={isVisited ? "var(--primary)" : "var(--background)"}
                stroke="var(--foreground)"
                strokeWidth="1"
                className="transition-colors duration-150 hover:opacity-90"
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
        </svg>
      </div>
    </div>
  );
}
