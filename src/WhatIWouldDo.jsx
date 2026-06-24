import React, { useMemo, useState } from "react";

const questions = [
  {
    question: "You have 2 weeks to launch. Do you...",
    choices: {
      A: "Ship fast. Fix it live.",
      B: "Build it right. Then ship."
    },
    answer: "A",
    verdict: "Ship fast. Momentum beats perfection.",
    highlight: "Momentum beats perfection.",
    take: "A version users can break is worth more than a perfect version nobody sees. I ship the smallest thing that proves the idea, then iterate fast. Perfection is a roadblock wearing a lab coat."
  },
  {
    question: "Client wants it done cheap OR done right.",
    choices: {
      A: "Do it cheap. Close the deal.",
      B: "Hold the line. Charge right."
    },
    answer: "B",
    verdict: "Hold the line. Cheap work costs more later.",
    highlight: "Cheap work costs more later.",
    take: "Discounting to close is a trap. You resent the project, cut corners to survive it, and the client gets half a product. I'd rather lose the deal than ship something I'm embarrassed by."
  },
  {
    question: "New project stack choice...",
    choices: {
      A: "Boring stack I know cold.",
      B: "Shiny new tech. More fun."
    },
    answer: "A",
    verdict: "Boring stack. Reliability isn't boring - it's professional.",
    highlight: "Reliability isn't boring",
    take: "Client projects aren't my personal sandbox. I pick the stack I can debug at 2am without Googling. New tech is for side projects. MERN works. I use MERN."
  },
  {
    question: "The design looks generic but the client loves it.",
    choices: {
      A: "Ship it. Client is happy.",
      B: "Push back. Make it sharper."
    },
    answer: "B",
    verdict: "Push back. Generic is the only thing I won't build.",
    highlight: "Generic is the only thing",
    take: "A happy client with a forgettable site doesn't refer you. I tell them honestly why it should be sharper - show examples, make the case. Most founders came to me to not look like everyone else. I remind them."
  },
  {
    question: "You're mid-project and spot a better architecture.",
    choices: {
      A: "Refactor now. Do it right.",
      B: "Finish the scope. Note it for v2."
    },
    answer: "B",
    verdict: "Finish the scope. Scope creep kills launches.",
    highlight: "Scope creep kills launches.",
    take: "Mid-project rewrites are how projects die. I log the better approach, finish what I promised, then propose the refactor as a paid follow-on. Discipline over cleverness every time."
  }
];

const scoreVerdicts = [
  "Different wavelength. That's okay.",
  "You get the basics. Room to grow.",
  "Some overlap. Interesting.",
  "Decent alignment. We could talk.",
  "Strong alignment. Let's build.",
  "We think exactly the same. Let's build something."
];

function formatQuestionNumber(index) {
  return String(index + 1).padStart(2, "0");
}

function HighlightedVerdict({ verdict, highlight }) {
  const start = verdict.indexOf(highlight);
  if (start === -1) return verdict;

  return (
    <>
      {verdict.slice(0, start)}
      <mark>{highlight}</mark>
      {verdict.slice(start + highlight.length)}
    </>
  );
}

function ScoreVerdict({ score }) {
  const verdict = scoreVerdicts[score];
  const firstSentenceEnd = verdict.indexOf(".");
  const hasFirstSentence = firstSentenceEnd !== -1;
  const firstPart = hasFirstSentence ? verdict.slice(0, firstSentenceEnd + 1) : verdict;
  const rest = hasFirstSentence ? verdict.slice(firstSentenceEnd + 1).trimStart() : "";

  return (
    <p className="score-verdict">
      <span className="score-verdict-badge">{firstPart}</span>{rest ? ` ${rest}` : ""}
    </p>
  );
}

export default function WhatIWouldDo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [isComplete, setIsComplete] = useState(false);
  const currentQuestion = questions[currentIndex];
  const selectedChoice = answers[currentIndex];

  const score = useMemo(
    () => answers.reduce((total, answer, index) => total + (answer === questions[index].answer ? 1 : 0), 0),
    [answers]
  );

  const choose = (choice) => {
    setAnswers((previous) => previous.map((answer, index) => (index === currentIndex ? choice : answer)));
  };

  const goNext = () => {
    if (currentIndex === questions.length - 1) {
      setIsComplete(true);
      return;
    }
    setCurrentIndex((index) => index + 1);
  };

  const playAgain = () => {
    setAnswers(Array(questions.length).fill(null));
    setCurrentIndex(0);
    setIsComplete(false);
  };

  return (
    <section className="section-shell section-spaced-end what-do-section" id="what-ibtsam-would-do" aria-labelledby="what-do-title">
      <h2 className="section-title" id="what-do-title">What I would do.</h2>
      <p className="section-note">// Real decisions. Brutal takes.</p>

      {isComplete ? (
        <div className="score-card">
          <span className="question-badge">{formatQuestionNumber(questions.length - 1)}</span>
          <p className="section-note">// final score</p>
          <h3>{score}/5</h3>
          <ScoreVerdict score={score} />
          <button className="quiz-next quiz-next-green" type="button" onClick={playAgain}>
            Play Again →
          </button>
        </div>
      ) : (
        <div className="what-do-card">
          <div className="what-do-topline">
            <span className="question-badge">{formatQuestionNumber(currentIndex)}</span>
            <span className="question-count">Question {currentIndex + 1} / {questions.length}</span>
          </div>

          <h3 className="what-do-question">{currentQuestion.question}</h3>

          <div className="choice-grid">
            {(["A", "B"]).map((choice) => (
              <button
                className={[
                  "choice-button",
                  selectedChoice === choice ? "is-selected" : "",
                  selectedChoice && selectedChoice !== choice ? "is-dimmed" : ""
                ].filter(Boolean).join(" ")}
                type="button"
                key={choice}
                disabled={Boolean(selectedChoice)}
                onClick={() => choose(choice)}
              >
                <span>{choice}</span>
                <strong>{currentQuestion.choices[choice]}</strong>
              </button>
            ))}
          </div>

          <div className={`reveal-panel${selectedChoice ? " is-open" : ""}`} aria-live="polite">
            {selectedChoice && (
              <>
                <p className={`match-line ${selectedChoice === currentQuestion.answer ? "is-match" : "is-miss"}`}>
                  {selectedChoice === currentQuestion.answer ? "✓ IBTSAM CHOSE THIS TOO" : "✗ IBTSAM WENT THE OTHER WAY"}
                </p>
                <h4>
                  <HighlightedVerdict verdict={currentQuestion.verdict} highlight={currentQuestion.highlight} />
                </h4>
                <p>{currentQuestion.take}</p>
              </>
            )}
          </div>

          <div className="quiz-controls">
            <div className="progress-dots" aria-label="Quiz progress">
              {questions.map((_, index) => (
                <span
                  className={answers[index] ? "is-done" : index === currentIndex ? "is-current" : ""}
                  key={index}
                />
              ))}
            </div>
            <button className="quiz-next" type="button" onClick={goNext}>
              {currentIndex === questions.length - 1 && selectedChoice ? "Submit →" : selectedChoice ? "Next →" : "Skip →"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
