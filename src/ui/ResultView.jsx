import { useMemo, useState } from "react";
import deityMap from "../../data/deity_axis_map.json";
import {
  composeDeityResultBlock,
  composeResultTextBlocks
} from "../resultComposer/resultTextComposer.js";

const AXIS_LABELS = {
  self: "Self",
  social: "Social",
  care: "Care",
  order: "Order"
};

const PROFILE_AXES = [
  {
    key: "self",
    label: "Self",
    description: "Where you locate yourself inside a situation."
  },
  {
    key: "social",
    label: "Social",
    description: "How you read relationships, distance, and who is affected."
  },
  {
    key: "care",
    label: "Care",
    description: "What you notice as needing support, tending, or protection."
  },
  {
    key: "order",
    label: "Order",
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
        bonpuri: match.bonpuri || deity?.result_summary || deity?.bonpuri || "",
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
        bonpuri: match.bonpuri || deity?.result_summary || deity?.bonpuri || "",
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

export default function ResultView({ result, onRestart }) {
  const matches = useMemo(() => topMatches(result), [result]);
  const [selectedDeityId, setSelectedDeityId] = useState(
    result.primary_anchor?.deity_id || matches[0]?.deity_id
  );
  const [overlayDeityId, setOverlayDeityId] = useState(matches[0]?.deity_id || "");
  const [resultLanguage, setResultLanguage] = useState("en");
  const selectedMatch = matches.find((match) => match.deity_id === selectedDeityId) || matches[0];
  const primaryLabel = isCloseField(matches)
    ? "Closest narrative anchor in a close mythic field"
    : "Closest Narrative Anchor";
  const recognitionPattern = result.recognition_pattern?.label || result.primary_combination;
  const resultTextBlocks = composeResultTextBlocks({
    primaryCombination: result.primary_combination,
    language: resultLanguage
  });
  const deityResultBlock = composeDeityResultBlock({
    deityId: selectedMatch?.deity_id,
    language: resultLanguage
  });
  const userProfileScores = {
    ...result.axis_profile,
    response_intensity: result.response_intensity,
    agency: result.action_pull ?? result.agency
  };

  function handleSelectDeity(deityId) {
    setSelectedDeityId(deityId);
  }

  return (
    <main>
      <section aria-labelledby="result-title">
        <h1 id="result-title">Result</h1>
        <p>
          {primaryLabel}: {selectedMatch?.name_en || selectedMatch?.name_ko}
          {selectedMatch?.name_ko ? ` (${selectedMatch.name_ko})` : ""}
        </p>
        <p>Recognition Pattern: {recognitionPattern}</p>
        <p>
          Response Intensity: {result.response_intensity}% ({result.response_intensity_band})
          <br />
          Shows how strongly the things you notice tend to land, return, press, or stay active for you.
        </p>
        <p>
          Action Pull: {result.action_pull ?? result.agency}% (
          {result.action_pull_band?.label || "Unbanded"})
          <br />
          Shows how strongly what you notice tends to move you toward acting, naming, shaping, changing, or making something concrete.
        </p>

        <section className="result-section" aria-labelledby="profile-shape-title">
          <h2 id="profile-shape-title">Your Profile Shape</h2>
          <p>
            This shape shows your raw profile coordinates across sensitivity, response intensity,
            and action pull.
          </p>
          <ProfileShapeChart
            scores={userProfileScores}
            overlayScores={overlayDeityId ? getDeityProfileScores(overlayDeityId) : null}
            overlayLabel={matches.find((match) => match.deity_id === overlayDeityId)?.name_en || ""}
            size={220}
            showLabels
            title="Your Profile Shape"
          />
          <div className="profile-overlap-controls" aria-label="Profile overlap controls">
            <button type="button" onClick={() => setOverlayDeityId("")}>
              User only
            </button>
            {matches.map((match) => (
              <button
                key={match.deity_id}
                type="button"
                onClick={() => setOverlayDeityId(match.deity_id)}
                aria-pressed={overlayDeityId === match.deity_id}
              >
                {match.rank}. {match.name_en || match.name_ko}
              </button>
            ))}
          </div>
          <ProfileScoreList scores={userProfileScores} />
          {overlayDeityId ? (
            <ProfileScoreList
              scores={getDeityProfileScores(overlayDeityId)}
              title={`Overlay: ${matches.find((match) => match.deity_id === overlayDeityId)?.name_en || overlayDeityId}`}
            />
          ) : null}
          <ProfileShapeLegend />
        </section>

        <section
          className="result-section"
          aria-label="Result interpretation"
        >
          <div className="language-toggle" aria-label="Result language">
            <button
              type="button"
              onClick={() => setResultLanguage("en")}
              aria-pressed={resultLanguage === "en"}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setResultLanguage("ko")}
              aria-pressed={resultLanguage === "ko"}
            >
              KR
            </button>
          </div>
          {deityResultBlock ? (
            <DeityTextBlock
              block={deityResultBlock}
              matchPercentage={selectedMatch?.match_percentage}
            />
          ) : null}
          {resultTextBlocks.map((block) => (
            <ComposerTextBlock block={block} key={`${block.kind}-${block.title}`} />
          ))}
        </section>

        <section className="result-section" aria-labelledby="anchor-shapes-title">
          <h2 id="anchor-shapes-title">Closest Anchor Shapes</h2>
          <p>
            These charts show each deity-anchor's actual profile coordinates in the shared profile
            space.
          </p>
          <div className="anchor-shape-grid">
            {matches.map((match) => (
              <article className="anchor-shape-card" key={match.deity_id}>
                <h3>
                  {match.rank}. {match.name_en || match.name_ko}
                  {match.name_ko ? ` / ${match.name_ko}` : ""}
                </h3>
                <p>
                  {match.match_percentage}% match
                  {match.bonpuri ? ` - ${match.bonpuri}` : ""}
                </p>
                {match.primary_axes?.length ? (
                  <p>Broad category: {formatAxes(match.primary_axes)}</p>
                ) : null}
                {match.anchor_line ? <p>{match.anchor_line}</p> : null}
                <ProfileShapeChart
                  scores={getDeityProfileScores(match.deity_id)}
                  size={230}
                  showLabels
                  compact
                  title={`${match.name_en || match.name_ko} Anchor Profile Shape`}
                />
                <ProfileScoreList
                  scores={getDeityProfileScores(match.deity_id)}
                  compact
                />
                <button
                  type="button"
                  onClick={() => handleSelectDeity(match.deity_id)}
                  aria-pressed={match.deity_id === selectedMatch?.deity_id}
                >
                  Read this anchor
                </button>
              </article>
            ))}
          </div>
        </section>

        <div className="result-footer">
          <button className="restart-button" type="button" onClick={onRestart}>
            Restart
          </button>
        </div>
      </section>
    </main>
  );
}

function ProfileShapeChart({
  scores,
  overlayScores = null,
  overlayLabel = "",
  size = 280,
  showLabels = true,
  compact = false,
  title = "Profile Shape"
}) {
  const center = size / 2;
  const radius = compact ? size * 0.34 : size * 0.32;
  const labelRadius = compact ? radius + 18 : radius + 30;
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
      value,
      x: center + (Math.cos(angle) * pointRadius),
      y: center + (Math.sin(angle) * pointRadius)
    };
  }) : [];
  const polygonPoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const overlayPolygonPoints = overlayPoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <figure className="profile-shape">
      <div className="profile-shape-actions">
        <figcaption>{title}</figcaption>
      </div>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Profile Shape across Self, Social, Care, Order, Response Intensity, and Action Pull"
        data-raw-scores={JSON.stringify(rawScores)}
        data-overlay-scores={rawOverlayScores ? JSON.stringify(rawOverlayScores) : undefined}
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
        <polygon className="profile-shape-polygon" points={polygonPoints} />
        {overlayPolygonPoints ? (
          <polygon className="profile-shape-overlay-polygon" points={overlayPolygonPoints} />
        ) : null}
        {points.map((point) => (
          <circle className="profile-shape-point" cx={point.x} cy={point.y} r="3" key={point.key} />
        ))}
        {overlayPoints.map((point) => (
          <circle
            className="profile-shape-overlay-point"
            cx={point.x}
            cy={point.y}
            r="3"
            key={`${point.key}-overlay-point`}
          />
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
            {point.label}
          </text>
        )) : null}
      </svg>
      {overlayLabel ? <p className="profile-shape-overlay-label">Overlay: {overlayLabel}</p> : null}
    </figure>
  );
}

