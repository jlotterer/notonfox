"use client";

import { useEffect, useState } from "react";

interface ArchiveEntry {
  date: string;
  file: string;
}

interface ArchiveSidebarProps {
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

function groupByMonth(entries: ArchiveEntry[]): Map<string, ArchiveEntry[]> {
  const groups = new Map<string, ArchiveEntry[]>();
  for (const entry of entries) {
    const [year, month] = entry.date.split("-");
    const d = new Date(Number(year), Number(month) - 1);
    const key = d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }
  return groups;
}

function dayLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function ArchiveSidebar({
  selectedDate,
  onSelectDate,
}: ArchiveSidebarProps) {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);

  useEffect(() => {
    fetch("/data/archive-index.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ArchiveEntry[]) => {
        const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
        setEntries(sorted);
      })
      .catch(() => {});
  }, []);

  const grouped = groupByMonth(entries);

  return (
    <nav className="flex flex-col h-full">
      {/* Latest button */}
      <button
        onClick={() => onSelectDate(null)}
        className={`w-full text-left px-4 py-2.5 text-sm font-semibold border-b border-foreground/10 transition-colors ${
          selectedDate === null
            ? "bg-foreground/10 text-foreground"
            : "text-foreground/70 hover:bg-foreground/5"
        }`}
      >
        Latest Report
      </button>

      {/* Scrollable archive list */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 && (
          <p className="px-4 py-3 text-xs text-foreground/40">
            No past reports yet.
          </p>
        )}
        {Array.from(grouped.entries()).map(([month, items]) => (
          <div key={month}>
            <div className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
              {month}
            </div>
            {items.map((entry) => (
              <button
                key={entry.date}
                onClick={() => onSelectDate(entry.date)}
                className={`w-full text-left px-4 py-1.5 text-sm transition-colors ${
                  selectedDate === entry.date
                    ? "bg-foreground/10 text-foreground font-medium"
                    : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground/80"
                }`}
              >
                {dayLabel(entry.date)}
              </button>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
