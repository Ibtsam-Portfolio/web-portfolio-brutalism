import React from "react";
import { Link } from "react-router-dom";
import { SiteHeader, SiteFooter } from "./SiteChrome";
import styles from "./CaseStudy.module.css";

export default function CaseStudy({ project }) {
  const {
    title,
    role,
    client,
    year,
    problem,
    solution,
    features,
    techStack,
    results,
    visuals,
    quote,
    quoteAuthor,
    quoteRole
  } = project;

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
            aria-pressed="false"
            onClick={() => document.body.classList.toggle("is-chaos")}
          >
            Chaos <span aria-hidden="true">⚡</span>
          </button>
        )}
      />

      <main id="top">
        {/* 1. HERO */}
        <section className={styles.hero} aria-labelledby="hero-title">
          <Link to="/#work" className={styles.backLink}>
            ← Back to work
          </Link>
          <div className={styles.heroContent}>
            <div className={styles.heroInfo}>
              <p className={styles.heroRole}>{role}</p>
              <p className={styles.heroMeta}>{client} • {year}</p>
            </div>
            <h1 id="hero-title" className={styles.heroTitle}>
              {title}
            </h1>
          </div>
          {visuals?.hero && (
            <div className={styles.heroImage}>
              <img
                src={visuals.hero}
                alt={`${title} screenshot`}
                className={styles.heroImageImg}
              />
            </div>
          )}
        </section>

        {/* 2. PROBLEM */}
        <section className={styles.section} aria-labelledby="problem-title">
          <div className={styles.sectionShell}>
            <h2 id="problem-title" className={styles.sectionLabel}>
              PROBLEM
            </h2>
            <p className={styles.sectionText}>{problem}</p>
          </div>
        </section>

        {/* 3. SOLUTION */}
        <section className={styles.section} aria-labelledby="solution-title">
          <div className={styles.sectionShell}>
            <h2 id="solution-title" className={styles.sectionLabel}>
              SOLUTION
            </h2>
            <div className={styles.solutionList}>
              {solution.map((point, index) => (
                <div key={index} className={styles.solutionItem}>
                  <span className={styles.solutionNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <p className={styles.solutionText}>{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. FEATURES */}
        <section className={styles.section} aria-labelledby="features-title">
          <div className={styles.sectionShell}>
            <h2 id="features-title" className={styles.sectionLabel}>
              FEATURES
            </h2>
            <div className={styles.featuresGrid}>
              {features.map((feature, index) => (
                <article key={index} className={styles.featureCard}>
                  <h3 className={styles.featureName}>{feature.name}</h3>
                  <p className={styles.featureDesc}>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5. TECH STACK */}
        <section className={styles.section} aria-labelledby="tech-title">
          <div className={styles.sectionShell}>
            <h2 id="tech-title" className={styles.sectionLabel}>
              TECH STACK
            </h2>
            <div className={styles.techTags}>
              {techStack.map((tech, index) => (
                <span key={index} className={styles.techTag}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 6. RESULTS */}
        <section className={styles.section} aria-labelledby="results-title">
          <div className={styles.sectionShell}>
            <h2 id="results-title" className={styles.sectionLabel}>
              OUTCOME
            </h2>
            <div className={styles.resultsGrid}>
              {results.map((result, index) => (
                <div key={index} className={styles.resultItem}>
                  <span className={styles.resultValue}>{result.value}</span>
                  <span className={styles.resultLabel}>{result.label}</span>
                </div>
              ))}
            </div>
            {quote && (
              <blockquote className={styles.quoteBlock}>
                <p className={styles.quoteText}>"{quote}"</p>
                {quoteAuthor && (
                  <cite className={styles.quoteCite}>
                    — {quoteAuthor}
                    {quoteRole && <span className={styles.quoteRole}>{quoteRole}</span>}
                  </cite>
                )}
              </blockquote>
            )}
          </div>
        </section>

        {/* 7. VISUALS */}
        {visuals?.gallery && visuals.gallery.length > 0 && (
          <section className={styles.section} aria-labelledby="visuals-title">
            <div className={styles.sectionShell}>
              <h2 id="visuals-title" className={styles.sectionLabel}>
                VISUALS
              </h2>
              <div className={styles.visualsGrid}>
                {visuals.gallery.map((image, index) => (
                  <div key={index} className={styles.visualItem}>
                    <img
                      src={image}
                      alt={`${title} screenshot ${index + 1}`}
                      className={styles.visualImage}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 8. CLIENT QUOTE */}
        {quote && (
          <section className={styles.section} aria-labelledby="client-title">
            <div className={styles.sectionShell}>
              <h2 id="client-title" className={styles.sectionLabel}>
                CLIENT
              </h2>
              <blockquote className={styles.clientQuote}>
                <p className={styles.clientQuoteText}>"{quote}"</p>
                <cite className={styles.clientCite}>
                  — {quoteAuthor}
                  {quoteRole && <span className={styles.clientQuoteRole}>{quoteRole}</span>}
                </cite>
              </blockquote>
            </div>
          </section>
        )}

        {/* 9. CTA */}
        <section className={styles.ctaSection} aria-labelledby="cta-title">
          <div className={styles.sectionShell}>
            <h2 id="cta-title" className={styles.ctaTitle}>
              READY TO BUILD SOMETHING SIMILAR?
            </h2>
            <div className={styles.ctaButtons}>
              <a
                className={`${styles.button} ${styles.buttonPrimary}`}
                href="mailto:ibtsam.dev@gmail.com?subject=Project%20inquiry"
              >
                START A PROJECT →
              </a>
              <Link className={`${styles.button} ${styles.buttonSecondary}`} to="/#work">
                VIEW ALL WORK
              </Link>
            </div>
          </div>
        </section>
      </main>

      <section id="contact" className={styles.contactSection}>
        <div className={styles.contactInner}>
          <h2>
            <span className={styles.contactLine}>LET'S</span>
            <span className={`${styles.contactLine} ${styles.outlineWord}`}>BUILD</span>
            <span className={styles.contactLine}>SOMETHING.</span>
          </h2>
          <p>Open for 1–2 projects this quarter. Tell me what you're making — or just say hi.</p>

          <div className={styles.ctaGrid}>
            <div className={styles.contactEmailWrap}>
              <button
                type="button"
                className={styles.contactEmailButton}
                onClick={() => {
                  navigator.clipboard?.writeText("ibtsam.dev@gmail.com");
                }}
              >
                ibtsam.dev@gmail.com
              </button>
            </div>
            <a className={styles.contactLink} href="mailto:ibtsam.dev@gmail.com?subject=Hello%20Ibtsam%20Ishtiaq">
              EMAIL →
            </a>
            <a className={styles.contactLink} href="https://www.linkedin.com/in/ibtsam357/" target="_blank" rel="noopener noreferrer">
              LINKEDIN →
            </a>
          </div>

          <SiteFooter />
        </div>
      </section>
    </>
  );
}