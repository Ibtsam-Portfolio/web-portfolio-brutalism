const { analyzeSite } = require("./lib/analyze-site");
const { generateRoast, getGrade } = require("./lib/generate-roast");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON body." });
    }
  }

  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!url) {
    return res.status(400).json({ error: "Paste a URL first. Empty targets are too easy." });
  }

  try {
    const analysis = await analyzeSite(url);
    const { roast, mode } = await generateRoast(analysis);
    const grade = getGrade(analysis.score);

    return res.status(200).json({
      roast,
      mode,
      score: analysis.score,
      grade: grade.label,
      domain: analysis.domain
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not roast that site.";
    return res.status(400).json({ error: message });
  }
};