function ProfileShapeLegend() {
  return (
    <dl className="profile-shape-legend">
      {PROFILE_AXES.map((axis) => (
        <div key={axis.key}>
          <dt>{axis.label}</dt>
          <dd>{axis.description}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProfileScoreList({ scores, title = "", compact = false }) {
  const rawScores = getRawProfileScores(scores);

  return (
    <>
      {title ? <h3>{title}</h3> : null}
      <dl className={compact ? "profile-score-list profile-score-list-compact" : "profile-score-list"}>
        {PROFILE_AXES.map((axis) => (
          <div key={axis.key}>
            <dt>{axis.label}</dt>
            <dd>{rawScores[axis.key]}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function getRawProfileScores(scores) {
  return Object.fromEntries(PROFILE_AXES.map((axis) => [
    axis.key,
    roundDisplayScore(scores?.[axis.key])
  ]));
}

function roundDisplayScore(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function formatAxes(axes) {
  return axes.map((axis) => AXIS_LABELS[axis] || axis).join(" + ");
}

function getDeityProfileScores(deityId) {
  const deity = deityMap.deities.find((candidate) => candidate.deity_id === deityId);

  return deity?.axis_vector || {};
}

function isCloseField(matches) {
  const [first, second] = matches;
  if (!first || !second) return false;

  return Math.abs((first.match_percentage || 0) - (second.match_percentage || 0)) <= 3;
}

function DeityTextBlock({ block, matchPercentage }) {
  return (
    <div className="writing-block deity-result-block">
      <h2>
        {block.title}
        {matchPercentage != null ? (
          <span className="deity-match-percentage"> {matchPercentage}% match</span>
        ) : null}
      </h2>
      {block.subtitle ? <h3>{block.subtitle}</h3> : null}
      {block.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function ComposerTextBlock({ block }) {
  if (block.kind === "combination") {
    return (
      <div className="writing-block">
        <h2>{block.title.text}</h2>
        {block.subtitle ? <h3>{block.subtitle.text}</h3> : null}
        {block.opening ? <p>{block.opening.text}</p> : null}
        {block.injections?.map((injection) => (
          <section className="composer-injection" key={injection.title}>
            <h4>{injection.title}</h4>
            {injection.bridge ? <p>{injection.bridge}</p> : null}
            <p>{injection.segments.map((segment) => segment.text).join(" ")}</p>
          </section>
        ))}
        {block.closing?.map((paragraph) => (
          <p key={`${paragraph.marker}-${paragraph.text}`}>{paragraph.text}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="writing-block">
      <h2>{block.title}</h2>
      {block.subtitle ? <h3>{block.subtitle}</h3> : null}
      {block.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}
