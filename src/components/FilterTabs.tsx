import type { Filters, StatusFilter } from "../hooks/useScreenshots";
import type { RiskLevel } from "../lib/types";

interface Counts {
  needs: number;
  scam: number;
  safe: number;
  all: number;
}

const TABS: { key: StatusFilter; label: string }[] = [
  { key: "needs", label: "Needs review" },
  { key: "scam", label: "Scams" },
  { key: "safe", label: "Safe" },
  { key: "all", label: "All" },
];

export function FilterTabs({
  filters,
  setFilters,
  counts,
  onRefresh,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  counts: Counts;
  onRefresh: () => void;
}) {
  return (
    <div className="filter-row rise" style={{ ["--i" as string]: 1 }}>
      <div className="tabs" role="group" aria-label="Filter by review status">
        {TABS.map((t) => (
          <button
            key={t.key}
            aria-pressed={filters.status === t.key}
            className={`tab${filters.status === t.key ? " active" : ""}`}
            onClick={() => setFilters({ ...filters, status: t.key })}
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      <label className="visually-hidden" htmlFor="risk-filter">
        Filter by risk
      </label>
      <select
        id="risk-filter"
        className="select"
        value={filters.risk}
        onChange={(e) => setFilters({ ...filters, risk: e.target.value as RiskLevel | "all" })}
      >
        <option value="all">All risk levels</option>
        <option value="high">High risk</option>
        <option value="medium">Caution</option>
        <option value="low">Low risk</option>
      </select>

      <label className="visually-hidden" htmlFor="sort-order">
        Sort order
      </label>
      <select
        id="sort-order"
        className="select"
        value={filters.sort}
        onChange={(e) =>
          setFilters({ ...filters, sort: e.target.value as Filters["sort"] })
        }
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>

      <div className="filter-spacer" />
      <button className="btn btn-quiet btn-sm" onClick={onRefresh}>
        Refresh
      </button>
    </div>
  );
}
