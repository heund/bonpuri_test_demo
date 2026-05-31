import { useEffect, useRef, useState } from "react";
import questionsData from "../../data/test_questions_seed.json";
import deityMap from "../../data/deity_axis_map.json";
import resultTemplates from "../../data/result_templates.json";
import axisDefinitions from "../../data/axis_definitions.json";
import chogongThreeBrothersImage from "../../image/DeityWebp/CHOGONGSHIN.webp";
import daebyeolsangManuraImage from "../../image/DeityWebp/DAEBYUL.webp";
import donghaeYonggungDaughterImage from "../../image/DeityWebp/DONGHAE.webp";
import gangnimImage from "../../image/DeityWebp/GANGNIM.webp";
import jijangAgissiImage from "../../image/DeityWebp/JIJANG.webp";
import myeongjingukDaughterImage from "../../image/DeityWebp/MYUNG.webp";
import nogaDanpungAgissiImage from "../../image/DeityWebp/NOGA.webp";
import nokdisaengiImage from "../../image/DeityWebp/NOKDI.webp";
import sobyeolwangImage from "../../image/DeityWebp/SOBYUL.webp";
import yeosanBuinImage from "../../image/DeityWebp/YEOSAN.webp";
import yuJeongseungDaughterImage from "../../image/DeityWebp/YUJEONG.webp";
import heroBlackPaperImage from "../../image/BackgroundWebp/blackpaper_final_strip.webp";
import heroMainPaperImage from "../../image/BackgroundWebp/PAPER_MAIN.webp";
import heroArchImage from "../../image/BackgroundWebp/cutout.webp";
import heroCloudImage from "../../image/BackgroundWebp/cloud.webp";
import heroCloudTwoImage from "../../image/BackgroundWebp/cloud2.webp";
import introCloudFourImage from "../../image/background/cloud4.png";
import heroMountainImage from "../../image/BackgroundWebp/mountain.webp";
import heroOceanImage from "../../image/BackgroundWebp/ocean.webp";
import introLogoImage from "../../image/logo/LOGOONLY_WW.svg";
import introKoreanDoorwayImage from "../../image/typography/doorway_korean.svg";
import selfLensImage from "../../image/self_lens.svg";
import socialLensImage from "../../image/social_lens.svg";
import careOrientationImage from "../../image/care_orientation.svg";
import orderOrientationImage from "../../image/order_orientation.svg";
import introPrototypeUrl from "../../intro.html?url";
import introModelUrl from "../../assets/3d/door_letter.optimized.glb?url";
import { generateResult } from "../bonpuriScoringCore.js";
import ResultView from "./ResultView.jsx";

const DEITY_WARMUP_URLS = [
  chogongThreeBrothersImage,
  daebyeolsangManuraImage,
  donghaeYonggungDaughterImage,
  gangnimImage,
  jijangAgissiImage,
  myeongjingukDaughterImage,
  nogaDanpungAgissiImage,
  nokdisaengiImage,
  sobyeolwangImage,
  yeosanBuinImage,
  yuJeongseungDaughterImage
];

