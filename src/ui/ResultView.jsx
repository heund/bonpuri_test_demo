import { useMemo } from "react";
import deityMap from "../../data/deity_axis_map.json";
import deityNamesTable from "../../deity_names.txt?raw";
import deityResultDescriptionsEnText from "../../deity_result_description_en.txt?raw";
import deityResultDescriptionsKoText from "../../deity_result_description_ko.txt?raw";
import { composeDeityResultBlock } from "../resultComposer/resultTextComposer.js";

const PROFILE_AXES = [
  {
    key: "self",
    label: "Self",
    label_ko: "내면",
    description: "Where you locate yourself inside a situation."
  },
  {
    key: "social",
    label: "Social",
    label_ko: "관계",
    description: "How you read relationships, distance, and who is affected."
  },
  {
    key: "care",
    label: "Care",
    label_ko: "돌봄",
    description: "What you notice as needing support, tending, or protection."
  },
  {
    key: "order",
    label: "Order",
    label_ko: "질서",
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
    nearbyDescription: "현재 결과와 가까운 다섯 개의 신격 연결입니다.",
    roleFallback: "본풀이 결과 신격",
    takeAgain: "다시 검사하기"
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

function parseDeityRoleTable(table) {
  return new Map(table
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/)
    .map(parseDeityRoleLine)
    .filter(([resultName, , description]) => resultName && description)
    .filter(([resultName]) => (
      resultName !== "결과명"
      && resultName !== "Result"
      && !/^[-:]+$/.test(resultName)
    ))
    .map(([resultName, seatedName, description]) => [
      resultName,
      { seatedName, description }
    ]));
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

function displayDeityName(match, language) {
  if (!match) return "";
  if (language === "ko") return match.name_ko || match.name_en || match.deity_id;
  return match.name_en || match.name_ko || match.deity_id;
}

function getDeityRole(match, language, fallback) {
  if (!match) return fallback;

  const deityRole = DEITY_ROLES.get(language === "ko" ? match.name_ko : match.name_en);
  if (deityRole) {
    return `${deityRole.seatedName} | ${deityRole.description}`;
  }

  const roleText = removeTrailingPeriod(match.anchor_line) || formatTone(match.tone);
  return roleText ? `Deity of ${lowercaseFirst(roleText)}` : fallback;
}

function removeTrailingPeriod(text = "") {
  return text.trim().replace(/\.$/, "");
}

function lowercaseFirst(text = "") {
  return text ? `${text[0].toLowerCase()}${text.slice(1)}` : "";
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
    Self: "내면",
    Social: "관계",
    Care: "돌봄",
    Order: "질서"
  };

  return pattern
    .split(" + ")
    .map((axisLabel) => koreanAxisLabels[axisLabel] || axisLabel)
    .join(" + ");
}

export default function ResultView({ language = "en", onLanguageChange, result, onRestart }) {
  const matches = useMemo(() => topMatches(result), [result]);
  const resultLanguage = language;
  const copy = RESULT_COPY[resultLanguage];
  const selectedMatch = matches.find((match) => (
    match.deity_id === result.primary_anchor?.deity_id
  )) || matches[0];
  const recognitionPattern = result.recognition_pattern?.label || result.primary_combination;
  const displayedRecognitionPattern = formatRecognitionPattern(recognitionPattern, resultLanguage);
  const deityResultBlock = composeDeityResultBlock({
    deityId: selectedMatch?.deity_id,
    language: resultLanguage
  });
  const userProfileScores = {
    ...result.axis_profile,
    response_intensity: result.response_intensity,
    agency: result.action_pull ?? result.agency
  };
  const matchSentence = formatMatchSentence(selectedMatch, resultLanguage);
  const deityResultDescription = resultLanguage === "ko"
    ? DEITY_RESULT_DESCRIPTIONS_KO.get(selectedMatch?.name_ko)
    : DEITY_RESULT_DESCRIPTIONS_EN.get(selectedMatch?.name_en);
  const nearbyMatches = matches.slice(0, 5);

  return (
    <main className="result-page">
      <div className="page-top-bar">
        <div className="language-toggle" aria-label="Result language">
          <button
            type="button"
            onClick={() => onLanguageChange?.("en")}
            aria-pressed={resultLanguage === "en"}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange?.("ko")}
            aria-pressed={resultLanguage === "ko"}
          >
            KR
          </button>
        </div>
      </div>

      <section aria-labelledby="result-title">
        <section className="result-hero" aria-labelledby="result-title">
          <p className="result-eyebrow">{copy.resultTitle}</p>
          <h1 id="result-title">{displayDeityName(selectedMatch, resultLanguage)}</h1>
          <p className="result-deity-role">
            {getDeityRole(selectedMatch, resultLanguage, copy.roleFallback)}
          </p>
          {selectedMatch?.bonpuri ? (
            <p className="result-source">
              {sourceLine(selectedMatch.bonpuri)}
            </p>
          ) : null}
          <ProfileShapeChart
            legend={{
              deity: `${resultLanguage === "ko" ? "신격 결과" : "Deity result"}: ${displayDeityName(selectedMatch, resultLanguage)}`,
              user: resultLanguage === "ko" ? "나의 결과" : "Your result"
            }}
            overlayScores={getDeityProfileScores(selectedMatch?.deity_id)}
            scores={userProfileScores}
            size={460}
            language={resultLanguage}
            showLabels
          />
          <div className="result-hero-meta">
            {selectedMatch?.match_percentage != null ? (
              <div className="result-match-meter">
                <p className="result-match-sentence">
                  {matchSentence}
                </p>
                <span className="result-match-track" aria-hidden="true">
                  <span style={{ width: `${Math.max(0, Math.min(100, selectedMatch.match_percentage))}%` }} />
                </span>
              </div>
            ) : null}
            <p className="result-pattern">
              <span>{copy.recognitionPattern}</span>
              <strong>{displayedRecognitionPattern}</strong>
            </p>
          </div>
        </section>

        <section className="result-section result-reading-section" aria-label={copy.resultText}>
          {deityResultDescription ? (
            <DeityDescriptionIntroBlock block={deityResultDescription} />
          ) : null}
          {deityResultBlock ? (
            <DeityTextBlock block={deityResultBlock} />
          ) : null}
        </section>

        <section className="result-section score-summary-section" aria-labelledby="score-summary-title">
          <h2 id="score-summary-title">{copy.compactScores}</h2>
          <CompactScoreSummary language={resultLanguage} scores={userProfileScores} />
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

function CompactScoreSummary({ language, scores }) {
  const rawScores = getRawProfileScores(scores);

  return (
    <div className="compact-score-summary">
      {SCORE_GROUPS.map((group) => (
        <section className={`compact-score-group compact-score-group-${group.id}`} key={group.id}>
          <h3>{group.label[language]}</h3>
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
        </section>
      ))}
    </div>
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

function DeityDescriptionIntroBlock({ block }) {
  return (
    <div className="writing-block deity-description-intro">
      <h2>{block.title}</h2>
      {block.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function NearbyAnchorItem({ copy, language, match }) {
  return (
    <li className="nearby-anchor">
      <div className="nearby-anchor-heading">
        <h3>
          <span className="nearby-anchor-rank">{match.rank}.</span>
          {displayDeityName(match, language)}
        </h3>
        {match.match_percentage != null ? <strong>{match.match_percentage}%</strong> : null}
      </div>
      {match.match_percentage != null ? (
        <span className="nearby-anchor-match-track" aria-hidden="true">
          <span style={{ width: `${Math.max(0, Math.min(100, match.match_percentage))}%` }} />
        </span>
      ) : null}
      <p className="nearby-anchor-role">{getDeityRole(match, language, copy.roleFallback)}</p>
      {match.bonpuri ? (
        <p className="nearby-anchor-source">
          {sourceLine(match.bonpuri)}
        </p>
      ) : null}
      {language === "en" && match.anchor_line ? (
        <p className="nearby-anchor-description">{match.anchor_line}</p>
      ) : null}
    </li>
  );
}
