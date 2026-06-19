const dns = require("node:dns/promises");
const { isIP } = require("node:net");

const GENERIC_PHRASES = [
  "leading provider",
  "innovative solutions",
  "cutting edge",
  "cutting-edge",
  "synergy",
  "leverage",
  "world class",
  "world-class",
  "best in class",
  "lorem ipsum",
  "welcome to our website",
  "your trusted partner",
  "empowering",
  "seamless experience",
  "next generation",
  "next-generation"
];

function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip === "127.0.0.1" || ip === "0.0.0.0" || ip === "::1") return true;
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);

  if (isIP(ip) === 4) {
    const parts = ip.split(".").map(Number);
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    return false;
  }

  if (isIP(ip) === 6) {
    const normalized = ip.toLowerCase();
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    if (normalized.startsWith("fe80")) return true;
    return false;
  }

  return true;
}

async function assertPublicHost(hostname) {
  const lowered = hostname.toLowerCase();
  if (
    lowered === "localhost" ||
    lowered.endsWith(".local") ||
    lowered.endsWith(".internal") ||
    lowered.endsWith(".localhost")
  ) {
    throw new Error("That URL points to a local or internal host.");
  }

  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("That URL points to a private network address.");
    return;
  }

  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!records.length) throw new Error("Could not resolve that domain.");

  for (const record of records) {
    if (isPrivateIp(record.address)) {
      throw new Error("That URL resolves to a private network address.");
    }
  }
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }
  return url;
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function matchTag(html, pattern) {
  const match = html.match(pattern);
  return match ? stripTags(match[1]) : "";
}

function matchAllTags(html, pattern) {
  return [...html.matchAll(pattern)]
    .map((match) => stripTags(match[1]))
    .filter(Boolean);
}

function countMatches(html, pattern) {
  return (html.match(pattern) || []).length;
}

function extractAnalysis(html, url, responseMs, byteLength) {
  const title = matchTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescription = matchTag(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i
  ) || matchTag(
    html,
    /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i
  );
  const viewport = /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);
  const h1Texts = matchAllTags(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).slice(0, 6);
  const h2Texts = matchAllTags(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).slice(0, 6);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyText = bodyMatch ? stripTags(bodyMatch[1]) : stripTags(html);
  const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;
  const visibleTextSample = bodyText.slice(0, 280);
  const lowerBlob = `${title} ${metaDescription} ${h1Texts.join(" ")} ${visibleTextSample}`.toLowerCase();

  const genericHits = GENERIC_PHRASES.filter((phrase) => lowerBlob.includes(phrase));
  const scriptCount = countMatches(html, /<script\b/gi);
  const stylesheetCount = countMatches(html, /<link[^>]+rel=["'][^"']*stylesheet[^"']*["'][^>]*>/gi);
  const imageCount = countMatches(html, /<img\b/gi);
  const inlineStyleCount = countMatches(html, /style=["'][^"']+["']/gi);
  const iframeCount = countMatches(html, /<iframe\b/gi);
  const hasOgTitle = /<meta[^>]+property=["']og:title["'][^>]*>/i.test(html);
  const hasOgDescription = /<meta[^>]+property=["']og:description["'][^>]*>/i.test(html);
  const hasLang = /<html[^>]+lang=["'][^"']+["']/i.test(html);
  const ctaTexts = matchAllTags(html, /<(?:a|button)[^>]*>([\s\S]*?)<\/(?:a|button)>/gi)
    .map((text) => text.trim())
    .filter((text) => /^(learn more|click here|submit|read more|get started|contact us)$/i.test(text));

  const sizeKb = Math.round(byteLength / 1024);
  const score = calculateScore({
    title,
    metaDescription,
    viewport,
    h1Texts,
    wordCount,
    genericHits,
    scriptCount,
    stylesheetCount,
    sizeKb,
    responseMs,
    hasLang,
    ctaTexts
  });

  return {
    url: url.href,
    domain: url.hostname.replace(/^www\./, ""),
    title,
    metaDescription,
    viewport,
    h1Texts,
    h2Texts,
    wordCount,
    visibleTextSample,
    genericHits,
    scriptCount,
    stylesheetCount,
    imageCount,
    inlineStyleCount,
    iframeCount,
    hasOgTitle,
    hasOgDescription,
    hasLang,
    ctaTexts,
    sizeKb,
    responseMs,
    score
  };
}

function calculateScore(analysis) {
  let score = 100;

  if (!analysis.title) score -= 12;
  if (analysis.title && analysis.title.length > 70) score -= 6;
  if (!analysis.metaDescription) score -= 10;
  if (analysis.metaDescription && analysis.metaDescription.length < 50) score -= 4;
  if (!analysis.viewport) score -= 14;
  if (analysis.h1Texts.length === 0) score -= 12;
  if (analysis.h1Texts.length > 1) score -= 8;
  if (analysis.wordCount < 120) score -= 8;
  if (analysis.genericHits.length > 0) score -= Math.min(18, analysis.genericHits.length * 6);
  if (analysis.scriptCount > 20) score -= 10;
  if (analysis.scriptCount > 35) score -= 8;
  if (analysis.stylesheetCount > 8) score -= 6;
  if (analysis.sizeKb > 800) score -= 10;
  if (analysis.sizeKb > 1500) score -= 8;
  if (analysis.responseMs > 2500) score -= 8;
  if (analysis.responseMs > 5000) score -= 8;
  if (!analysis.hasLang) score -= 4;
  if (analysis.ctaTexts.length > 0) score -= Math.min(10, analysis.ctaTexts.length * 4);

  return Math.max(8, Math.min(96, Math.round(score)));
}

async function analyzeSite(inputUrl) {
  const url = normalizeUrl(inputUrl);
  await assertPublicHost(url.hostname);

  const started = Date.now();
  const response = await fetch(url.href, {
    redirect: "follow",
    headers: {
      "User-Agent": "IbtsamPortfolioRoast/1.0 (+https://ibtsam.dev)",
      Accept: "text/html,application/xhtml+xml"
    },
    signal: AbortSignal.timeout(15000)
  });

  const responseMs = Date.now() - started;
  if (!response.ok) {
    throw new Error(`The site responded with HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
    throw new Error("That URL did not return an HTML page.");
  }

  const html = await response.text();
  const byteLength = Buffer.byteLength(html, "utf8");
  if (byteLength > 2_500_000) {
    throw new Error("That page is too large to roast safely. Try a lighter landing page.");
  }

  return extractAnalysis(html, url, responseMs, byteLength);
}

module.exports = {
  analyzeSite,
  normalizeUrl
};
