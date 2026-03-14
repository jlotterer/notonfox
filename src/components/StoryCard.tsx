import type { TopStory } from "@/lib/getTopStories";
import type { FoxComparison } from "@/lib/getFoxComparison";

export interface StoryCardProps {
  story: TopStory & { fox: FoxComparison };
}

const SEVERITY_STYLES: Record<
  FoxComparison["omission_severity"],
  { badge: string; bar: string }
> = {
  LOW: {
    badge: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    bar: "bg-green-500",
  },
  MEDIUM: {
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    bar: "bg-yellow-500",
  },
  HIGH: {
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    bar: "bg-orange-500",
  },
  CRITICAL: {
    badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    bar: "bg-red-600",
  },
};

export default function StoryCard({ story }: StoryCardProps) {
  const { fox } = story;
  const severity = SEVERITY_STYLES[fox.omission_severity];

  return (
    <article className="border-t-2 border-foreground/20 pt-6 pb-8">
      {/* Header: topic + severity */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-foreground/50">
          {story.topic}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${severity.badge}`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${severity.bar}`}
          />
          {fox.omission_severity}
        </span>
      </div>

      {/* Headline */}
      <h2 className="font-serif text-2xl font-bold leading-tight tracking-tight text-balance mb-2">
        {story.headline}
      </h2>

      {/* Significance line */}
      <p className="text-sm italic text-foreground/60 mb-5">
        {story.significance}
      </p>

      {/* Two-column wire vs Fox coverage */}
      <div className="grid gap-6 sm:grid-cols-2 mb-6">
        {/* AP & Reuters */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 border-b border-foreground/10 pb-1 mb-3">
            AP &amp; Reuters
          </h3>
          <p className="text-sm leading-relaxed mb-2">
            <span className="font-semibold">AP:</span> {story.ap_coverage}
          </p>
          <p className="text-sm leading-relaxed">
            <span className="font-semibold">Reuters:</span>{" "}
            {story.reuters_coverage}
          </p>
        </div>

        {/* Fox News */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 border-b border-foreground/10 pb-1 mb-3">
            Fox News
          </h3>
          {fox.fox_covered ? (
            <>
              {fox.fox_headline && (
                <p className="text-sm font-semibold mb-1">
                  &ldquo;{fox.fox_headline}&rdquo;
                </p>
              )}
              <p className="text-sm leading-relaxed">{fox.fox_summary}</p>
            </>
          ) : (
            <p className="text-sm italic text-foreground/50">
              Not covered or not prominently featured.
            </p>
          )}
          {fox.added_spin && (
            <p className="mt-2 text-sm text-foreground/70">
              <span className="font-semibold">Added spin:</span>{" "}
              {fox.added_spin}
            </p>
          )}
        </div>
      </div>

      {/* Missing context */}
      {fox.missing_context.length > 0 && (
        <div className="bg-foreground/[.03] dark:bg-foreground/[.06] border border-foreground/10 rounded-md p-4 mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2">
            Missing Context
          </h3>
          <ul className="space-y-1.5">
            {fox.missing_context.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed">
                <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full bg-foreground/30" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Severity score bar + analysis */}
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-14 text-center">
          <div className="text-2xl font-bold leading-none">
            {fox.severity_score}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-foreground/40 mt-0.5">
            /100
          </div>
          <div
            className={`mt-1.5 h-1 w-full rounded-full bg-foreground/10 overflow-hidden`}
          >
            <div
              className={`h-full rounded-full ${severity.bar}`}
              style={{ width: `${fox.severity_score}%` }}
            />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm leading-relaxed">{fox.analysis}</p>
          <p className="mt-1 text-xs text-foreground/40 italic">
            {fox.severity_rationale}
          </p>
        </div>
      </div>
    </article>
  );
}
