import { useEffect, useMemo, useRef, useState } from "react";
import deityMap from "../../data/deity_axis_map.json";
import deityNamesTable from "../../deity_names.txt?raw";
import deityResultDescriptionsEnText from "../../results_texts/deity_result_description_en.txt?raw";
import deityResultDescriptionsKoText from "../../results_texts/deity_result_description_ko.txt?raw";
import {
  composeDeityResultBlock,
  composeResultTextBlocks
} from "../resultComposer/resultTextComposer.js";
import selfLensImage from "../../image/self_lens.svg";
import socialLensImage from "../../image/social_lens.svg";
import careOrientationImage from "../../image/care_orientation.svg";
import orderOrientationImage from "../../image/order_orientation.svg";
import heroBlackPaperImage from "../../image/background/blackpaper.png";
import heroArchImage from "../../image/background/cutout.png";
import heroCloudImage from "../../image/background/cloud.png";
import heroCloudTwoImage from "../../image/background/cloud2.png";
import chogongThreeBrothersImage from "../../image/Deity/CHOGONGSHIN.svg";
import daebyeolsangManuraImage from "../../image/Deity/DAEBYUL.svg";
import donghaeYonggungDaughterImage from "../../image/Deity/DONGHAE.svg";
import gangnimImage from "../../image/Deity/GANGNIM.svg";
import jijangAgissiImage from "../../image/Deity/JIJANG.svg";
import myeongjingukDaughterImage from "../../image/Deity/MYUNG.svg";
import nokdisaengiImage from "../../image/Deity/NOKDI.svg";
import sobyeolwangImage from "../../image/Deity/SOBYUL.svg";
import yeosanBuinImage from "../../image/Deity/YEOSAN.svg";
import LanguageToggle from "./LanguageToggle.jsx";

const PROFILE_AXES = [
  {
    key: "self",
    label: "Self",
    label_ko: "ᄆᆞᆷ속",
    description: "Where you locate yourself inside a situation."
  },
  {
    key: "social",
    label: "Social",
    label_ko: "궨당",
    description: "How you read relationships, distance, and who is affected."
  },
  {
    key: "care",
    label: "Care",
    label_ko: "거념",
    description: "What you notice as needing support, tending, or protection."
  },
  {
    key: "order",
    label: "Order",
    label_ko: "가리",
    description: "What you notice as needing shape, placement, or structure."
  },
  {
    key: "response_intensity",
    label: "Response Intensity",
    description: "How strongly something lands, returns, presses, or stays active."
  },
  {
    key: "agency",
    label: "Action Pull",
    description: "How strongly perception moves toward acting, naming, shaping, changing, or making something concrete."
  }
];
const PROFILE_CHART_AXES = [
  PROFILE_AXES.find((axis) => axis.key === "agency"),
  PROFILE_AXES.find((axis) => axis.key === "social"),
  PROFILE_AXES.find((axis) => axis.key === "care"),
  PROFILE_AXES.find((axis) => axis.key === "response_intensity"),
  PROFILE_AXES.find((axis) => axis.key === "order"),
  PROFILE_AXES.find((axis) => axis.key === "self")
];
const SCORE_GROUPS = [
  {
    id: "lens",
    label: { en: "Lens", ko: "기준" },
    axisKeys: ["self", "social"]
  },
  {
    id: "orientation",
    label: { en: "Orientation", ko: "감각" },
    axisKeys: ["care", "order"]
  },
  {
    id: "modifier",
    label: { en: "Modifier", ko: "Modifier" },
    axisKeys: ["response_intensity", "agency"]
  }
];
const SCORE_VISUAL_IMAGES = {
  care: careOrientationImage,
  order: orderOrientationImage,
  self: selfLensImage,
  social: socialLensImage
};
const RESULT_DEITY_IMAGES = {
  chogong_three_brothers: chogongThreeBrothersImage,
  daebyeolwang: daebyeolsangManuraImage,
  donghae_yonggungs_daughter: donghaeYonggungDaughterImage,
  gangnim: gangnimImage,
  jijang_agissi: jijangAgissiImage,
  myeongjinguks_daughter: myeongjingukDaughterImage,
  nokdisaengi: nokdisaengiImage,
  sobyeolwang: sobyeolwangImage,
  yeosan_buin: yeosanBuinImage
};

