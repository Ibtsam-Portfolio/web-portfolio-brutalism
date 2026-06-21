import React, { useEffect, useRef, useState } from "react";
import { SiteFooter, SiteHeader } from "./SiteChrome";

const pitches = [
  ["sharp", "interfaces"],
  ["calm", "web apps"],
  ["useful", "AI tools"],
  ["fast", "launches"],
  ["memorable", "systems"],
  ["clean", "dashboards"]
];

function useMountAnimation() {
  useEffect(() => {
    document.documentElement.classList.add("page-mounted");
    const id = setTimeout(() => document.documentElement.classList.remove("page-mounted"), 1800);
    return () => clearTimeout(id);
  }, []);
}

function randomColor() {
  // return an oklch-ish H value string for tokens
  const h = Math.floor(Math.random() * 360);
  const l = 75 + Math.random() * 10; // light
  const c = 0.16 + Math.random() * 0.25;
  return `oklch(${l}% ${c} ${h})`;
}

export default function App() {
  useMountAnimation();

  const [pitchIndex, setPitchIndex] = useState(0);
  const [chaos, setChaos] = useState(false);
  const [roastOutput, setRoastOutput] = useState("");
  const [roastLoading, setRoastLoading] = useState(false);
  const roastSteps = useRef([
    "Resolving domain...",
    "Fetching HTML...",
    "Reading headline and meta tags...",
    "Counting scripts and page weight...",
    "Checking mobile and SEO signals...",
    "Writing the roast..."
  ]);

  // controlled UI state for expandables
  const [buildOpen, setBuildOpen] = useState([true, false, false, false]);
  const [workOpen, setWorkOpen] = useState([false, false, false, false]);

  // contact form state (for prefill from roast)
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    const email = "ibtsam.dev@gmail.com";
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const ta = document.createElement('textarea');
        ta.value = email;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore copy failures
    }
  };

  useEffect(() => {
    // check for roast prefill params and populate contact form
    try {
      const params = new URLSearchParams(window.location.search);
      const url = params.get("roastUrl");
      const snippet = params.get("roastSnippet");
      if (url || snippet) {
        const decodedUrl = url ? decodeURIComponent(url) : "";
        const decodedSnippet = snippet ? decodeURIComponent(snippet) : "";
        setContactMessage(`I saw a roast for ${decodedUrl}:\n\n${decodedSnippet}\n\nCan you help fix this?`);
        // focus contact and scroll
        setTimeout(() => {
          const el = document.getElementById("contact");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          const input = document.getElementById("contact-email");
          if (input) input.focus();
          // remove the query params so repeated visits don't re-trigger
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 240);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleBuild = (index) => {
    setBuildOpen((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const toggleWork = (index) => {
    setWorkOpen((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  // shuffle pitch
  function handleShuffle() {
    const next = (pitchIndex + 1) % pitches.length;
    setPitchIndex(next);
  }

  // chaos toggle -- randomize many CSS variables, persist to localStorage
  useEffect(() => {
    const vars = [
      "--color-accent",
      "--color-accent-strong",
      "--color-accent-hot",
      "--color-inverse",
      "--color-paper",
      "--color-line",
      "--color-focus"
    ];

    const applyPalette = (palette) => {
      for (const [k, v] of Object.entries(palette)) {
        document.documentElement.style.setProperty(k, v);
      }
    };

    const makePalette = () => {
      // coherent palette: pick hue and derive variants
      const h = Math.floor(Math.random() * 360);
      return {
        "--color-accent": `oklch(72% 0.18 ${h})`,
        "--color-accent-strong": `oklch(62% 0.22 ${h})`,
        "--color-accent-hot": `oklch(74% 0.17 ${(h + 100) % 360})`,
        "--color-inverse": `oklch(8% 0.02 ${(h + 200) % 360})`,
        "--color-paper": `oklch(97% 0.01 ${(h + 10) % 360})`,
        "--color-line": `oklch(18% 0.03 ${(h + 220) % 360})`,
        "--color-focus": `oklch(78% 0.18 ${(h + 90) % 360})`
      };
    };

    let previous = null;

    if (chaos) {
      previous = {};
      for (const v of vars) previous[v] = getComputedStyle(document.documentElement).getPropertyValue(v);

      const palette = makePalette();
      applyPalette(palette);
      document.body.classList.add("is-chaos");
      localStorage.setItem("site-chaos-palette", JSON.stringify(palette));

      return () => {
        if (previous) {
          for (const v of vars) document.documentElement.style.setProperty(v, previous[v] || "");
        }
        localStorage.removeItem("site-chaos-palette");
        document.body.classList.remove("is-chaos");
      };
    } else {
      // if chaos disabled but palette stored, remove it
      const stored = localStorage.getItem("site-chaos-palette");
      if (!stored) document.body.classList.remove("is-chaos");
    }
  }, [chaos]);

  // restore persisted palette on mount
  useEffect(() => {
    const stored = localStorage.getItem("site-chaos-palette");
    if (stored) {
      try {
        const palette = JSON.parse(stored);
        for (const [k, v] of Object.entries(palette)) document.documentElement.style.setProperty(k, v);
        document.body.classList.add("is-chaos");
        setChaos(true);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // drag board stickers pointer handlers (only)
  useEffect(() => {
    const stickers = Array.from(document.querySelectorAll(".sticker"));
    const handlers = new Map();

    stickers.forEach((sticker) => {
      let offsetX = 0;
      let offsetY = 0;
      let boardRect = null;

      const onPointerDown = (event) => {
        const board = sticker.closest("[data-drag-board]");
        const stickerRect = sticker.getBoundingClientRect();
        boardRect = board.getBoundingClientRect();
        offsetX = event.clientX - stickerRect.left;
        offsetY = event.clientY - stickerRect.top;
        sticker.classList.add("is-dragging");
        try {
          sticker.setPointerCapture(event.pointerId);
        } catch (e) {
          // ignore
        }

        const moveSticker = (moveEvent) => {
          const maxX = boardRect.width - sticker.offsetWidth - 8;
          const maxY = boardRect.height - sticker.offsetHeight - 8;
          const nextX = Math.min(Math.max(moveEvent.clientX - boardRect.left - offsetX, 8), maxX);
          const nextY = Math.min(Math.max(moveEvent.clientY - boardRect.top - offsetY, 8), maxY);
          sticker.style.left = `${nextX}px`;
          sticker.style.top = `${nextY}px`;
        };

        const stopDrag = () => {
          sticker.classList.remove("is-dragging");
          sticker.removeEventListener("pointermove", moveSticker);
          sticker.removeEventListener("pointerup", stopDrag);
          sticker.removeEventListener("pointercancel", stopDrag);
        };

        sticker.addEventListener("pointermove", moveSticker);
        sticker.addEventListener("pointerup", stopDrag);
        sticker.addEventListener("pointercancel", stopDrag);

        handlers.set(sticker, { move: moveSticker, stop: stopDrag });
      };

      sticker.addEventListener("pointerdown", onPointerDown);
      handlers.set(sticker, { down: onPointerDown });
    });

    return () => {
      handlers.forEach((h, sticker) => {
        if (h.down) sticker.removeEventListener("pointerdown", h.down);
      });
    };
  }, []);

  async function handleRoastSubmit(e) {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input");
    const value = input.value.trim();
    const outputEl = document.querySelector("[data-roast-output]");

    if (!value) {
      setRoastOutput("Paste a URL first. Empty targets are too easy.");
      return;
    }

    setRoastOutput("");
    setRoastLoading(true);
    try {
      for (const [i, line] of roastSteps.current.entries()) {
        setRoastOutput(`> ${line}`);
        // stagger
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, 260 + i * 120));
      }

      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value })
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Could not roast that site.");
      setRoastOutput(payload.roast || JSON.stringify(payload, null, 2));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not roast that site.";
      setRoastOutput(message.startsWith("Failed to fetch") ? "Roast API unavailable. Run the API server." : message);
    } finally {
      setRoastLoading(false);
    }
  }

  // contact form submission — open user's mail client with prefilled message
  function handleContactSubmit(e) {
    e.preventDefault();
    const subject = "Website help request";
    const body = `Contact: ${contactEmail}\n\n${contactMessage}`;
    window.location.href = `mailto:ibtsam.dev@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <>
      <SiteHeader
        links={[
          { href: "#work", label: "Work" },
          { href: "#thinking", label: "Thinking" },
          { href: "#contact", label: "Contact" }
        ]}
        action={(
          <button
            className="chaos-button"
            type="button"
            aria-pressed={String(chaos)}
            onClick={() => setChaos((s) => !s)}
          >
            Chaos <span aria-hidden="true">⚡</span>
          </button>
        )}
      />

      <main id="top">
        <section className="hero section-shell" aria-labelledby="hero-title">
          <p className="availability">
            <span className="availability-dot" aria-hidden="true" /> Available for freelance work
          </p>
          <h1 id="hero-title" className="hero-title-animate">
            <span>I build</span>
            <br />
            <span className="outline-word">digital</span>
            <br />
            <span>products.</span>
          </h1>
          <p className="hero-copy">
            Full-stack developer and product builder. I help founders launch websites, web apps, and AI tools that are clear, fast, and genuinely worth remembering.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="mailto:ibtsam.dev@gmail.com?subject=Project%20inquiry">Start a project <span aria-hidden="true">→</span></a>
            <a className="button button-secondary" href="/roast">Roast my site <span aria-hidden="true">🔥</span></a>
          </div>
        </section>

        <div className="ticker ticker-dark" aria-hidden="true">
          <div className="ticker-track">
            <span>Available for freelance work</span><b>✺</b><span>Websites</span><b>✺</b><span>Web apps</span><b>✺</b><span>AI tools</span><b>✺</b><span>Redesigns</span><b>✺</b><span>No generic allowed</span><b>✺</b>
            <span>Available for freelance work</span><b>✺</b><span>Websites</span><b>✺</b><span>Web apps</span><b>✺</b><span>AI tools</span><b>✺</b><span>Redesigns</span><b>✺</b><span>No generic allowed</span><b>✺</b>
          </div>
        </div>

        <section className="section-shell section-spaced" aria-labelledby="pitch-title">
          <div className="pitch-panel">
            <p className="section-note">// the elevator pitch, randomised</p>
            <h2 id="pitch-title">
              I build <mark data-pitch-a>{pitches[pitchIndex][0]}</mark> <mark data-pitch-b>{pitches[pitchIndex][1]}</mark>
              for founders who refuse to look generic.
            </h2>
            <button className="mini-button" type="button" onClick={handleShuffle} data-shuffle>⟳ Shuffle the pitch</button>
          </div>
        </section>

        <section className="section-shell section-spaced-end" aria-labelledby="build-title">
          <h2 className="section-title" id="build-title">What I build</h2>
          <div className="build-grid">
            <article className={`build-card${buildOpen[0] ? ' is-open' : ''}`} data-expandable>
              <button type="button" aria-expanded={String(buildOpen[0])} onClick={() => toggleBuild(0)}>
                <span className="card-number">01</span>
                <span className="toggle-symbol" aria-hidden="true">{buildOpen[0] ? '−' : '+'}</span>
                <strong>Websites that earn trust</strong>
              </button>
              <p>Marketing sites that make people believe you before they ever pick up the phone - fast, clear, and built to convert.</p>
            </article>

            <article className={`build-card${buildOpen[1] ? ' is-open' : ''}`} data-expandable>
              <button type="button" aria-expanded={String(buildOpen[1])} onClick={() => toggleBuild(1)}>
                <span className="card-number">02</span>
                <span className="toggle-symbol" aria-hidden="true">{buildOpen[1] ? '−' : '+'}</span>
                <strong>Web apps that feel simple</strong>
              </button>
              <p>Product dashboards, booking flows, portals, and internal tools that keep complex work calm.</p>
            </article>

            <article className={`build-card${buildOpen[2] ? ' is-open' : ''}`} data-expandable>
              <button type="button" aria-expanded={String(buildOpen[2])} onClick={() => toggleBuild(2)}>
                <span className="card-number">03</span>
                <span className="toggle-symbol" aria-hidden="true">{buildOpen[2] ? '−' : '+'}</span>
                <strong>AI tools that make sense</strong>
              </button>
              <p>Useful AI features with clear prompts, reliable flows, and interfaces people can actually understand.</p>
            </article>

            <article className={`build-card${buildOpen[3] ? ' is-open' : ''}`} data-expandable>
              <button type="button" aria-expanded={String(buildOpen[3])} onClick={() => toggleBuild(3)}>
                <span className="card-number">04</span>
                <span className="toggle-symbol" aria-hidden="true">{buildOpen[3] ? '−' : '+'}</span>
                <strong>Redesigns that wake things up</strong>
              </button>
              <p>Sharper structure, stronger messaging, better speed, and the details that make a site feel alive.</p>
            </article>
          </div>
        </section>

        <div className="ticker ticker-accent" aria-hidden="true">
          <div className="ticker-track reverse">
            <span>Good design disappears.</span><b>●</b><span>Fast beats fancy.</span><b>●</b><span>Simple is the hard part.</span><b>●</b><span>Experiences outlast features.</span><b>●</b>
            <span>Good design disappears.</span><b>●</b><span>Fast beats fancy.</span><b>●</b><span>Simple is the hard part.</span><b>●</b><span>Experiences outlast features.</span><b>●</b>
          </div>
        </div>

        <section className="section-shell section-spaced" id="work" aria-labelledby="work-title">
          <h2 className="section-title" id="work-title">Selected work</h2>
          <div className="work-list" data-accordion>
            <article className={`work-row${workOpen[0] ? ' is-open' : ''}`}>
              <button type="button" aria-expanded={String(workOpen[0])} onClick={() => toggleWork(0)}>
                <span>01</span><strong>The Quiet Dashboard</strong><b aria-hidden="true">{workOpen[0] ? '−' : '+'}</b>
              </button>
              <div className="row-panel">
                <div className="work-panel-inner">
                  <div className="work-details-grid">
                    <div className="work-detail">
                      <div className="work-detail-heading">Problem</div>
                      <div className="work-detail-text">A command center nobody trusted; visibility felt chaotic.</div>
                    </div>
                    <div className="work-detail">
                      <div className="work-detail-heading">Idea</div>
                      <div className="work-detail-text">Filter noise, surface signal. Clear alerts and calm flows.</div>
                    </div>
                    <div className="work-detail">
                      <div className="work-detail-heading">Outcome</div>
                      <div className="work-detail-text">Prototype reduced alert noise and clarified ownership.</div>
                    </div>
                  </div>

                  <hr className="work-divider" />

                  <div className="work-bottom">
                    <div className="work-quote">A calmer dashboard means better decisions, faster.</div>
                    <a className="button case-study" href="#">View case study →</a>
                  </div>
                </div>
              </div>
            </article>

            <article className={`work-row${workOpen[1] ? ' is-open' : ''}`}>
              <button type="button" aria-expanded={String(workOpen[1])} onClick={() => toggleWork(1)}>
                <span>02</span><strong>First Impression</strong><b aria-hidden="true">{workOpen[1] ? '−' : '+'}</b>
              </button>
              <div className="row-panel">
               <div className="work-panel-inner">
                 <div className="work-details-grid">
                   <div className="work-detail">
                     <div className="work-detail-heading">Problem</div>
                     <div className="work-detail-text">An unfocused portfolio that confused visitors and lost leads.</div>
                   </div>
                   <div className="work-detail">
                     <div className="work-detail-heading">Idea</div>
                     <div className="work-detail-text">Tighten hierarchy, speed assets, and lead with outcomes.</div>
                   </div>
                   <div className="work-detail">
                     <div className="work-detail-heading">Outcome</div>
                     <div className="work-detail-text">Conversion improved and load times dropped significantly.</div>
                   </div>
                 </div>

                 <hr className="work-divider" />

                 <div className="work-bottom">
                   <div className="work-quote">Clear hierarchy wins customers.</div>
                   <a className="button case-study" href="#">View case study →</a>
                 </div>
               </div>
              </div>
            </article>

            <article className={`work-row${workOpen[2] ? ' is-open' : ''}`}>
              <button type="button" aria-expanded={String(workOpen[2])} onClick={() => toggleWork(2)}>
                <span>03</span><strong>The Honest Machine</strong><b aria-hidden="true">{workOpen[2] ? '−' : '+'}</b>
              </button>
              <div className="row-panel">
               <div className="work-panel-inner">
                 <div className="work-details-grid">
                   <div className="work-detail">
                     <div className="work-detail-heading">Problem</div>
                     <div className="work-detail-text">AI features that felt magical but untrustworthy.</div>
                   </div>
                   <div className="work-detail">
                     <div className="work-detail-heading">Idea</div>
                     <div className="work-detail-text">Show provenance, step-through reasoning, and clear controls.</div>
                   </div>
                   <div className="work-detail">
                     <div className="work-detail-heading">Outcome</div>
                     <div className="work-detail-text">Stronger trust and fewer support requests during beta.</div>
                   </div>
                 </div>

                 <hr className="work-divider" />

                 <div className="work-bottom">
                   <div className="work-quote">Transparency beats mystery—every time.</div>
                   <a className="button case-study" href="#">View case study →</a>
                 </div>
               </div>
              </div>
            </article>

            <article className={`work-row${workOpen[3] ? ' is-open' : ''}`}>
              <button type="button" aria-expanded={String(workOpen[3])} onClick={() => toggleWork(3)}>
                <span>04</span><strong>Common Ground</strong><b aria-hidden="true">{workOpen[3] ? '−' : '+'}</b>
              </button>
              <div className="row-panel">
               <div className="work-panel-inner">
                 <div className="work-details-grid">
                   <div className="work-detail">
                     <div className="work-detail-heading">Problem</div>
                     <div className="work-detail-text">Editors struggled with updating content and layouts.</div>
                   </div>
                   <div className="work-detail">
                     <div className="work-detail-heading">Idea</div>
                     <div className="work-detail-text">Create modular sections and simple author tools.</div>
                   </div>
                   <div className="work-detail">
                     <div className="work-detail-heading">Outcome</div>
                     <div className="work-detail-text">Editorial time dropped and publish cadence increased.</div>
                   </div>
                 </div>

                 <hr className="work-divider" />

                 <div className="work-bottom">
                   <div className="work-quote">Modularity keeps editorial teams shipping.</div>
                   <a className="button case-study" href="#">View case study →</a>
                 </div>
               </div>
              </div>
            </article>

          </div>
        </section>

        <section className="section-shell section-spaced-end" id="thinking" aria-labelledby="thinking-title">
          <h2 className="section-title" id="thinking-title">How I think</h2>
          <div className="thinking-stack">
            <article className="thought-card">
              <span>01</span>
              <h3>I care about the details nobody asks for.</h3>
              <p>The 1% you can't quite name is the 1% everybody feels. I live there.</p>
            </article>
            <article className="thought-card inverted">
              <span>02</span>
              <h3>I obsess over how it feels, not just how it looks.</h3>
              <p>Beautiful is table stakes. The win is when something feels effortless to use.</p>
            </article>
            <article className="thought-card">
              <span>03</span>
              <h3>I'd rather build something memorable than something trendy.</h3>
              <p>Trends age in a season. A site people remember keeps working for years.</p>
            </article>
            <article className="thought-card inverted">
              <span>04</span>
              <h3>I work like a partner, not a vendor.</h3>
              <p>I ask why we're building this - and I'll tell you when I think we shouldn't.</p>
            </article>
          </div>
        </section>

        <section className="section-shell section-spaced-end" aria-labelledby="drag-title">
          <h2 className="section-title" id="drag-title">Drag stuff around</h2>
          <p className="section-note">// because static is boring. grab the stickers.</p>
          <div className="drag-board" data-drag-board aria-label="Draggable sticker board">
            <button className="sticker" type="button" style={{"--x":"24px","--y":"30px","--r":"-6deg"}}>Drag me →</button>
            <button className="sticker" type="button" style={{"--x":"220px","--y":"60px","--r":"5deg"}}>No templates</button>
            <button className="sticker" type="button" style={{"--x":"70px","--y":"150px","--r":"-3deg"}}>100% human</button>
            <button className="sticker" type="button" style={{"--x":"320px","--y":"150px","--r":"8deg"}}>Ship it</button>
            <button className="sticker" type="button" style={{"--x":"150px","--y":"240px","--r":"-7deg"}}>Details &gt; vibes</button>
            <button className="sticker" type="button" style={{"--x":"360px","--y":"250px","--r":"4deg"}}>Fast beats fancy</button>
          </div>
        </section>

        <section className="section-shell section-spaced-end" id="roast" aria-labelledby="roast-title">
          <a className="roast-panel roast-panel-link" href="/roast" aria-label="Roast my site">
            <p className="section-note">// the side quest</p>
            <h2 id="roast-title">Roast my site <span aria-hidden="true">🔥</span></h2>
            <p>Paste any URL and watch me tear it apart, line by line — then offer to fix it. Free brutality. Click to play →</p>
          </a>
        </section>
      </main>

      <section id="contact" className="contact-section">
        <div className="section-shell contact-inner">
          <h2>
            <span className="contact-line">LET'S</span>
            <span className="contact-line outline-word">BUILD</span>
            <span className="contact-line">SOMETHING.</span>
          </h2>
          <p>Open for 1–2 projects this quarter. Tell me what you're making — or just say hi.</p>

          <div className="mt-10 grid gap-4 contact-cta">
            <div className="contact-email-wrap">
              <button type="button" className="contact-email-button" onClick={handleCopyEmail} aria-live="polite">{copied ? "Copied!" : "ibtsam.dev@gmail.com"}</button>
            </div>
            <a className="contact-link" href="mailto:ibtsam.dev@gmail.com?subject=Hello%20Ibtsam%20Ishtiaq">EMAIL →</a>
            <a className="contact-link" href="https://www.linkedin.com/in/ibtsam357/" target="_blank" rel="noopener noreferrer">LINKEDIN →</a>
          </div>

          <SiteFooter />

        </div>
      </section>
    </>
  );
}
