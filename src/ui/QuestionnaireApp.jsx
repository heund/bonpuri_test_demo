import { useEffect, useState } from "react";
import questionsData from "../../data/test_questions_seed.json";
import deityMap from "../../data/deity_axis_map.json";
import resultTemplates from "../../data/result_templates.json";
import axisDefinitions from "../../data/axis_definitions.json";
import { generateResult } from "../bonpuriScoringCore.js";
import ResultView from "./ResultView.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const prototypeData = {
  axisDefinitions,
  questions: questionsData,
  deityMap,
  templates: resultTemplates
};

export default function QuestionnaireApp() {
  const [questions, setQuestions] = useState(() => shuffleQuestionnaire(questionsData.questions));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const currentQuestion = questions[currentQuestionIndex];
  const progressLabel = language === "ko"
    ? `질문 ${currentQuestionIndex + 1} / ${questions.length}`
    : `Question ${currentQuestionIndex + 1} / ${questions.length}`;
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
  const questionText = getLocalizedQuestionText(currentQuestion, language);

  function handleAnswer(optionId) {
    const nextAnswers = {
      ...selectedAnswers,
      [currentQuestion.id]: optionId
    };

    setSelectedAnswers(nextAnswers);

    window.setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        return;
      }

      setResult(generateResult(nextAnswers, prototypeData));
    }, 120);
  }

  function handleRestart() {
    setQuestions(shuffleQuestionnaire(questionsData.questions));
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setResult(null);
    setHasStarted(false);
  }

  function handleBack() {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  }

  if (result) {
    return (
      <ResultView
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={setTheme}
        result={result}
        onRestart={handleRestart}
      />
    );
  }

  if (!hasStarted) {
    return (
      <main className="landing-page">
        <ThemeToggle theme={theme} onThemeChange={setTheme} />
        <section className="landing-panel" aria-labelledby="landing-title">
          <h1 id="landing-title">
            <span>Bonpuri</span>
            <span>Type Test</span>
          </h1>
          <p>{language === "ko" ? "언어를 선택하고 시작하세요" : "Select language to start"}</p>
          <div className="landing-language-actions">
            <button
              type="button"
              onClick={() => {
                setLanguage("en");
                setHasStarted(true);
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => {
                setLanguage("ko");
                setHasStarted(true);
              }}
            >
              한국어
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="questionnaire-page">
      <div className="page-top-bar">
        <ThemeToggle theme={theme} onThemeChange={setTheme} />
      </div>
      <h1>{language === "ko" ? "본풀이 성향 테스트" : "Bonpuri Type Test"}</h1>

      <section
        className="question-section"
        aria-labelledby="question-title"
      >
        <p>{progressLabel}</p>
        <div
          aria-label={progressLabel}
          aria-valuemax="100"
          aria-valuemin="0"
          aria-valuenow={Math.round(progressPercent)}
          className="question-progress"
          role="progressbar"
        >
          <span style={{ width: `${progressPercent}%` }} />
        </div>

        <h2 id="question-title" key={currentQuestion.id}>
          {questionText}
        </h2>

        <div className="answer-list" key={`${currentQuestion.id}-answers`}>
          {currentQuestion.options.map((option, index) => (
            <button
              className={`answer-button ${selectedAnswers[currentQuestion.id] === option.id ? "is-selected" : ""}`}
              key={option.id}
              type="button"
              onClick={() => handleAnswer(option.id)}
            >
              <span className={`answer-marker answer-marker-${index}`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span>{getLocalizedOptionText(option, language)}</span>
            </button>
          ))}
        </div>

        <div className="question-actions">
          <button
            className="back-button"
            type="button"
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
          >
            {language === "ko" ? "이전" : "Back"}
          </button>
        </div>
      </section>
    </main>
  );
}

function getLocalizedQuestionText(question, language) {
  return language === "ko" ? question.text_ko || question.text : question.text;
}

function getLocalizedOptionText(option, language) {
  return language === "ko" ? option.text_ko || option.text : option.text;
}

function shuffleQuestionnaire(questions) {
  return shuffle(questions).map((question) => ({
    ...question,
    options: shuffle(question.options)
  }));
}

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}