function useFitSingleLineText(dependencies = []) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return undefined;
    }

    let frameId = 0;

    const fitText = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const container = element.closest(".result-hero-copy") || element.parentElement;
        if (!container) {
          return;
        }

        element.style.fontSize = "";

        const availableWidth = container.getBoundingClientRect().width;
        if (!availableWidth) {
          return;
        }

        const computedStyle = window.getComputedStyle(element);
        const maximumFontSize = parseFloat(computedStyle.fontSize);
        const minimumFontSize = parseFloat(computedStyle.getPropertyValue("--fit-title-min")) || 14;
        let fittedFontSize = maximumFontSize;

        element.style.fontSize = `${fittedFontSize}px`;

        for (let index = 0; index < 8 && element.scrollWidth > availableWidth && fittedFontSize > minimumFontSize; index += 1) {
          fittedFontSize = Math.max(
            minimumFontSize,
            fittedFontSize * (availableWidth / element.scrollWidth) * 0.98
          );
          element.style.fontSize = `${fittedFontSize}px`;
        }
      });
    };

    const resizeObserver = new ResizeObserver(fitText);
    const container = element.closest(".result-hero-copy") || element.parentElement;

    resizeObserver.observe(element);
    if (container) {
      resizeObserver.observe(container);
    }
    window.addEventListener("resize", fitText);
    fitText();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", fitText);
    };
  }, dependencies);

  return elementRef;
}
const DEITY_ROLES = parseDeityRoleTable(deityNamesTable);
const DEITY_RESULT_DESCRIPTIONS_EN = parseDeityResultDescriptions(deityResultDescriptionsEnText);
const DEITY_RESULT_DESCRIPTIONS_KO = parseDeityResultDescriptions(deityResultDescriptionsKoText);
const RESULT_COPY = {
  en: {
    resultTitle: "Your Result",
    recognitionPattern: "Recognition pattern",
    compactScores: "Result Scores",
    resultText: "Result Reading",
    nearbyAnchors: "Nearby Deity Anchors",
    nearbyDescription: "The closest neighbouring anchors in the same result space.",
    roleFallback: "Result anchor in the Bonpuri field",
    takeAgain: "Take the test again"
  },
  ko: {
    resultTitle: "결과",
    recognitionPattern: "결과 패턴",
    compactScores: "결과 점수",
    resultText: "결과 해석",
    nearbyAnchors: "가까운 신격 결과",
    nearbyDescription: "현재 결과와 가까운 신격 연결입니다.",
    roleFallback: "본풀이 결과 신격",
    takeAgain: "다시 하기"
  }
};

function topMatches(result) {
  const deityById = new Map(deityMap.deities.map((deity) => [deity.deity_id, deity]));

  const narrativeAnchors = result.nearby_narrative_anchors || result.top_deity_matches;

  if (narrativeAnchors) {
    return narrativeAnchors.map((match, index) => {
      const deityId = match.id || match.deity_id;
      const deity = deityById.get(deityId);

      return {
        ...match,
        deity_id: deityId,
        rank: index + 1,
        name_ko: match.korean_name || match.name_ko || deity?.name_ko || deityId,
        name_en: match.display_name || match.name_en || deity?.name_en || "",
        bonpuri: match.bonpuri || deity?.bonpuri || "",
        match_percentage: match.match_percent ?? match.match_percentage,
        anchor_line: match.anchor_line || "",
        longer_anchor_description: match.longer_anchor_description || "",
        field_connection_line: match.field_connection_line || "",
        match_reasons: match.match_reasons || [],
        deity_subcategories: match.deity_subcategories || {},
        primary_axes: deity?.primary_axes || [],
        secondary_axes: deity?.secondary_axes || [],
        tone: deity?.tone || ""
      };
    });
  }

  if (result.top_matches) {
    return result.top_matches.map((match, index) => {
      const deity = deityById.get(match.deity_id);

      return {
        ...match,
        rank: index + 1,
        name_ko: match.name_ko || deity?.name_ko || match.deity_id,
        name_en: match.name_en || deity?.name_en || "",
        bonpuri: match.bonpuri || deity?.bonpuri || "",
        match_reasons: match.match_reasons || [],
        deity_subcategories: match.deity_subcategories || {},
        primary_axes: deity?.primary_axes || [],
        secondary_axes: deity?.secondary_axes || [],
        tone: deity?.tone || ""
      };
    });
  }

  return [];
}

