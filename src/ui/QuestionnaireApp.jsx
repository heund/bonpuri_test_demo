import { useState } from "react";
import questionsData from "../../data/test_questions_seed.json";
import deityMap from "../../data/deity_axis_map.json";
import resultTemplates from "../../data/result_templates.json";
import axisDefinitions from "../../data/axis_definitions.json";
import { generateResult } from "../bonpuriScoringCore.js";
import LanguageToggle from "./LanguageToggle.jsx";
import ResultView from "./ResultView.jsx";

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

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      return;
    }

    setResult(generateResult(nextAnswers, prototypeData));
  }

  function handleRestart() {
    setQuestions(shuffleQuestionnaire(questionsData.questions));
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setResult(null);
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
        result={result}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <main className="questionnaire-page">
      <div className="page-top-bar">
        <LanguageToggle language={language} onLanguageChange={setLanguage} />
      </div>
      <h1>{language === "ko" ? "본풀이 성향 테스트" : "Bonpuri Type Test"}</h1>

      <section
        className="question-section"
        aria-labelledby="question-title"
      >
        <p>{progressLabel}</p>
        <progress value={progressPercent} max="100">
          {Math.round(progressPercent)}%
        </progress>

        <h2 id="question-title" key={currentQuestion.id}>
          {questionText}
        </h2>

        <div className="answer-list" key={`${currentQuestion.id}-answers`}>
          {currentQuestion.options.map((option, index) => (
            <button
              className="answer-button"
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
