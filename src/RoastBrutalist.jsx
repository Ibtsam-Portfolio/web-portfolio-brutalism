import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoastResults from "./RoastResults";
import { useRoastScores } from "./useRoastScores";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const scanLines = [
  "Resolving domain...",
  "Fetching HTML...",
  "Reading headline and meta tags...",
  "Counting scripts and page weight...",
  "Checking mobile and SEO signals...",
  "Writing the roast..."
];

function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById("brutalist-fonts")) return;
  const link = document.createElement("link");
  link.id = "brutalist-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Anton&family=Space+Mono:wght@400;700&display=swap";
  document.head.appendChild(link);
}

export default function RoastBrutalist() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scores = useRoastScores(submittedUrl);

  useEffect(() => {
    ensureFonts();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const input = event.currentTarget.querySelector("input");
    const value = input.value.trim();

    if (!value) {
      setStage("Paste a URL first. Empty targets are too easy.");
      return;
    }

    setStage("");
    setSubmittedUrl("");
    setIsLoading(true);

    for (const [index, line] of scanLines.entries()) {
      setStage(`> ${line}`);
      // eslint-disable-next-line no-await-in-loop
      await sleep(180 + index * 60);
    }

    setStage("> Finalizing verdict...");
    // eslint-disable-next-line no-await-in-loop
    await sleep(250);

    setSubmittedUrl(value);
    setStage("");
    setIsLoading(false);
  }

  function handleRoastAnother() {
    setSubmittedUrl("");
    setStage("");
    const input = document.getElementById("site-url-brutal");
    if (input) {
      input.value = "";
      input.focus();
    }
  }

  return (
    <main
      style={{
        fontFamily: '"Space Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
        color: "#000",
        background: "#fff",
        minHeight: "100vh",
        padding: "2rem 1.25rem"
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "3px solid #000",
            paddingBottom: "0.75rem",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase"
          }}
        >
          <span>IBTSAM ISHTIAQ // ROAST v2 (BRUTALIST)</span>
          <a
            href="/"
            style={{
              color: "#000",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
              textDecorationThickness: "2px"
            }}
          >
            ← PORTFOLIO
          </a>
        </div>

        <header style={{ marginTop: "2.5rem" }}>
          <h1
            style={{
              fontFamily: '"Anton", "Impact", "Arial Black", sans-serif',
              fontWeight: 400,
              fontSize: "clamp(3rem, 12vw, 7rem)",
              lineHeight: 0.9,
              textTransform: "uppercase",
              margin: 0
            }}
          >
            ROAST
            <br />
            MY SITE
          </h1>
          <p
            style={{
              marginTop: "1rem",
              maxWidth: "32rem",
              borderLeft: "6px solid #000",
              paddingLeft: "1rem",
              fontSize: "0.9rem",
              fontWeight: 700,
              lineHeight: 1.4
            }}
          >
            Paste a URL. Get it taken apart, line by line. Then — if you can take a hint — get it rebuilt by someone
            who won't let it happen again.
          </p>
        </header>

        {!scores && !isLoading && (
          <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
            <label
              htmlFor="site-url-brutal"
              style={{
                display: "block",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                marginBottom: "0.75rem"
              }}
            >
              DROP THE URL ↓
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem"
              }}
            >
              <input
                id="site-url-brutal"
                name="site-url-brutal"
                type="text"
                placeholder="competitor-i-dont-like.com"
                autoComplete="off"
                spellCheck="false"
                disabled={isLoading}
                style={{
                  flex: "1 1 280px",
                  border: "3px solid #000",
                  background: "#fff",
                  color: "#000",
                  padding: "1rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  fontFamily: "inherit",
                  textTransform: "lowercase",
                  borderRadius: 0
                }}
              />
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  border: "3px solid #000",
                  background: "#000",
                  color: "#fff",
                  padding: "1rem 1.5rem",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  fontFamily: "inherit",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  borderRadius: 0
                }}
              >
                ROAST IT →
              </button>
            </div>
            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "0.7rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                opacity: 0.5
              }}
            >
              SATIRE. SCORES ARE WEIGHTED RANDOM — THE FIXES, HOWEVER, ARE REAL.
            </p>
          </form>
        )}

        {stage && (
          <div
            aria-live="polite"
            style={{
              marginTop: "1rem",
              whiteSpace: "pre-wrap",
              fontSize: "0.85rem",
              fontWeight: 700
            }}
          >
            {stage}
          </div>
        )}

        {scores && <RoastResults url={submittedUrl} scores={scores} onRoastAnother={handleRoastAnother} />}

        <footer
          style={{
            marginTop: "3rem",
            borderTop: "3px solid #000",
            paddingTop: "0.75rem",
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.5
          }}
        >
          IBTSAM ISHTIAQ — SITE-ROAST · ALL IN GOOD FUN
        </footer>
      </div>
    </main>
  );
}