import { useMemo, useState } from "react";
import questionsData from "../../data/test_questions_seed.json";
import deityMap from "../../data/deity_axis_map.json";
import resultTemplates from "../../data/result_templates.json";
import axisDefinitions from "../../data/axis_definitions.json";
import { generateResult } from "../bonpuriScoringCore.js";
import ResultView from "./ResultView.jsx";

const prototypeData = {
  axisDefinitions,
  questions: questionsData,
  deityMap,
  templates: resultTemplates
};

export default function QuestionnaireApp() {
  const questions = questionsData.questions;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progressLabel = `Question ${currentQuestionIndex + 1} / ${questions.length}`;
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  const phaseLabel = useMemo(() => {
    return currentQuestion.phase
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [currentQuestion.phase]);

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
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setResult(null);
  }

  function handleBack() {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  }

  if (result) {
    return <ResultView result={result} onRestart={handleRestart} />;
  }

  return (
    <main>
      <h1>Bonpuri Questionnaire</h1>

      <section
        className="question-section"
        aria-labelledby="question-title"
      >
        <p>{progressLabel}</p>
        <progress value={progressPercent} max="100">
          {Math.round(progressPercent)}%
        </progress>
        <p>Phase: {phaseLabel}</p>

        <h2 id="question-title" key={currentQuestion.id}>
          {currentQuestion.text}
        </h2>

        <div className="answer-list" key={`${currentQuestion.id}-answers`}>
          {currentQuestion.options.map((option, index) => (
            <button
              className="answer-button"
              key={option.id}
              type="button"
              onClick={() => handleAnswer(option.id)}
            >
              {String.fromCharCode(65 + index)}. {option.text}
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
            Back
          </button>
        </div>
      </section>
    </main>
  );
}
