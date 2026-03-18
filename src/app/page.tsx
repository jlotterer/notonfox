"use client";

import { useEffect, useState } from "react";
import type { TopStory } from "@/lib/getTopStories";
import type { FoxComparison } from "@/lib/getFoxComparison";
import Scorecard, { type DailySummary } from "@/components/Scorecard";
import StoryCard from "@/components/StoryCard";

type StoryWithFox = TopStory & { fox: FoxComparison };

interface AnalysisData {
  generated_at: string | null;
  date_display: string | null;
  date_iso: string | null;
  model_used: string;
  daily_summary: DailySummary | null;
  stories: StoryWithFox[];
}

export default function Home() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/latest.json")
      .then((res) => res.json())
      .then((json: AnalysisData) => {
        if (json.daily_summary && json.stories.length > 0) {
          setData(json);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            What Fox Missed
          </h1>
          <p className="text-sm text-foreground/60">
            Daily media literacy report &mdash; what Fox News reported, what
            they left out, and why it matters.
          </p>
        </header>

        {loading && (
          <p className="text-sm text-foreground/60">
            <span className="inline-block animate-pulse mr-2">●</span>
            Loading latest analysis&hellip;
          </p>
        )}

        {!loading && !data && (
          <p className="text-sm text-foreground/50">
            No analysis available yet. A new report is generated daily at 8 PM
            ET.
          </p>
        )}

        {!loading && data && data.daily_summary && (
          <>
            <Scorecard
              summary={data.daily_summary}
              dateDisplay={data.date_display ?? ""}
            />
            <div className="space-y-2">
              {data.stories.map((story, i) => (
                <StoryCard key={i} story={story} />
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-foreground/10 text-xs text-foreground/40">
          Powered by Claude &amp; web search. Stories sourced from major news
          outlets. Updated daily at 8 PM ET.
        </footer>
      </div>
    </div>
  );
}
