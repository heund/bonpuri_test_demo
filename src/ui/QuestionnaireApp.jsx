import { useEffect, useState } from "react";
import questionsData from "../../data/test_questions_seed.json";
import deityMap from "../../data/deity_axis_map.json";
import resultTemplates from "../../data/result_templates.json";
import axisDefinitions from "../../data/axis_definitions.json";
import chogongThreeBrothersImage from "../../image/Deity/CHOGONGSHIN.svg";
import daebyeolsangManuraImage from "../../image/Deity/DAEBYUL.svg";
import donghaeYonggungDaughterImage from "../../image/Deity/DONGHAE.svg";
import gangnimImage from "../../image/Deity/GANGNIM.svg";
import jijangAgissiImage from "../../image/Deity/JIJANG.svg";
import myeongjingukDaughterImage from "../../image/Deity/MYUNG.svg";
import nokdisaengiImage from "../../image/Deity/NOKDI.svg";
import sobyeolwangImage from "../../image/Deity/SOBYUL.svg";
import yeosanBuinImage from "../../image/Deity/YEOSAN.svg";
import heroBlackPaperImage from "../../image/background/blackpaper.png";
import heroArchImage from "../../image/background/cutout.png";
import heroCloudImage from "../../image/background/cloud.png";
import heroCloudTwoImage from "../../image/background/cloud2.png";
import selfLensImage from "../../image/self_lens.svg";
import socialLensImage from "../../image/social_lens.svg";
import careOrientationImage from "../../image/care_orientation.svg";
import orderOrientationImage from "../../image/order_orientation.svg";
import { generateResult } from "../bonpuriScoringCore.js";
import ResultView from "./ResultView.jsx";

const PRELOAD_IMAGE_URLS = [
  chogongThreeBrothersImage,
  daebyeolsangManuraImage,
  donghaeYonggungDaughterImage,
  gangnimImage,
  jijangAgissiImage,
  myeongjingukDaughterImage,
  nokdisaengiImage,
  sobyeolwangImage,
  yeosanBuinImage,
  heroBlackPaperImage,
  heroArchImage,
  heroCloudImage,
  heroCloudTwoImage,
  selfLensImage,
  socialLensImage,
  careOrientationImage,
  orderOrientationImage
];

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
  const [hasStarted, setHasStarted] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    preloadAppAssets().finally(() => {
      if (isMounted) setAssetsReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

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

  function handleDebugResult() {
    if (!assetsReady) return;

    const debugAnswers = Object.fromEntries(
      questionsData.questions.map((question) => [question.id, question.options[0]?.id])
    );

    setResult(generateResult(debugAnswers, prototypeData));
    setHasStarted(true);
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

  if (!hasStarted) {
    return (
      <main className="landing-page">
        <section className="landing-panel" aria-labelledby="landing-title">
          <h1 id="landing-title">
            <span>Bonpuri</span>
            <span>Type Test</span>
          </h1>
          <p>{language === "ko" ? "언어를 선택하고 시작하세요" : "Select language to start"}</p>
          {!assetsReady ? (
            <p className="landing-loading-status">
              {language === "ko" ? "이미지를 불러오는 중입니다" : "Loading assets"}
            </p>
          ) : null}
          <div className="landing-language-actions">
            <button
              disabled={!assetsReady}
              type="button"
              onClick={() => {
                if (!assetsReady) return;
                setLanguage("en");
                setHasStarted(true);
              }}
            >
              English
            </button>
            <button
              disabled={!assetsReady}
              type="button"
              onClick={() => {
                if (!assetsReady) return;
                setLanguage("ko");
                setHasStarted(true);
              }}
            >
              한국어
            </button>
          </div>
          <button
            className="debug-result-button"
            disabled={!assetsReady}
            type="button"
            onClick={handleDebugResult}
          >
            Debug result page
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="questionnaire-page">
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

function preloadAppAssets() {
  const imagePromises = PRELOAD_IMAGE_URLS.map(preloadImage);
  const fontPromise = typeof document !== "undefined" && document.fonts
    ? document.fonts.ready
    : Promise.resolve();

  return Promise.allSettled([...imagePromises, fontPromise]);
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      if (image.decode) {
        image.decode().catch(() => undefined).finally(resolve);
        return;
      }

      resolve();
    };
    image.onerror = resolve;
    image.src = src;
  });
}