const PRELOAD_IMAGE_URLS = [
  ...DEITY_WARMUP_URLS,
  heroMainPaperImage,
  heroBlackPaperImage,
  heroArchImage,
  heroCloudImage,
  heroCloudTwoImage,
  introCloudFourImage,
  introLogoImage,
  introKoreanDoorwayImage,
  heroMountainImage,
  heroOceanImage,
  selfLensImage,
  socialLensImage,
  careOrientationImage,
  orderOrientationImage
];
const PRELOAD_FETCH_URLS = [
  introPrototypeUrl,
  introModelUrl
];
const WARMUP_SETTLE_FRAMES = 2;

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
  const [initialDebugDeityId, setInitialDebugDeityId] = useState("");
  const [language, setLanguage] = useState("en");
  const [hasStarted, setHasStarted] = useState(false);
  const [introIsExiting, setIntroIsExiting] = useState(false);
  const [loadedAssetUrls, setLoadedAssetUrls] = useState(() => new Set());
  const [fontsReady, setFontsReady] = useState(false);
  const [paintSettled, setPaintSettled] = useState(false);
  const introFrameRef = useRef(null);
  const introExitTimeoutRef = useRef(0);
  const assetCount = PRELOAD_IMAGE_URLS.length + PRELOAD_FETCH_URLS.length + 1;
  const loadedAssets = loadedAssetUrls.size + (fontsReady ? 1 : 0);
  const assetsReady = loadedAssets >= assetCount && paintSettled;
  const loadingProgress = assetsReady ? 100 : Math.round((loadedAssets / assetCount) * 100);

  useEffect(() => {
    let isMounted = true;

    const fontPromise = typeof document !== "undefined" && document.fonts
      ? document.fonts.ready
      : Promise.resolve();

    fontPromise.finally(() => {
      if (isMounted) setFontsReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    PRELOAD_FETCH_URLS.forEach((url) => {
      fetch(url, { cache: "force-cache" })
        .catch(() => undefined)
        .finally(() => {
          if (isMounted) handleWarmAssetReady(url);
        });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (loadedAssets < assetCount) return undefined;

    let frameId = 0;
    let frameCount = 0;

    function waitForPaint() {
      frameCount += 1;

      if (frameCount >= WARMUP_SETTLE_FRAMES) {
        setPaintSettled(true);
        return;
      }

      frameId = window.requestAnimationFrame(waitForPaint);
    }

    frameId = window.requestAnimationFrame(waitForPaint);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [assetCount, loadedAssets]);

  useEffect(() => {
    function handleIntroMessage(event) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "bonpuri-intro-complete") return;
      if (!assetsReady) return;

      setLanguage(event.data.language === "ko" ? "ko" : "en");
      setIntroIsExiting(true);
      setHasStarted(true);
      window.clearTimeout(introExitTimeoutRef.current);
      introExitTimeoutRef.current = window.setTimeout(() => {
        setIntroIsExiting(false);
      }, 520);
    }

    window.addEventListener("message", handleIntroMessage);

    return () => {
      window.removeEventListener("message", handleIntroMessage);
      window.clearTimeout(introExitTimeoutRef.current);
    };
  }, [assetsReady]);

  useEffect(() => {
    if (!assetsReady) return;

    introFrameRef.current?.contentWindow?.postMessage({
      type: "bonpuri-assets-ready"
    }, window.location.origin);
  }, [assetsReady]);

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

      setInitialDebugDeityId("");
      setResult(generateResult(nextAnswers, prototypeData));
    }, 120);
  }

  function handleRestart() {
    setQuestions(shuffleQuestionnaire(questionsData.questions));
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setResult(null);
    setInitialDebugDeityId("");
    setHasStarted(false);
    setIntroIsExiting(false);
    window.clearTimeout(introExitTimeoutRef.current);
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

    setInitialDebugDeityId("donghae_yonggungs_daughter");
    setResult(generateResult(debugAnswers, prototypeData));
    setHasStarted(true);
  }

  function handleWarmAssetReady(src) {
    setLoadedAssetUrls((currentUrls) => {
      if (currentUrls.has(src)) return currentUrls;

      const nextUrls = new Set(currentUrls);
      nextUrls.add(src);
      return nextUrls;
    });
  }

  const introPage = (
    <main
      className={`intro-mockup-page intro-entry-page${introIsExiting ? " is-exiting" : ""}${!assetsReady ? " is-loading" : ""}`}
      key="intro"
    >
      <AssetWarmup onAssetReady={handleWarmAssetReady} urls={PRELOAD_IMAGE_URLS} />
      <iframe
        className="intro-mockup-frame"
        ref={introFrameRef}
        src={`${introPrototypeUrl}?paper=${encodeURIComponent(heroBlackPaperImage)}&model=${encodeURIComponent(introModelUrl)}&cloud=${encodeURIComponent(heroCloudImage)}&cloud2=${encodeURIComponent(heroCloudTwoImage)}&cloud4=${encodeURIComponent(introCloudFourImage)}&logo=${encodeURIComponent(introLogoImage)}&koreanType=${encodeURIComponent(introKoreanDoorwayImage)}`}
        title="Bonpuri intro"
        onLoad={() => {
          if (!assetsReady) return;

          introFrameRef.current?.contentWindow?.postMessage({
            type: "bonpuri-assets-ready"
          }, window.location.origin);
        }}
      />
      {!assetsReady ? (
        <div className="intro-loading-overlay" aria-live="polite">
          <p>{language === "ko" ? "로딩 중" : "Loading"}</p>
          <div
            aria-label={language === "ko" ? "로딩 진행률" : "Loading progress"}
            aria-valuemax="100"
            aria-valuemin="0"
            aria-valuenow={loadingProgress}
            className="intro-loading-progress"
            role="progressbar"
          >
            <span style={{ width: `${loadingProgress}%` }} />
          </div>
        </div>
      ) : null}
    </main>
  );

  const questionnairePage = (
    <main
      className={`questionnaire-page${introIsExiting ? " is-entering" : ""}`}
      key="questionnaire"
      style={{ "--questionnaire-paper-image": `url(${heroMainPaperImage})` }}
    >
      <div className="questionnaire-top-left-controls">
        <HomeButton language={language} onClick={handleRestart} />
        <button
          className="questionnaire-debug-result-button"
          disabled={!assetsReady}
          type="button"
          onClick={handleDebugResult}
        >
          Result
        </button>
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

  if (result) {
    return (
      <ResultView
        language={language}
        onLanguageChange={setLanguage}
        initialDeityId={initialDebugDeityId}
        result={result}
        onRestart={handleRestart}
      />
    );
  }

  if (!hasStarted) {
    return (
      <>
        {introPage}
      </>
    );
  }

  if (false && !hasStarted) {
    return (
      <main className={`intro-mockup-page intro-entry-page${introIsExiting ? " is-exiting" : ""}${!assetsReady ? " is-loading" : ""}`}>
        <AssetWarmup onAssetReady={handleWarmAssetReady} urls={PRELOAD_IMAGE_URLS} />
        <iframe
          className="intro-mockup-frame"
          src={`${introPrototypeUrl}?paper=${encodeURIComponent(heroBlackPaperImage)}&model=${encodeURIComponent(introModelUrl)}&cloud=${encodeURIComponent(heroCloudImage)}&cloud2=${encodeURIComponent(heroCloudTwoImage)}&cloud4=${encodeURIComponent(introCloudFourImage)}&logo=${encodeURIComponent(introLogoImage)}&koreanType=${encodeURIComponent(introKoreanDoorwayImage)}`}
          title="Bonpuri intro"
        />
        {!assetsReady ? (
          <div className="intro-loading-overlay" aria-live="polite">
            <p>{language === "ko" ? "로딩 중" : "Loading"}</p>
            <div
              aria-label={language === "ko" ? "로딩 진행률" : "Loading progress"}
              aria-valuemax="100"
              aria-valuemin="0"
              aria-valuenow={loadingProgress}
              className="intro-loading-progress"
              role="progressbar"
            >
              <span style={{ width: `${loadingProgress}%` }} />
            </div>
          </div>
        ) : null}
      </main>
    );
  }

  if (false && !hasStarted) {
    return (
      <main className="landing-page">
        <AssetWarmup onAssetReady={handleWarmAssetReady} urls={PRELOAD_IMAGE_URLS} />
        <section className="landing-panel" aria-labelledby="landing-title">
          <h1 id="landing-title">
            <span>Bonpuri</span>
            <span>Type Test</span>
          </h1>
          <p>{language === "ko" ? "ì–¸ì–´ë¥¼ ì„ íƒí•˜ê³  ì‹œìž‘í•˜ì„¸ìš”" : "Select language to start"}</p>
          {!assetsReady ? (
            <div className="landing-loading" aria-live="polite">
              <p className="landing-loading-status">
              {language === "ko" ? "ì´ë¯¸ì§€ë¥¼ ì¤€ë¹„í•˜ëŠ” ì¤‘ìž…ë‹ˆë‹¤" : "Preparing images"}
              </p>
              <div
                aria-label={language === "ko" ? "로딩 진행률" : "Loading progress"}
                aria-valuemax="100"
                aria-valuemin="0"
                aria-valuenow={loadingProgress}
                className="landing-loading-progress"
                role="progressbar"
              >
                <span style={{ width: `${loadingProgress}%` }} />
              </div>
            </div>
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
              í•œêµ­ì–´
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
          <button
            className="debug-result-button"
            disabled={!assetsReady}
            type="button"
            onClick={handleDebugIntro}
          >
            Debug intro page
          </button>
        </section>
      </main>
    );
  }

  if (introIsExiting) {
    return (
      <>
        {questionnairePage}
        {introPage}
      </>
    );
  }

  return questionnairePage;

  return (
    <main
      className="questionnaire-page"
      style={{ "--questionnaire-paper-image": `url(${heroMainPaperImage})` }}
    >
      <div className="questionnaire-top-left-controls">
        <HomeButton language={language} onClick={handleRestart} />
        <button
          className="questionnaire-debug-result-button"
          disabled={!assetsReady}
          type="button"
          onClick={handleDebugResult}
        >
          Result
        </button>
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

function HomeButton({ language, onClick }) {
  return (
    <button
      aria-label={language === "ko" ? "홈으로" : "Home"}
      className="home-button"
      type="button"
      onClick={onClick}
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d="M3.1 10.9 12 3.4l8.9 7.5-1.55 1.85-1.05-.88V20.6h-5.05v-5.85h-2.5v5.85H5.7v-8.73l-1.05.88-1.55-1.85Z" />
      </svg>
    </button>
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

function AssetWarmup({ onAssetReady, urls }) {
  return (
    <div aria-hidden="true" className="asset-warmup">
      {urls.map((src) => (
        <img
          alt=""
          className={DEITY_WARMUP_URLS.includes(src) ? "asset-warmup-image asset-warmup-image-deity" : "asset-warmup-image"}
          key={src}
          loading="eager"
          src={src}
          onError={() => onAssetReady(src)}
          onLoad={(event) => {
            const image = event.currentTarget;

            if (image.decode) {
              image.decode().catch(() => undefined).finally(() => onAssetReady(src));
              return;
            }

            onAssetReady(src);
          }}
        />
      ))}
    </div>
  );
}

