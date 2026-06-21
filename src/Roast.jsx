import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoastResults from "./RoastResults";
import { useRoastScores } from "./useRoastScores";

function ensureBrutalistFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById("brutalist-fonts")) return;
  const link = document.createElement("link");
  link.id = "brutalist-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Anton&family=Space+Mono:wght@400;700&display=swap";
  document.head.appendChild(link);
}

const scanLines = [
  "Resolving domain...",
  "Fetching HTML...",
  "Reading headline and meta tags...",
  "Counting scripts and page weight...",
  "Checking mobile and SEO signals...",
  "Writing the roast..."
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readResponseBody(response) {
  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default function Roast() {
  const navigate = useNavigate();
  const submitIdRef = useRef(0);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState(null);
  const [typed, setTyped] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chaos, setChaos] = useState(false);

  const scores = useRoastScores(result?.domain);

  useEffect(() => {
    ensureBrutalistFonts();
  }, []);

  useEffect(() => {
    const { classList } = document.documentElement;
    classList.add("__variable_8adcd2", "__variable_46451f");

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://jignesh-raheja-portfolio.vercel.app/_next/static/css/de7142c89586fea7.css";
    document.head.appendChild(link);

    return () => {
      classList.remove("__variable_8adcd2", "__variable_46451f");
      link.remove();
    };
  }, []);

  useEffect(() => {
    const vars = [
      "--bg",
      "--fg",
      "--color-accent",
      "--color-accent-strong",
      "--color-accent-hot",
      "--color-inverse",
      "--color-paper",
      "--color-line",
      "--color-focus"
    ];

    const applyPalette = (palette) => {
      for (const [key, value] of Object.entries(palette)) {
        document.documentElement.style.setProperty(key, value);
      }
    };

    const makePalette = () => {
      const hue = Math.floor(Math.random() * 360);
      return {
        "--bg": `oklch(97% 0.01 ${(hue + 12) % 360})`,
        "--fg": "oklch(12% 0.02 0)",
        "--color-accent": `oklch(72% 0.18 ${hue})`,
        "--color-accent-strong": `oklch(62% 0.22 ${hue})`,
        "--color-accent-hot": `oklch(74% 0.17 ${(hue + 100) % 360})`,
        "--color-inverse": `oklch(8% 0.02 ${(hue + 200) % 360})`,
        "--color-paper": `oklch(97% 0.01 ${(hue + 10) % 360})`,
        "--color-line": `oklch(18% 0.03 ${(hue + 220) % 360})`,
        "--color-focus": `oklch(78% 0.18 ${(hue + 90) % 360})`
      };
    };

    let previous = null;

    if (chaos) {
      previous = {};
      for (const variable of vars) {
        previous[variable] = getComputedStyle(document.documentElement).getPropertyValue(variable);
      }

      const palette = makePalette();
      applyPalette(palette);
      document.body.classList.add("is-chaos");
      localStorage.setItem("site-chaos-palette", JSON.stringify(palette));
      window.dispatchEvent(new Event("chaos:changed"));

      return () => {
        if (previous) {
          for (const variable of vars) {
            document.documentElement.style.setProperty(variable, previous[variable] || "");
          }
        }
        localStorage.removeItem("site-chaos-palette");
        document.body.classList.remove("is-chaos");
        window.dispatchEvent(new Event("chaos:changed"));
      };
    }

    document.documentElement.style.setProperty("--bg", "#fff");
    document.documentElement.style.setProperty("--fg", "#000");
    const stored = localStorage.getItem("site-chaos-palette");
    if (!stored) {
      document.body.classList.remove("is-chaos");
    }
  }, [chaos]);

  useEffect(() => {
    const stored = localStorage.getItem("site-chaos-palette");
    if (!stored) {
      return;
    }

    try {
      const palette = JSON.parse(stored);
      for (const [key, value] of Object.entries(palette)) {
        document.documentElement.style.setProperty(key, value);
      }
      document.body.classList.add("is-chaos");
      setChaos(true);
      window.dispatchEvent(new Event("chaos:changed"));
    } catch {
      // ignore invalid stored palette
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const input = event.currentTarget.querySelector("input");
    const value = input.value.trim();

    if (!value) {
      setStage("Paste a URL first. Empty targets are too easy.");
      return;
    }

    let cancelled = false;
    const myId = ++submitIdRef.current;
    const isStale = () => cancelled || submitIdRef.current !== myId;
    setStage("");
    setResult(null);
    setTyped("");
    setIsLoading(true);

    for (const [index, line] of scanLines.entries()) {
      if (isStale()) return;
      setStage(`> ${line}`);
      // stagger
      // eslint-disable-next-line no-await-in-loop
      await sleep(260 + index * 120);
    }

    try {
      setStage("Delivering the roast...");
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value })
      });
      const payload = await readResponseBody(response);

      if (!response.ok) {
        const errorMessage =
          (payload && typeof payload === "object" && "error" in payload && payload.error) ||
          (typeof payload === "string" ? payload : "") ||
          `Roast API returned ${response.status}.`;
        throw new Error(errorMessage);
      }

      if (!payload || typeof payload !== "object") {
        throw new Error("Roast API returned an empty response. Even the snark came back blank.");
      }

      const roastText = payload.roast || String(payload);
      setResult({
        domain: payload.domain || value,
        score: payload.score || "",
        grade: payload.grade || "",
        mode: payload.mode || "",
        roast: roastText
      });
      setStage("");

      for (let i = 0; i < roastText.length; i++) {
        if (isStale()) return;
        setTyped((current) => current + roastText[i]);
        // pacing
        // eslint-disable-next-line no-await-in-loop
        await sleep(8 + (roastText[i] === "\n" ? 60 : roastText[i] === "." ? 30 : 0));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not roast that site.";
      setStage(message.startsWith("Failed to fetch") ? "Roast API unavailable. Run the API server." : message);
    } finally {
      if (!isStale()) setIsLoading(false);
    }
  }

  function handleTryAgain(event) {
    event.preventDefault();
    setResult(null);
    setStage("");
    setTyped("");
    const input = document.getElementById("site-url");
    if (input) input.focus();
  }

  function handleFix(event) {
    event.preventDefault();
    try {
      const roastSnippet = typed || (result && result.roast) || "";
      const urlParam = encodeURIComponent(result?.domain || "");
      const snippetParam = encodeURIComponent(roastSnippet.slice(0, 800));
      navigate(`/?roastUrl=${urlParam}&roastSnippet=${snippetParam}`);
    } catch {
      window.location.href = "/#contact";
    }
  }

  return (
    <main className="roast-page font-mono text-black">
      <a
        href="#contact"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:border-[3px] focus:border-black focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-black"
      >
        Skip to contact
      </a>

      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="flex items-center justify-between border-b-[3px] border-black pb-3 text-[11px] font-bold uppercase tracking-[0.2em] sm:text-xs">
          <span>IBTSAM ISHTIAQ // SITE-ROAST v1.0</span>
          <div className="flex items-center gap-2">
            <a href="/" className="underline decoration-2 underline-offset-4 hover:bg-black hover:text-white">
              ← portfolio
            </a>
            <button
              type="button"
              onClick={() => setChaos((current) => !current)}
              aria-pressed={String(chaos)}
              className="chaos-button"
            >
              Chaos ⚡
            </button>
          </div>
        </div>

        <header className="relative mt-10 sm:mt-14">
          <span
            className="absolute -right-1 top-0 rotate-6 border-[3px] border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black sm:text-xs"
            style={{
              background: "var(--color-accent, #ff2d1a)",
              boxShadow: "5px 5px 0 #000"
            }}
          >
            brutal honesty
          </span>
          <h1 className="text-[16vw] font-black uppercase leading-[0.82] tracking-tighter sm:text-8xl">
            Roast
            <br />
            My Site
          </h1>
          <p className="mt-6 max-w-xl border-l-[6px] border-black pl-4 text-sm leading-relaxed sm:text-base">
            Paste a URL. Get it taken apart, line by line. Then — if you can take a hint — get it rebuilt by someone
            who won't let it happen again.
          </p>
        </header>

        <form className="mt-10" onSubmit={handleSubmit}>
          <label className="block text-xs font-bold uppercase tracking-[0.2em]" htmlFor="site-url">
            Drop the URL ↓
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="site-url"
              name="site-url"
              type="text"
              placeholder="competitor-i-dont-like.com"
              autoComplete="off"
              spellCheck="false"
              disabled={isLoading}
              className="w-full border-[3px] border-black bg-white px-4 py-4 text-base font-bold lowercase placeholder:text-black/30 focus:outline-none focus:ring-0"
              style={{ boxShadow: "6px 6px 0 #000" }}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="button button-primary shrink-0 px-7 py-4 text-base font-black uppercase tracking-wider text-black transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px]"
            >
              Roast it →
            </button>
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-wider text-black/45">
            Satire. It doesn't crawl your real site — the fixes, however, are real.
          </p>
        </form>

        <div id="roast-stage" aria-live="polite" className="mt-3 whitespace-pre-wrap text-sm font-bold">
          {stage}
        </div>

        {result && scores && (
          <RoastResults
            url={result.domain}
            scores={scores}
            onRoastAnother={(e) => handleTryAgain(e || { preventDefault: () => {} })}
          />
        )}

        <footer className="mt-16 border-t-[3px] border-black pt-3 text-[11px] uppercase tracking-[0.2em] text-black/50">
          Ibtsam Ishtiaq — site-roast · all in good fun
        </footer>
      </div>
    </main>
  );
}