function allDeityMatches() {
  return deityMap.deities.map((deity, index) => ({
    deity_id: deity.deity_id,
    rank: index + 1,
    name_ko: deity.name_ko || deity.deity_id,
    name_en: deity.name_en || deity.deity_id,
    bonpuri: deity.bonpuri || "",
    match_percentage: 100,
    anchor_line: deity.result_summary || "",
    longer_anchor_description: "",
    field_connection_line: "",
    match_reasons: [],
    deity_subcategories: {},
    primary_axes: deity.primary_axes || [],
    secondary_axes: deity.secondary_axes || [],
    tone: deity.tone || ""
  }));
}

function getDeityMatchById(deityId, matches) {
  return matches.find((match) => match.deity_id === deityId)
    || allDeityMatches().find((match) => match.deity_id === deityId)
    || matches[0];
}

function getCombinationFromAxisVector(axisVector = {}) {
  const lens = Number(axisVector.self || 0) >= Number(axisVector.social || 0)
    ? "Self"
    : "Social";
  const orientation = Number(axisVector.care || 0) >= Number(axisVector.order || 0)
    ? "Care"
    : "Order";

  return `${lens} + ${orientation}`;
}

function parseDeityRoleTable(table) {
  return new Map(table
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/)
    .map(parseDeityRoleLine)
    .filter(([resultName, seatedName]) => resultName && seatedName)
    .filter(([resultName]) => (
      resultName !== "결과명"
      && resultName !== "Result"
      && !/^[-:]+$/.test(resultName)
    ))
    .map((cells) => {
      const [resultName, seatedName] = cells;

      if (cells.length >= 5) {
        const [, , translatedName, description, bonpuri] = cells;
        return [resultName, { seatedName, translatedName, description, bonpuri }];
      }

      if (cells.length === 4) {
        const [, , translatedName, bonpuri] = cells;
        return [resultName, { seatedName, translatedName, bonpuri }];
      }

      const [, , description] = cells;
      return [resultName, { seatedName, description }];
    }));
}

function parseDeityRoleLine(line) {
  const trimmedLine = line.trim();

  if (trimmedLine.startsWith("|")) {
    return trimmedLine
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);
  }

  return trimmedLine.split(/\t+/).filter(Boolean);
}

function parseDeityResultDescriptions(text) {
  return new Map(text
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((section) => section
      .trim()
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean))
    .filter((lines) => lines.length >= 2)
    .map(([title, ...paragraphLines]) => [
      title.split(",")[0].trim(),
      {
        title,
        paragraphs: [paragraphLines.join(" ")]
      }
    ]));
}

function getDeityResultDescription(match, deityResultBlock, language) {
  const descriptions = language === "ko" ? DEITY_RESULT_DESCRIPTIONS_KO : DEITY_RESULT_DESCRIPTIONS_EN;
  const candidates = [
    language === "ko" ? match?.name_ko : match?.name_en,
    match?.name_ko,
    match?.name_en,
    deityResultBlock?.source_label,
    deityResultBlock?.title
  ].filter(Boolean);

  return candidates
    .map((candidate) => descriptions.get(candidate))
    .find(Boolean) || null;
}

function displayDeityName(match, language) {
  if (!match) return "";
  if (language === "ko") return match.name_ko || match.name_en || match.deity_id;
  return match.name_en || match.name_ko || match.deity_id;
}

function getDeityRole(match, language, fallback) {
  if (!match) return { description: fallback };

  const deityRole = DEITY_ROLES.get(language === "ko" ? match.name_ko : match.name_en);
  if (deityRole) {
    return deityRole;
  }

  const roleText = removeTrailingPeriod(match.anchor_line) || formatTone(match.tone);
  return {
    description: roleText ? `Deity of ${lowercaseFirst(roleText)}` : fallback
  };
}

