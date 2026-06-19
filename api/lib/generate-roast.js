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

function buildHeuristicRoast(analysis) {
  const grade = getGrade(analysis.score);
  const lines = [
    `${analysis.domain} scored ${analysis.score}/100 — ${grade.label}. ${grade.note}`,
    ""
  ];

  if (analysis.title) {
    lines.push(`Title: "${analysis.title}"${analysis.title.length > 65 ? " — too long for search results." : ""}`);
  } else {
    lines.push("No page title found. Browsers and Google are improvising.");
  }

  if (analysis.metaDescription) {
    lines.push(`Meta description: "${analysis.metaDescription.slice(0, 140)}${analysis.metaDescription.length > 140 ? "..." : ""}"`);
  } else {
    lines.push("Missing meta description. Search engines are guessing what you do.");
  }

  if (analysis.h1Texts.length === 0) {
    lines.push("No H1 found. Your main message has no headline.");
  } else if (analysis.h1Texts.length === 1) {
    lines.push(`Main headline: "${analysis.h1Texts[0]}"`);
  } else {
    lines.push(`${analysis.h1Texts.length} H1 tags found: ${analysis.h1Texts.map((text) => `"${text}"`).join(", ")}. Pick one boss.`);
  }

  if (analysis.h2Texts.length > 0) {
    lines.push(`Subheads include: ${analysis.h2Texts.slice(0, 3).map((text) => `"${text}"`).join(", ")}.`);
  }

  lines.push(
    `Fetched in ${(analysis.responseMs / 1000).toFixed(1)}s at ~${analysis.sizeKb}KB HTML with ${analysis.scriptCount} scripts, ${analysis.stylesheetCount} stylesheets, and ${analysis.imageCount} images.`
  );

  if (!analysis.viewport) {
    lines.push("No viewport meta tag. Mobile users are not having a good time.");
  }

  if (analysis.genericHits.length > 0) {
    lines.push(`Generic copy detected: ${analysis.genericHits.map((hit) => `"${hit}"`).join(", ")}.`);
  }

  if (analysis.ctaTexts.length > 0) {
    lines.push(`Weak CTAs spotted: ${analysis.ctaTexts.slice(0, 4).map((text) => `"${text}"`).join(", ")}.`);
  }

  if (analysis.wordCount < 120) {
    lines.push(`Only about ${analysis.wordCount} words of visible copy on the page. Thin pages rarely convert.`);
  }

  if (analysis.scriptCount > 25) {
    lines.push(`${analysis.scriptCount} script tags is a lot of baggage for a first impression.`);
  }

  if (analysis.sizeKb > 1000) {
    lines.push(`${analysis.sizeKb}KB of HTML alone is heavy before images even show up.`);
  }

  if (!analysis.hasLang) {
    lines.push("Missing html lang attribute. Small detail, real accessibility miss.");
  }

  lines.push("", "Want this fixed properly? Email me — I rebuild sites that convert.");

  return lines.join("\n");
}

async function generateAiRoast(analysis) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) return null;

  const endpoint = process.env.OPENAI_API_KEY
    ? "https://api.openai.com/v1/chat/completions"
    : "https://ai-gateway.vercel.sh/v1/chat/completions";

  const grade = getGrade(analysis.score);
  const prompt = [
    "Write a brutal but useful website roast from real crawl data.",
    "Use short paragraphs and bullet-like lines.",
    "Quote actual titles/headlines when criticizing them.",
    "No fake metrics. No made-up features. No emojis.",
    "End with one sentence offering to fix it.",
    "",
    JSON.stringify({ grade, analysis }, null, 2)
  ].join("\n");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.ROAST_MODEL || "gpt-4o-mini",
      temperature: 0.8,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            "You are a direct, witty portfolio-site critic. Roast layout, copy, SEO, performance, and trust signals using only the supplied analysis data."
        },
        { role: "user", content: prompt }
      ]
    }),
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) return null;

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content?.trim();
  return text || null;
}

async function generateRoast(analysis) {
  const aiRoast = await generateAiRoast(analysis);
  if (aiRoast) {
    return { roast: aiRoast, mode: "ai" };
  }

  return { roast: buildHeuristicRoast(analysis), mode: "analysis" };
}

module.exports = {
  generateRoast,
  getGrade
};
