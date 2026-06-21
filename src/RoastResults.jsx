import React from "react";
import styles from "./RoastResults.module.css";
import { useChaosAccent } from "./useChaosAccent";

function cleanUrl(url) {
  if (!url) return "";
  return String(url)
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toUpperCase();
}

export default function RoastResults({ url, scores, onRoastAnother }) {
  const chaosAccent = useChaosAccent();

  if (!scores) return null;

  const displayUrl = cleanUrl(url);
  const overall = scores.overall;
  const rating = scores.rating;
  const tagline = scores.tagline;
  const verdict = scores.verdict;

  // Inline style --hot is the chaos accent when chaos is on.
  // When chaos is off, --hot resolves to "transparent" (no orange fallback).
  const sectionStyle = chaosAccent ? { "--hot": chaosAccent } : undefined;

  return (
    <section
      className={styles.results}
      aria-labelledby="roast-headline"
      style={sectionStyle}
    >
      {/* 1. HEADLINE */}
      <h2 id="roast-headline" className={styles.headline}>
        WE LOOKED AT <span className={styles.urlPill}>{displayUrl}</span>. WE HAVE NOTES.
      </h2>

      {/* 2. SCORE CARD — two columns */}
      <div className={styles.scoreCard}>
        <div className={styles.scoreLeft}>
          <div className={styles.scoreLabel}>ROAST SCORE</div>
          <div className={styles.scoreNumber}>
            {overall}<span className={styles.scoreDenom}>/100</span>
          </div>
        </div>
        <div className={styles.scoreRight}>
          <div className={styles.ratingWord}>{rating}</div>
          <div className={styles.tagline}>{tagline}</div>
        </div>
      </div>

      {/* 3. METRIC GRID */}
      <div className={styles.metricGrid}>
        {scores.metrics.map((metric) => (
          <article key={metric.label} className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricName}>{metric.label}</span>
              <span className={styles.metricScore}>{metric.score}</span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${metric.score}%` }}
              />
            </div>
            <p className={styles.metricLine}>{metric.line}</p>
          </article>
        ))}
      </div>

      {/* 4. FINAL VERDICT */}
      <div className={styles.verdict}>
        <div className={styles.verdictLabel}>FINAL VERDICT</div>
        <p className={styles.verdictText}>{verdict}</p>
      </div>

      {/* 5. CTA BOX */}
      <div className={styles.ctaBox}>
        <h3 className={styles.ctaHeading}>
          BRUTAL? YES. FIXABLE? ALSO YES.
        </h3>
        <div className={styles.ctaButtons}>
          <a
            className={styles.ctaPrimary}
            href="mailto:ibtsam.dev@gmail.com?subject=Fix%20my%20site"
          >
            → GET IT FIXED
          </a>
          <a className={styles.ctaSecondary} href="/#work">
            SEE THE WORK
          </a>
        </div>
      </div>

      {/* 6. ROAST ANOTHER */}
      <button type="button" className={styles.roastAnother} onClick={onRoastAnother}>
        ↺ ROAST ANOTHER
      </button>
    </section>
  );
}