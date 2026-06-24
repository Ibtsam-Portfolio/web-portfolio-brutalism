import * as Sentry from "@sentry/react";
import posthog from "posthog-js";

const SENTRY_DSN = "https://c66987763f43d9dbf793df799eb091b8@o4510978875457536.ingest.us.sentry.io/4511612100280320";
const POSTHOG_KEY = "phc_riyBaRxFM2PviQdsyPMo3fSwXhgss8r7a424giqgCotA";
const POSTHOG_HOST = "https://us.posthog.com";

export function initAnalytics() {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration()
    ],
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE
  });

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false,
    loaded: () => {
      posthog.register({
        app: "portfolio",
        version: import.meta.env.MODE
      });
    }
  });
}

export { Sentry, posthog };