function getBonpuriSource(match, language) {
  if (!match) return "";

  if (language === "en") {
    const deityRole = DEITY_ROLES.get(match.name_en);
    if (deityRole?.bonpuri) return deityRole.bonpuri;
  }

  return match.bonpuri || "";
}

function removeTrailingPeriod(text = "") {
  return text.trim().replace(/\.$/, "");
}

function lowercaseFirst(text = "") {
  return text ? `${text[0].toLowerCase()}${text.slice(1)}` : "";
}

function uppercaseFirst(text = "") {
  return text ? `${text[0].toUpperCase()}${text.slice(1)}` : "";
}

function formatTone(tone = "") {
  return tone
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

function formatBonpuriSource(bonpuri) {
  return bonpuri;
}

function sourceLine(bonpuri) {
  return formatBonpuriSource(bonpuri);
}

function formatMatchSentence(match, language) {
  const deityName = displayDeityName(match, language);
  const percentage = match?.match_percentage;

  if (language === "ko") {
    return `${deityName}와 ${percentage}% 일치합니다`;
  }

  return `${deityName} is a ${percentage}% match.`;
}

function formatRecognitionPattern(pattern, language) {
  if (language !== "ko") return pattern;

  const koreanAxisLabels = {
    Self: "ᄆᆞᆷ속",
    Social: "궨당",
    Care: "거념",
    Order: "가리"
  };

  return pattern
    .split(" + ")
    .map((axisLabel) => koreanAxisLabels[axisLabel] || axisLabel)
    .join(" + ");
}

export default function ResultView({
  language = "en",
  onLanguageChange,
  onRestart,
  result
}) {
  const matches = useMemo(() => topMatches(result), [result]);
  const deityOptions = useMemo(() => allDeityMatches(), []);
  const resultLanguage = language;
  const copy = RESULT_COPY[resultLanguage];
  const defaultSelectedMatch = matches.find((match) => (
    match.deity_id === result.primary_anchor?.deity_id
  )) || matches[0] || deityOptions[0];
  const [debugDeityId, setDebugDeityId] = useState(defaultSelectedMatch?.deity_id || "");
  const selectedMatch = getDeityMatchById(debugDeityId, matches);
  const selectedDeityScores = getDeityProfileScores(selectedMatch?.deity_id);
  const resultDeityImage = RESULT_DEITY_IMAGES[selectedMatch?.deity_id] || null;
  const recognitionPattern = selectedDeityScores
    ? getCombinationFromAxisVector(selectedDeityScores)
    : result.recognition_pattern?.label || result.primary_combination;
  const deityResultBlock = composeDeityResultBlock({
    deityId: selectedMatch?.deity_id,
    language: resultLanguage
  });
  const combinationResultBlocks = composeResultTextBlocks({
    primaryCombination: recognitionPattern,
    language: resultLanguage
  });
  const userProfileScores = {
    ...result.axis_profile,
    response_intensity: result.response_intensity,
    agency: result.action_pull ?? result.agency
  };
  const deityResultDescription = getDeityResultDescription(
    selectedMatch,
    deityResultBlock,
    resultLanguage
  );
  const nearbyMatches = deityOptions
    .filter((match) => match.deity_id !== selectedMatch?.deity_id)
    .slice(0, 3)
    .map((match, index) => ({
      ...match,
      displayRank: index + 2
    }));
  const selectedDeityName = displayDeityName(selectedMatch, resultLanguage);
  const titleRef = useFitSingleLineText([selectedDeityName, resultLanguage, Boolean(resultDeityImage)]);
  const titleLengthClass = selectedDeityName.length > 16
    ? " result-title-extra-long"
    : selectedDeityName.length > 9
      ? " result-title-long"
      : "";

  return (
    <main
      className="result-page"
      style={{ "--hero-paper-image": `url(${heroBlackPaperImage})` }}
    >
      <div className="page-top-bar">
        <button
          aria-label={resultLanguage === "ko" ? "홈으로" : "Home"}
          className="home-button"
          type="button"
          onClick={onRestart}
        >
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
            <path d="M3.1 10.9 12 3.4l8.9 7.5-1.55 1.85-1.05-.88V20.6h-5.05v-5.85h-2.5v5.85H5.7v-8.73l-1.05.88-1.55-1.85Z" />
          </svg>
        </button>
        <LanguageToggle
          language={resultLanguage}
          onLanguageChange={onLanguageChange}
          label="Result language"
        />
        <label className="debug-deity-select">
          <span>Debug deity</span>
          <select
            value={selectedMatch?.deity_id || ""}
            onChange={(event) => setDebugDeityId(event.target.value)}
          >
            {deityOptions.map((match) => (
              <option key={match.deity_id} value={match.deity_id}>
                {displayDeityName(match, resultLanguage)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section aria-labelledby="result-title">
        <section
          className={`result-hero ${resultDeityImage ? "result-hero-illustrated" : ""}`}
          aria-labelledby="result-title"
          style={
            resultDeityImage
              ? {
                  "--hero-arch-image": `url(${heroArchImage})`,
                  "--hero-paper-image": `url(${heroBlackPaperImage})`,
                  "--hero-cloud-image": `url(${heroCloudImage})`,
                  "--hero-cloud-two-image": `url(${heroCloudTwoImage})`,
                  "--hero-deity-image": `url(${resultDeityImage})`
                }
              : undefined
          }
        >
          {resultDeityImage ? (
            <div className="result-hero-scene">
              <div className="result-hero-copy">
                <div className="result-title-row">
                  <h1
                    ref={titleRef}
                    className={`${resultLanguage === "ko" ? "result-title-ko" : ""}${titleLengthClass}`.trim()}
                    id="result-title"
                  >
                    {selectedDeityName}
                  </h1>
                </div>
                <DeityRole
                  className="result-deity-role"
                  fallback={copy.roleFallback}
                  language={resultLanguage}
                  match={selectedMatch}
                />
              </div>
              <span className="result-hero-arch" aria-hidden="true" />
              <div className="result-hero-art" aria-hidden="true">
                <span className="result-hero-cloud" />
                <span className="result-hero-cloud-two" />
                <span className={`result-hero-deity-glow result-hero-deity-glow-${selectedMatch?.deity_id || "default"}`} />
                <span className={`result-hero-deity-shadow-clip result-hero-deity-shadow-clip-${selectedMatch?.deity_id || "default"}`}>
                  <img
                    alt=""
                    className={`result-hero-deity-shadow-image result-hero-deity-shadow-image-${selectedMatch?.deity_id || "default"}`}
                    src={resultDeityImage}
                  />
                </span>
                <img
                  alt=""
                  className={`result-hero-deity-image result-hero-deity-image-${selectedMatch?.deity_id || "default"}`}
                  src={resultDeityImage}
                />
                <span className={`result-hero-deity-foot-shadow result-hero-deity-foot-shadow-${selectedMatch?.deity_id || "default"}`} />
              </div>
            </div>
          ) : (
            <>
              <div className="result-title-row">
                <h1
                  ref={titleRef}
                  className={`${resultLanguage === "ko" ? "result-title-ko" : ""}${titleLengthClass}`.trim()}
                  id="result-title"
                >
                  {selectedDeityName}
                </h1>
              </div>
              <DeityRole
                className="result-deity-role"
                fallback={copy.roleFallback}
                language={resultLanguage}
                match={selectedMatch}
              />
            </>
          )}
          {resultDeityImage ? null : (
            <ProfileShapeChart
              legend={{
                deity: displayDeityName(selectedMatch, resultLanguage),
                user: resultLanguage === "ko" ? "내 결과" : "Your result"
              }}
              overlayScores={selectedDeityScores}
              scores={userProfileScores}
              size={460}
              language={resultLanguage}
              showLabels
            />
          )}
        </section>

        <div className="result-body-region">
          <div className="result-body-canvas">
            <section className="result-section result-reading-section" aria-label={copy.resultText}>
              <CombinationOpening blocks={combinationResultBlocks} />
              {deityResultDescription ? (
                <DeityDescriptionIntroBlock
                  block={deityResultDescription}
                  source={getBonpuriSource(selectedMatch, resultLanguage)}
                />
              ) : null}
              {deityResultBlock ? (
                <DeityTextBlock block={deityResultBlock} />
              ) : null}
              {combinationResultBlocks.map((block) => (
                <CombinationTextBlock
                  block={block}
                  key={block.subtitle.text}
                  language={resultLanguage}
                  scores={userProfileScores}
                />
              ))}
            </section>

            <section className="result-section nearby-anchors-section" aria-labelledby="nearby-anchors-title">
              <h2 id="nearby-anchors-title">{copy.nearbyAnchors}</h2>
              <p>{copy.nearbyDescription}</p>
              <ol className="nearby-anchor-list">
                {nearbyMatches.map((match) => (
                  <NearbyAnchorItem
                    copy={copy}
                    key={match.deity_id}
                    language={resultLanguage}
                    match={match}
                  />
                ))}
              </ol>
            </section>

            <div className="result-footer">
              <button className="restart-button" type="button" onClick={onRestart}>
                {copy.takeAgain}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileShapeChart({
  legend = null,
  language = "en",
  overlayScores = null,
  scores,
  size = 280,
  showLabels = true,
  title = ""
}) {
  const center = size / 2;
  const radius = size * 0.37;
  const labelRadius = radius + 25;
  const gridLevels = [25, 50, 75, 100];
  const rawScores = getRawProfileScores(scores);
  const rawOverlayScores = overlayScores ? getRawProfileScores(overlayScores) : null;
  const points = PROFILE_CHART_AXES.map((axis, index) => {
    const angle = ((Math.PI * 2) / PROFILE_CHART_AXES.length) * index - (Math.PI / 2);
    const value = Math.max(0, Math.min(100, Number(rawScores?.[axis.key] || 0)));
    const pointRadius = (value / 100) * radius;

    return {
      ...axis,
      value,
      x: center + (Math.cos(angle) * pointRadius),
      y: center + (Math.sin(angle) * pointRadius),
      axisX: center + (Math.cos(angle) * radius),
      axisY: center + (Math.sin(angle) * radius),
      labelX: center + (Math.cos(angle) * labelRadius),
      labelY: center + (Math.sin(angle) * labelRadius)
    };
  });
  const overlayPoints = rawOverlayScores ? PROFILE_CHART_AXES.map((axis, index) => {
    const angle = ((Math.PI * 2) / PROFILE_CHART_AXES.length) * index - (Math.PI / 2);
    const value = Math.max(0, Math.min(100, Number(rawOverlayScores?.[axis.key] || 0)));
    const pointRadius = (value / 100) * radius;

    return {
      ...axis,
      x: center + (Math.cos(angle) * pointRadius),
      y: center + (Math.sin(angle) * pointRadius)
    };
  }) : [];
  const polygonPoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const overlayPolygonPoints = overlayPoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <figure className="profile-shape">
      {title ? (
        <div className="profile-shape-actions">
          <figcaption>{title}</figcaption>
        </div>
      ) : null}
      <div className="profile-shape-layout">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Profile Shape across Self, Social, Care, Order, Response Intensity, and Action Pull"
        data-overlay-scores={rawOverlayScores ? JSON.stringify(rawOverlayScores) : undefined}
        data-raw-scores={JSON.stringify(rawScores)}
      >
        {gridLevels.map((level) => {
          const levelRadius = (level / 100) * radius;
          const gridPoints = PROFILE_CHART_AXES.map((_, index) => {
            const angle = ((Math.PI * 2) / PROFILE_CHART_AXES.length) * index - (Math.PI / 2);
            return `${center + (Math.cos(angle) * levelRadius)},${center + (Math.sin(angle) * levelRadius)}`;
          }).join(" ");

          return <polygon className="profile-shape-grid" points={gridPoints} key={level} />;
        })}
        {points.map((point) => (
          <line
            className="profile-shape-axis"
            key={point.key}
            x1={center}
            y1={center}
            x2={point.axisX}
            y2={point.axisY}
          />
        ))}
        {overlayPolygonPoints ? (
          <polygon className="profile-shape-deity-polygon" points={overlayPolygonPoints} />
        ) : null}
        <polygon className="profile-shape-polygon" points={polygonPoints} />
        {overlayPoints.map((point) => (
          <circle
            className="profile-shape-deity-point"
            cx={point.x}
            cy={point.y}
            r="3"
            key={`${point.key}-deity`}
          />
        ))}
        {points.map((point) => (
          <circle className="profile-shape-point" cx={point.x} cy={point.y} r="3" key={point.key} />
        ))}
        {points.map((point) => (
          <text
            className="profile-shape-value"
            key={`${point.key}-value`}
            x={point.x}
            y={point.y - 6}
            textAnchor="middle"
          >
            {point.value}
          </text>
        ))}
        {showLabels ? points.map((point) => (
          <text
            className="profile-shape-label"
            key={`${point.key}-label`}
            x={point.labelX}
            y={point.labelY}
            textAnchor="middle"
          >
              {getAxisLabel(point, language)}
          </text>
        )) : null}
      </svg>
      {legend ? <ProfileShapeLegend legend={legend} /> : null}
      </div>
    </figure>
  );
}

function ProfileShapeLegend({ legend }) {
  return (
    <div className="profile-shape-legend" aria-label="Profile shape legend">
      <p>
        <span className="profile-shape-swatch profile-shape-swatch-user" aria-hidden="true" />
        {legend.user}
      </p>
      <p>
        <span className="profile-shape-swatch profile-shape-swatch-deity" aria-hidden="true" />
        {legend.deity}
      </p>
    </div>
  );
}

function CompactScoreSummary({ language, scores, showModifier = true }) {
  const rawScores = getRawProfileScores(scores);
  const visibleGroups = showModifier
    ? SCORE_GROUPS
    : SCORE_GROUPS.filter((group) => group.id !== "modifier");
  const isHeroSummary = !showModifier;

  return (
    <div className={`compact-score-summary${isHeroSummary ? " compact-score-summary-hero" : ""}`}>
      {visibleGroups.map((group) => (
        <section className={`compact-score-group compact-score-group-${group.id}`} key={group.id}>
          <h3>{group.label[language]}</h3>
          {group.id === "lens" || group.id === "orientation" ? (
            <>
              <div className="visual-score-axes">
                {group.axisKeys.map((axisKey) => {
                  const axis = PROFILE_AXES.find((candidate) => candidate.key === axisKey);

                  return (
                    <div className={`visual-score-axis visual-score-axis-${axis.key}`} key={axis.key}>
                      <span className="visual-score-label">{getAxisLabel(axis, language)}</span>
                      <img alt="" className="visual-score-image" src={SCORE_VISUAL_IMAGES[axis.key]} />
                      <div className="visual-score-meter">
                        <strong>{rawScores[axis.key]}%</strong>
                        <span className="score-track" aria-hidden="true">
                          <span style={{ width: `${Math.max(0, Math.min(100, rawScores[axis.key]))}%` }} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {isHeroSummary ? <DominantAxisNote group={group} language={language} scores={rawScores} /> : null}
            </>
          ) : (
            <dl>
              {group.axisKeys.map((axisKey) => {
                const axis = PROFILE_AXES.find((candidate) => candidate.key === axisKey);

                return (
                  <div className="compact-score-axis" key={axis.key}>
                    <dt>
                      <span>{getAxisLabel(axis, language)}</span>
                      <strong>{rawScores[axis.key]}%</strong>
                    </dt>
                    <dd>
                      <span className="score-track" aria-hidden="true">
                        <span style={{ width: `${Math.max(0, Math.min(100, rawScores[axis.key]))}%` }} />
                      </span>
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </section>
      ))}
    </div>
  );
}

function DominantAxisNote({ group, language, scores }) {
  const dominantAxisKey = group.axisKeys.reduce((winner, axisKey) => (
    scores[axisKey] > scores[winner] ? axisKey : winner
  ), group.axisKeys[0]);
  const dominantAxis = PROFILE_AXES.find((axis) => axis.key === dominantAxisKey);

  return (
    <p className="dominant-axis-note">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae
      arcu sed lorem placerat tempor. {getAxisLabel(dominantAxis, language)}
      {" "}shows the strongest signal in this group.
    </p>
  );
}

function getRawProfileScores(scores) {
  return Object.fromEntries(PROFILE_AXES.map((axis) => [
    axis.key,
    roundDisplayScore(scores?.[axis.key])
  ]));
}

function getAxisLabel(axis, language) {
  return language === "ko" ? axis.label_ko || axis.label : axis.label;
}

function roundDisplayScore(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function getDeityProfileScores(deityId) {
  return deityMap.deities.find((deity) => deity.deity_id === deityId)?.axis_vector || null;
}

function DeityTextBlock({ block }) {
  return (
    <div className="writing-block deity-result-block">
      {block.subtitle ? <h3>{block.subtitle}</h3> : null}
      {block.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function DeityDescriptionIntroBlock({ block, source }) {
  const [titleName, ...titleDescriptionParts] = block.title.split(",");
  const titleDescription = uppercaseFirst(titleDescriptionParts.join(",").trim());

  return (
    <div className="writing-block deity-description-intro">
      {source ? <p className="result-source">{sourceLine(source)}</p> : null}
      {titleDescription ? <h2>{titleDescription}</h2> : <h2>{titleName.trim()}</h2>}
      {block.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function DeityRole({ className, fallback, language, match }) {
  const role = getDeityRole(match, language, fallback);

  return (
    <p className={className}>
      {role.description ? (
        <span className="deity-role-description">{role.description}</span>
      ) : null}
      {role.seatedName ? <span className="deity-role-name">{role.seatedName}</span> : null}
    </p>
  );
}

function CombinationOpening({ blocks }) {
  const openingText = blocks.find((block) => block.opening?.text)?.opening?.text;

  if (!openingText) return null;

  return (
    <div className="writing-block combination-opening-block">
      {openingText.split(/\n{2,}/).map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function CombinationTextBlock({ block, language, scores }) {
  return (
    <div className="writing-block combination-result-block">
      <CompactScoreSummary
        language={language}
        scores={scores}
        showModifier={false}
      />
      {block.title.text ? <h2>{block.title.text}</h2> : null}
      {block.patternSections?.length ? null : <PatternPills text={block.subtitle.text} />}
      {block.openingBridge?.text ? <p>{block.openingBridge.text}</p> : null}
      {block.patternSections?.length ? (
        block.patternSections.map((section) => (
          <div className="combination-axis-injection" key={section.heading || section.paragraphs?.join(" ")}>
            {section.pill ? <PatternSectionPill text={section.pill} /> : null}
            {section.heading ? <h3>{section.heading}</h3> : null}
            {section.description ? <p>{section.description}</p> : null}
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ))
      ) : (
        <>
          {block.injections.map((injection) => (
            <div className="combination-axis-injection" key={injection.title}>
              <p>{injection.segments.map((segment) => segment.text).join(" ")}</p>
            </div>
          ))}
          {block.closing.map((segment) => (
            <p key={segment.text}>{segment.text}</p>
          ))}
        </>
      )}
      {block.ending?.text ? <p>{block.ending.text}</p> : null}
    </div>
  );
}

function PatternSectionPill({ text }) {
  return (
    <h3 className="pattern-section-pill">
      <span className="pattern-pill">{text}</span>
    </h3>
  );
}

function PatternPills({ text }) {
  const parts = String(text || "").split(" + ");

  if (parts.length < 2) {
    return <h3>{text}</h3>;
  }

  return (
    <h3 className="pattern-pill-row">
      {parts.map((part, index) => (
        <span className="pattern-pill-group" key={`${part}-${index}`}>
          {index > 0 ? <span className="pattern-pill-plus">+</span> : null}
          <span className="pattern-pill">{part}</span>
        </span>
      ))}
    </h3>
  );
}

function NearbyAnchorItem({ copy, language, match }) {
  const role = getDeityRole(match, language, copy.roleFallback);

  return (
    <li className="nearby-anchor">
      <div className="nearby-anchor-heading">
        <h3>{displayDeityName(match, language)}</h3>
      </div>
      {role.seatedName ? <p>{role.seatedName}</p> : null}
    </li>
  );
}
