import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useParams, useLocation } from "react-router-dom";
import * as Sentry from "@sentry/react";
import App from "./App";
import Roast from "./Roast";
import RoastBrutalist from "./RoastBrutalist";
import CaseStudy from "./CaseStudy";
import { caseStudies } from "./caseStudiesData";
import { initAnalytics, posthog } from "./analytics";
import "../tokens.css";
import "../fonts.css";
import "../styles.css";

initAnalytics();

const SentryErrorBoundary = Sentry.ErrorBoundary;

function CaseStudyRoute() {
  const { id } = useParams();
  const project = caseStudies.find((cs) => cs.id === id);
  if (!project) return <App />;
  return <CaseStudy project={project} />;
}

function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    posthog.capture("$pageview", {
      $current_url: window.location.href,
      path: location.pathname
    });
  }, [location.pathname]);
  return null;
}

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={<div style={{ padding: "2rem", fontFamily: "monospace" }}>Something broke. Refresh the page.</div>}>
      <BrowserRouter>
        <PageViewTracker />
        <Routes>
          <Route path="/roast" element={<Roast />} />
          <Route path="/roast-brutalist" element={<RoastBrutalist />} />
          <Route path="/case-study/:id" element={<CaseStudyRoute />} />
          <Route path="/" element={<App />} />
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </SentryErrorBoundary>
  </React.StrictMode>
);
