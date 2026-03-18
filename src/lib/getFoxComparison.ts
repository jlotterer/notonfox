/**
 * Compares a wire-service story against Fox News coverage by calling
 * the /api/analyze route.
 *
 * Ported from scripts/generate.js — uses the internal API proxy instead of
 * the Anthropic SDK directly.
 */

export interface FoxComparison {
  fox_covered: boolean;
  fox_headline: string | null;
  what_fox_said: string;
  what_fox_missed: string[];
  why_it_matters: string;
  omission_severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  severity_score: number;
  severity_rationale: string;
}

interface StoryInput {
  headline: string;
  topic: string;
  summary: string;
}

/**
 * Parse JSON from a Claude response that might contain markdown fences.
 */
function parseJSON(text: string): FoxComparison {
  const clean = text.replace(/```json|```/g, "").trim();
  const arrStart = clean.indexOf("[");
  const objStart = clean.indexOf("{");

  if (arrStart !== -1 && (objStart === -1 || arrStart < objStart)) {
    return JSON.parse(clean.slice(arrStart, clean.lastIndexOf("]") + 1));
  }
  return JSON.parse(clean.slice(objStart, clean.lastIndexOf("}") + 1));
}

/**
 * Analyze how Fox News covered a specific story compared to wire service
 * reporting, by calling the /api/analyze proxy route.
 */
export async function getFoxComparison(
  story: StoryInput
): Promise<FoxComparison> {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });

  const system = `You are a media analyst who explains news coverage gaps in plain, simple language. Today is ${today}.
Search for how Fox News covered a specific story and compare it to what actually happened according to major news sources.
Be factual. Stick to what the evidence shows.
Write at a 10th grade reading level. Use short sentences and everyday words.
Return ONLY a raw JSON object (no markdown fences, no explanation):
{
  "fox_covered": true or false,
  "fox_headline": "The headline Fox used, or null if not covered",
  "what_fox_said": "In plain language, explain how Fox covered this story — what they focused on, what angle they took. If not covered, say: 'Fox News did not cover this story or buried it.'",
  "what_fox_missed": [
    "A key fact that Fox left out, explained simply",
    "Another important detail Fox didn't mention",
    "More missing context that would change how you see this story"
  ],
  "why_it_matters": "2-3 sentences explaining why these gaps matter to you as a reader. What would you misunderstand if Fox was your only news source? Be specific and direct.",
  "omission_severity": "LOW, MEDIUM, HIGH, or CRITICAL",
  "severity_score": integer from 0 to 100,
  "severity_rationale": "One plain sentence explaining this rating"
}
Severity guide: LOW = small differences in wording, MEDIUM = important facts left out, HIGH = coverage is seriously misleading, CRITICAL = story ignored or twisted beyond recognition.`;

  const messages = [
    {
      role: "user" as const,
      content: `Search for Fox News coverage of this story: "${story.headline}"
Topic category: ${story.topic}
Wire services reported: ${story.summary}

Search "Fox News ${story.headline.split(" ").slice(0, 5).join(" ")}" and "foxnews.com ${story.topic}".
Compare Fox's coverage to what AP and Reuters reported.`,
    },
  ];

  try {
    const res = await fetch(`/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, messages }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(`/api/analyze failed (${res.status}): ${err.error}`);
    }

    const data = await res.json();

    // Extract text blocks from the Anthropic-shaped response
    const text = data.content
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("");

    return parseJSON(text);
  } catch {
    return {
      fox_covered: false,
      fox_headline: null,
      what_fox_said: "We couldn't check Fox News coverage for this story.",
      what_fox_missed: ["We were unable to retrieve Fox coverage for comparison."],
      why_it_matters: "Without Fox's coverage data, we can't tell you what they left out.",
      omission_severity: "MEDIUM",
      severity_score: 50,
      severity_rationale: "Default score — analysis was unavailable.",
    };
  }
}
