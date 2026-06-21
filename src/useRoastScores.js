import { useEffect, useState } from "react";

const RATING_BANDS = [
  { min: 81, label: "SOLID",   tagline: "Not bad. Don't let it go to your head." },
  { min: 66, label: "DECENT",  tagline: "Functional. Forgettable. Pick a lane." },
  { min: 51, label: "TRYING",  tagline: "Effort is there. Taste is missing." },
  { min: 36, label: "MEH",     tagline: "Technically a website. Barely." },
  { min: 21, label: "ROUGH",   tagline: "The kind of site that makes people close tabs." },
  { min: 0,  label: "PAINFUL", tagline: "We've seen landing pages. This isn't one." }
];

const METRIC_LABELS = [
  "LOAD SPEED",
  "VISUAL DESIGN",
  "COPYWRITING",
  "ORIGINALITY",
  "MOBILE",
  "TRUST & POPUPS"
];

const METRIC_LINES = {
  "LOAD SPEED":     ["Slow but survivable.", "Users waited longer than your ex.", "Audibly sighing on first paint.", "Your server is on break.", "Painfully heavy for what it is.", "Instant. Suspiciously instant."],
  "VISUAL DESIGN":  ["Looks like 2014 called.", "Generic template energy.", "Layout has an identity crisis.", "Safe. Painfully safe.", "Decent bones. Lazy polish.", "Actually has a point of view."],
  "COPYWRITING":    ["Buzzword landfill.", "Reads like LinkedIn at 3am.", "Synergy detected. Run.", "Trying. Failing.", "Mostly fine, one weird bit.", "Sharp. Annoyingly sharp."],
  "ORIGINALITY":    ["We've seen this 400 times.", "Stock photo purgatory.", "Reads like a clone.", "One step ahead of the template.", "Has a few original ideas.", "Distinct. Brave, even."],
  "MOBILE":         ["Mobile is an afterthought.", "Squint-tested at best.", "Works. Barely.", "Fine on a phone. Fine.", "Responsive. Respectable.", "Mobile-first. It shows."],
  "TRUST & POPUPS": ["Popups on popups on popups.", "Trust signals? Never heard of them.", "Three modals before scroll.", "Some frictions, some fixes.", "Mostly clean. One nag.", "Calm. Trustworthy. Rare."]
};

function biasedScore() {
  // Bias low: weighted toward 10-70, rare high.
  const r = Math.random();
  if (r < 0.55) return 10 + Math.floor(Math.random() * 31); // 10-40 most common
  if (r < 0.85) return 41 + Math.floor(Math.random() * 30); // 41-70
  if (r < 0.97) return 71 + Math.floor(Math.random() * 20); // 71-90
  return 91 + Math.floor(Math.random() * 10);                // 91-100 rare
}

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

export function getRating(score) {
  return RATING_BANDS.find((band) => score >= band.min) || RATING_BANDS[RATING_BANDS.length - 1];
}

export function getVerdict(overall, domain) {
  if (overall <= 20) return `${domain || "THIS SITE"} IS A CRY FOR HELP. PAY SOMEONE.`;
  if (overall <= 35) return `${domain || "THIS SITE"} WORKS, BUT BARELY. AND THE INTERNET NOTICED.`;
  if (overall <= 50) return `${domain || "THIS SITE"} IS FINE. AND FINE IS THE NEW BAD.`;
  if (overall <= 65) return `${domain || "THIS SITE"} IS TRYING. GIVE IT A WEEK AND A REAL DESIGNER.`;
  if (overall <= 80) return `${domain || "THIS SITE"} IS DECENT. ONE SHARP REBUILD AWAY FROM MEMORABLE.`;
  return `${domain || "THIS SITE"} IS SOLID. NOW MAKE IT UNFORGETTABLE.`;
}

export function useRoastScores(url) {
  const [scores, setScores] = useState(null);

  useEffect(() => {
    if (!url) {
      setScores(null);
      return;
    }
    const seed = hashString(url);
    const metrics = METRIC_LABELS.map((label, i) => {
      const score = biasedScore();
      return {
        label,
        score,
        line: pick(METRIC_LINES[label], seed + i * 7)
      };
    });
    const overall = Math.round(metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length);
    const rating = getRating(overall);
    setScores({
      overall,
      rating: rating.label,
      tagline: rating.tagline,
      metrics,
      verdict: getVerdict(overall, url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0])
    });
  }, [url]);

  return scores;
}