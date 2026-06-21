const GRADES = [
  { min: 86, label: "ACTUALLY DECENT", note: "Annoyingly fine. I can still make it sharper." },
  { min: 70, label: "SOLID START", note: "Good bones. Some lazy defaults are showing." },
  { min: 52, label: "AGGRESSIVELY MID", note: "Nobody hates it. Nobody remembers it." },
  { min: 34, label: "ROUGH", note: "It is trying. That is the sad part." },
  { min: 0, label: "NEEDS INTERVENTION", note: "We should talk before more people see this." }
];

function getGrade(score) {
  return GRADES.find((grade) => score >= grade.min) || GRADES[GRADES.length - 1];
}

const SYSTEM_PROMPT = [
  "You are Ibtsam Ishtiaq — a sharp, sarcastic, no-nonsense portfolio developer who roasts websites for a living.",
  "Voice: witty, brutally honest, slightly smug, never mean-spirited. Think design critic at a conference afterparty, not a troll.",
  "Tone rules:",
  "  - Lean into dry sarcasm, irony, hyperbole, and rhetorical questions.",
  "  - Use short punchy sentences. Vary rhythm. No corporate fluff.",
  "  - Mock weak choices specifically (bad CTAs, generic buzzwords, slow loads, missing viewport, weak headlines).",
  "  - Quote real titles, headlines, and meta descriptions from the data when tearing them apart.",
  "  - Never invent metrics, features, testimonials, or facts that aren't in the analysis JSON.",
  "  - Never use emojis. They cheapen the bite.",
  "Format rules:",
  "  - Open with a one-line grade verdict that name-drops the domain.",
  "  - Use short paragraphs or bullet-like lines prefixed with '- '.",
  "  - End with exactly one sentence offering to fix it (signature closer).",
  "Length: 180-320 words. Punchy beats long."
].join("\n");

function buildUserPrompt(analysis) {
  const grade = getGrade(analysis.score);
  return [
    "Roast this site using ONLY the analysis below. No inventions.",
    "Be sarcastic. Be specific. Be brief.",
    "",
    JSON.stringify({ grade, analysis }, null, 2)
  ].join("\n");
}

function isQuotaError(status, body) {
  if (status === 429) return true;
  if (typeof body === "string" && /quota|rate.?limit|too many requests/i.test(body)) return true;
  if (body && typeof body === "object") {
    const text = JSON.stringify(body);
    if (/quota|rate.?limit|too many requests/i.test(text)) return true;
  }
  return false;
}

async function callGroq(analysis) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  const endpoint = "https://api.groq.com/openai/v1/chat/completions";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.9,
      max_tokens: 700,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(analysis) }
      ]
    }),
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    let detail = "";
    let body = null;
    try {
      body = await response.json();
      detail = body?.error?.message || JSON.stringify(body);
    } catch {
      detail = await response.text().catch(() => "");
    }
    console.error(`[roast] Groq ${response.status}: ${detail}`);
    if (isQuotaError(response.status, body || detail)) return "QUOTA";
    return null;
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content?.trim();
  return text || null;
}

async function callGemini(analysis) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: buildUserPrompt(analysis) }]
        }
      ],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 700
      }
    }),
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    let detail = "";
    let body = null;
    try {
      body = await response.json();
      detail = body?.error?.message || JSON.stringify(body);
    } catch {
      detail = await response.text().catch(() => "");
    }
    console.error(`[roast] Gemini ${response.status}: ${detail}`);
    if (isQuotaError(response.status, body || detail)) return "QUOTA";
    return null;
  }

  const payload = await response.json();
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;

  const text = parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();

  return text || null;
}

function buildPlaceholderRoast(analysis) {
  const grade = getGrade(analysis.score);
  const domain = analysis.domain || "this site";

  const titleSnippet = analysis.title
    ? `"${analysis.title.slice(0, 60)}${analysis.title.length > 60 ? "..." : ""}"`
    : "literally nothing — no page title in sight";
  const h1Snippet = analysis.h1Texts[0]
    ? `"${String(analysis.h1Texts[0]).slice(0, 70)}${String(analysis.h1Texts[0]).length > 70 ? "..." : ""}"`
    : "no headline, just vibes";

  const genericCallout = analysis.genericHits?.length
    ? `Phrases like ${analysis.genericHits.slice(0, 2).map((h) => `"${h}"`).join(" and ")} are doing nothing for you.`
    : "At least the buzzword budget stayed under control.";

  const scriptBurn = analysis.scriptCount > 25
    ? `${analysis.scriptCount} script tags for one first impression — your users' phones are filing a complaint.`
    : "Script count is restrained. Suspiciously restrained.";
  const sizeBurn = analysis.sizeKb > 800
    ? `${analysis.sizeKb}KB of HTML before a single image paints. Bold strategy.`
    : "Page weight is refreshingly sane.";
  const ctaBurn = analysis.ctaTexts?.length
    ? `CTAs like ${analysis.ctaTexts.slice(0, 2).map((c) => `"${c}"`).join(" and ")} are giving 'we gave up'.`
    : "CTAs are at least original. That's the nicest thing I can say.";
  const viewportBurn = !analysis.viewport
    ? "No viewport meta. Mobile users are squinting at desktop archaeology."
    : "Viewport is set, which puts you ahead of roughly half the internet.";

  return [
    `${domain} scored ${analysis.score}/100 — ${grade.label}. ${grade.note}`,
    "",
    "Off-the-record roast (live commentary is napping):",
    `- Title ${titleSnippet} — I have questions.`
      .replace("- Title ", "- Title "),
    `- Headline ${h1Snippet}. Read it back to yourself slowly.`,
    `- ${genericCallout}`,
    `- ${scriptBurn}`,
    `- ${sizeBurn}`,
    `- ${ctaBurn}`,
    `- ${viewportBurn}`,
    "",
    "Even with my mouth taped shut, I can see at least three things that a one-week sprint could meaningfully fix.",
    "Want this fixed properly? Email me — I rebuild sites that convert."
  ].join("\n");
}

async function generateAiRoast(analysis) {
  const groqResult = await callGroq(analysis);
  if (groqResult && groqResult !== "QUOTA") return groqResult;

  const geminiResult = await callGemini(analysis);
  if (geminiResult && geminiResult !== "QUOTA") return geminiResult;

  return null;
}

async function generateRoast(analysis) {
  const aiRoast = await generateAiRoast(analysis);
  if (aiRoast) {
    return { roast: aiRoast, mode: "ai" };
  }

  return { roast: buildPlaceholderRoast(analysis), mode: "fallback" };
}

module.exports = {
  generateRoast,
  getGrade,
  buildPlaceholderRoast
};