// Local dev API server. Mounts api/roast.js at POST /api/roast.
// Run with: node api/server.cjs
const fs = require("node:fs");
const path = require("node:path");
const express = require("express");

// Load .env from project root
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const app = express();
app.use(express.json({ limit: "1mb" }));

// Inline-load the handler so we don't need ESM/CJS juggling
const apiDir = path.join(__dirname);
const analyzeSiteMod = require(path.join(apiDir, "lib", "analyze-site.js"));
const generateRoastMod = require(path.join(apiDir, "lib", "generate-roast.js"));

let handlerSrc = fs.readFileSync(path.join(apiDir, "roast.js"), "utf8");
handlerSrc = handlerSrc
  .replace('const { analyzeSite } = require("./lib/analyze-site");', "const { analyzeSite } = __injA;")
  .replace('const { generateRoast, getGrade } = require("./lib/generate-roast");', "const { generateRoast, getGrade } = __injG;");

const handlerModule = { exports: {} };
new Function("module", "exports", "require", "__dirname", "__filename", "__injA", "__injG", handlerSrc)(
  handlerModule,
  handlerModule.exports,
  () => ({}),
  apiDir,
  path.join(apiDir, "roast.js"),
  analyzeSiteMod,
  generateRoastMod
);
const handler = handlerModule.exports;

app.post("/api/roast", (req, res) => handler(req, res));
app.options("/api/roast", (req, res) => handler(req, res));

const PORT = process.env.API_PORT || 5174;
app.listen(PORT, () => {
  console.log(`[api] roast server listening on http://localhost:${PORT}`);
  console.log(`[api] keys loaded: GROQ=${process.env.GROQ_API_KEY ? "yes" : "no"} GEMINI=${process.env.GEMINI_API_KEY ? "yes" : "no"}`);
});