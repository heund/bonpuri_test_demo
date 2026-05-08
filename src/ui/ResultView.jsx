import { useMemo, useState } from "react";
import deityMap from "../../data/deity_axis_map.json";
import {
  buildOtherHighScoresLine,
  getCategorySection,
  getCombinationSection,
  getDeitySection
} from "./resultContent.js";

const AXIS_LABELS = {
  self: "Self",
  social: "Social",
  care: "Care",
  order: "Order"
};

const AXIS_DESCRIPTIONS = {
  self: "Where am I in this, and what does this change about how I understand myself?",
  social: "What is happening between us, and who is being affected?",
  care: "What needs care or support in order to keep going?",
  order: "What needs to be placed, shaped, or brought into order here?"
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
const REASON_TO_SUBCATEGORY = {
  "hidden origin": "source_origin",
  "self-recognition": "self_recognition",
  "cultivation / becoming": "becoming_cultivation",
  "reception of the unfamiliar": "reception_of_strange",
  "sustaining shared life": "household_sustaining",
  "arrival into life": "birth_arrival",
  "failed or unsafe arrival": "failed_arrival",
  "rupture and return": "rupture_harm_return",
  "mourning / passage": "mourning_passage",
  "procedure / hidden sequence": "procedural_order",
  "cosmic law": "cosmic_law",
  "crooked order": "crooked_order",
  "calling / initiation": "calling_initiation",
  "origin-cost": "origin_cost",
  "seasonal timing": "seasonal_cycle",
  "hidden force": "hidden_force",
  restoration: "restoration",
  "domestic care": "domestic_care",
  "ritual responsibility": "ritual_responsibility",
  "death crossing": "death_crossing"
};

const SUBCATEGORY_TO_REASON = Object.fromEntries(
  Object.entries(REASON_TO_SUBCATEGORY).map(([label, key]) => [key, label])
);

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
  const [language, setLanguage] = useState("en");
  const combinationSection = getCombinationSection(result.primary_combination);
  const selectedMatch = matches.find((match) => match.deity_id === selectedDeityId) || matches[0];
  const deitySection = getDeitySection(selectedMatch?.deity_id);
  const otherHighScoresLine = buildOtherHighScoresLine(
    result.axis_profile,
    result.primary_combination
  );
  const sortedAxes = Object.entries(AXIS_LABELS)
    .map(([key, label]) => ({ key, label, score: result.axis_profile[key] }))
    .sort((a, b) => b.score - a.score);
  const topSubcategories = Object.entries(
    result.diagnostic_subcategories || result.subcategory_profile || {}
  )
    .map(([key, score]) => ({
      key,
      label: SUBCATEGORY_TO_REASON[key] || key.replaceAll("_", " "),
      score
    }))
    .filter((subcategory) => Number(subcategory.score) > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const strongestLens = ["self", "social"]
    .map((key) => ({ key, score: result.axis_profile[key] }))
    .sort((a, b) => b.score - a.score)[0];
  const strongestOrientation = ["care", "order"]
    .map((key) => ({ key, score: result.axis_profile[key] }))
    .sort((a, b) => b.score - a.score)[0];
  const categoryBlocks = [strongestLens, strongestOrientation]
    .map(({ key, score }) => ({
      axis: key,
      score,
      section: getCategorySection(key, language)
    }))
    .filter((block) => block.section);
  const relatedDeityLine = buildRelatedDeityLine(matches);
  const primaryLabel = isCloseField(matches)
    ? "Closest narrative anchor in a close mythic field"
    : "Closest Narrative Anchor";
  const recognitionPattern = result.recognition_pattern?.label || result.primary_combination;
  const mythicField = result.mythic_field;
  const similarityDecomposition = result.similarity_decomposition;
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
        <div aria-label="Language switch">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            aria-pressed={language === "en"}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage("kr")}
            aria-pressed={language === "kr"}
          >
            KR
          </button>
        </div>
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
            size={260}
            showLabels
            title="Your Profile Shape"
            filename="your-profile-shape.png"
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

        <section className="result-section" aria-labelledby="anchor-shapes-title">
          <h2 id="anchor-shapes-title">Closest Anchor Shapes</h2>
          <p>
            These charts show each deity-anchor's actual profile coordinates in the shared profile
            space. Match distance and fit values are kept in the diagnostic breakdown below.
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
                  filename={`${slugify(match.name_en || match.name_ko || match.deity_id)}-profile-shape.png`}
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

        <section
          className="result-section"
          aria-label="Result interpretation"
        >
          {categoryBlocks.length ? (
            <section aria-labelledby="category-results-title">
              <h2 id="category-results-title">Category Results</h2>
              {categoryBlocks.map(({ axis, score, section }) => (
                <ResultTextBlock
                  block={section}
                  eyebrow={`${AXIS_LABELS[axis]} ${score}%`}
                  key={axis}
                />
              ))}
            </section>
          ) : null}

          {combinationSection ? (
            <ResultTextBlock
              block={combinationSection}
              eyebrow="Recognition Pattern"
            />
          ) : (
            <ResultTextBlock
              block={{
                title: "Mixed Field",
                paragraphs: [
                  "Your result sits in a mixed field rather than a single clean axis pair.",
                  "Read this as a layered sensitivity profile, not a fixed label."
                ]
              }}
              eyebrow="Recognition Pattern"
            />
          )}

          {mythicField ? (
            <div className="writing-block">
              <h2>Mythic Field</h2>
              <h3>{formatMythicFieldTitle(mythicField)}</h3>
              <p>{mythicField.description}</p>
              {mythicField.secondary_field ? (
                <p>
                  This result sits between {mythicField.label} and{" "}
                  {mythicField.secondary_field.label}.
                </p>
              ) : null}
            </div>
          ) : null}

          {deitySection ? (
            <>
              <div className="writing-divider" />
              <ResultTextBlock
                block={deitySection}
                eyebrow={
                  selectedMatch?.rank === 1
                    ? primaryLabel
                    : `Narrative Anchor ${selectedMatch?.rank}`
                }
              />
            </>
          ) : null}

          {otherHighScoresLine ? (
            <p className="other-scores-line">{otherHighScoresLine}</p>
          ) : null}

          {relatedDeityLine ? (
            <p className="other-scores-line deity-visit-line">{relatedDeityLine}</p>
          ) : null}
        </section>

        <details className="result-section">
          <summary>How the match was calculated</summary>
          <DiagnosticScores
            result={result}
            sortedAxes={sortedAxes}
            topSubcategories={topSubcategories}
          />
          <p>
            These anchors are near your result through different layers of similarity. Some are close
            because their broad sensitivity shape resembles yours. Others may be close because of
            specific mythic subcategory pathways. The map below shows which layer is doing the work.
          </p>
          <SimilarityMap decomposition={similarityDecomposition} />
        </details>

        <div className="result-footer">
          <button className="restart-button" type="button" onClick={onRestart}>
            Restart
          </button>
        </div>
      </section>
    </main>
  );
}

function SimilarityMap({ decomposition }) {
  if (!decomposition?.top_matches?.length) return null;
  const deityById = new Map(deityMap.deities.map((deity) => [deity.deity_id, deity]));
  const resultStructure = getResultStructure(decomposition.top_matches);

  return (
    <div className="anchor-map">
      <h3>Match Structure Map</h3>
      <p>
        Each nearby anchor is close for a different reason. This map separates structural fit,
        narrative pathway fit, and behavioural fit so you can see what is actually pulling each
        deity near your result.
      </p>
      <p>
        <strong>Result structure: {resultStructure.label}</strong>
        <br />
        {resultStructure.description}
      </p>
      <table className="similarity-matrix">
        <thead>
          <tr>
            <th>Anchor</th>
            <th>Match type</th>
            <th>Structural fit</th>
            <th>Narrative pathway</th>
            <th>Behavioural fit</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {decomposition.top_matches.map((match) => {
            const deity = deityById.get(match.deity_id);
            const storedSubcategories = topDeitySubcategories({
              deity_subcategories: match.deity_subcategories
            });
            const matchStructure = getMatchStructure(match);

            return (
              <tr key={match.deity_id}>
                <th scope="row">
                  {match.display_name}
                  <br />
                  <span>{match.match_percent}% match</span>
                  <br />
                  {deity?.primary_axes?.length ? (
                    <>
                      <span>Broad category: {formatAxes(deity.primary_axes)}</span>
                      <br />
                    </>
                  ) : null}
                  {storedSubcategories.length ? (
                    <>
                      <span>Subcategories: {storedSubcategories.join(", ")}</span>
                      <br />
                    </>
                  ) : null}
                  <span>Main drivers: {formatDrivers(match.main_drivers)}</span>
                </th>
                <td>
                  <strong>{matchStructure.type}</strong>
                  <br />
                  <span>{formatLayerPoints(match.contribution_breakdown)}</span>
                </td>
                <td>
                  <StructuralFit overlaps={match.axis_overlap} />
                </td>
                <td>
                  <NarrativePathway
                    match={match}
                    matchStructure={matchStructure}
                  />
                </td>
                <td>
                  <BehaviouralFit overlaps={match.modifier_overlap} />
                </td>
                <td>{buildMatchStructureNote(match, matchStructure)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DiagnosticScores({ result, sortedAxes, topSubcategories }) {
  return (
    <section aria-labelledby="scores-title">
      <h3 id="scores-title">Scores</h3>
      <table>
        <thead>
          <tr>
            <th>Axis</th>
            <th>Score</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {sortedAxes.map(({ key, label, score }) => (
            <tr key={key}>
              <td>{label}</td>
              <td>{score}%</td>
              <td>{AXIS_DESCRIPTIONS[key]}</td>
            </tr>
          ))}
          <tr>
            <td>Response Intensity</td>
            <td>{result.response_intensity}%</td>
            <td>Shows how strongly the things you notice tend to land, return, press, or stay active for you.</td>
          </tr>
          <tr>
            <td>Action Pull</td>
            <td>{result.action_pull ?? result.agency}%</td>
            <td>Shows how strongly what you notice tends to move you toward acting, naming, shaping, changing, or making something concrete.</td>
          </tr>
          {topSubcategories.map((subcategory, index) => (
            <tr key={subcategory.key}>
              <td>{index === 0 ? "Top Subcategory Signals" : ""}</td>
              <td>{subcategory.score}%</td>
              <td>{subcategory.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ProfileShapeChart({
  scores,
  overlayScores = null,
  overlayLabel = "",
  size = 280,
  showLabels = true,
  compact = false,
  title = "Profile Shape",
  filename = "profile-shape.png"
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
        <button type="button" onClick={(event) => downloadProfileShape(event, filename)}>
          Save
        </button>
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

async function downloadProfileShape(event, filename) {
  const figure = event.currentTarget.closest(".profile-shape");
  const svg = figure?.querySelector("svg");
  if (!svg) return;

  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const viewBox = svg.viewBox.baseVal;
  const width = viewBox?.width || svg.clientWidth || 320;
  const height = viewBox?.height || svg.clientHeight || 320;
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `
    .profile-shape-grid,.profile-shape-axis{fill:none;stroke:#999;stroke-width:1}
    .profile-shape-polygon{fill:rgba(0,0,0,0.12);stroke:#000;stroke-width:2}
    .profile-shape-point{fill:#000}
    .profile-shape-label{fill:#000;font-size:13px;font-family:Times New Roman,Times,serif}
  `;
  const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  background.setAttribute("x", "0");
  background.setAttribute("y", "0");
  background.setAttribute("width", "100%");
  background.setAttribute("height", "100%");
  background.setAttribute("fill", "#fff");
  clone.insertBefore(background, clone.firstChild);
  clone.insertBefore(style, background.nextSibling);
  const source = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();

  image.onload = () => {
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return;

      const pngUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = filename.replace(/\.svg$/i, ".png");
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(pngUrl);
    }, "image/png");
  };

  image.onerror = () => {
    URL.revokeObjectURL(url);
  };
  image.src = url;
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

function StructuralFit({ overlaps }) {
  return (
    <div className="similarity-stack">
      {["self", "social", "care", "order"].map((key) => (
        <AxisCell key={key} overlap={overlaps.find((item) => item.key === key)} />
      ))}
    </div>
  );
}

function AxisCell({ overlap }) {
  if (!overlap) return null;

  return (
    <div className="similarity-layer">
      <DistanceBar distance={overlap.distance} />
      <strong>{overlap.label}: {fitLabelForDistance(overlap.distance)}</strong>
      <div className="similarity-signals">
        <span>User {overlap.user_score}</span>
        <span>Deity {overlap.deity_score}</span>
        <span>Distance {overlap.distance}</span>
      </div>
    </div>
  );
}

function NarrativePathway({ match, matchStructure }) {
  const score = Math.round(Number(match.contribution_breakdown.subcategory || 0) * 100);

  if (matchStructure.lowNarrativeSignal) {
    return (
      <div className="similarity-layer">
        <strong>Narrative pathway: Low signal</strong>
        <p>
          This anchor is not being pulled strongly by a specific mythic subcategory pathway in
          this result.
        </p>
        <span>{score} pts</span>
      </div>
    );
  }

  return (
    <div className="similarity-layer">
      <SimilarityLayer
        value={match.contribution_breakdown.subcategory}
        signals={match.subcategory_overlap.map((overlap) => overlap.label)}
      />
    </div>
  );
}

function BehaviouralFit({ overlaps }) {
  const response = overlaps.find((item) => item.key === "response_intensity");
  const agency = overlaps.find((item) => item.key === "agency");
  const labels = [response, agency].filter(Boolean).map((overlap) => (
    fitLabelForDistance(overlap.distance)
  ));
  const summary = labels.every((label) => label === "strong" || label === "medium")
    ? "Strong behavioural fit"
    : labels.some((label) => label === "strong" || label === "medium")
      ? "Mixed behavioural fit"
      : "Weak behavioural fit";

  return (
    <div className="similarity-stack">
      <strong>{summary}</strong>
      {[response, agency].filter(Boolean).map((overlap) => (
        <div className="similarity-layer" key={overlap.key}>
          <DistanceBar distance={overlap.distance} />
          <strong>{overlap.label}: {fitLabelForDistance(overlap.distance)}</strong>
          <div className="similarity-signals">
            <span>User {overlap.user_score}</span>
            <span>Deity {overlap.deity_score}</span>
            <span>Distance {overlap.distance}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SimilarityLayer({ value, signals }) {
  const displayValue = Math.round(Number(value || 0) * 100);
  const width = Math.max(2, Math.min(100, displayValue));

  return (
    <div className="similarity-layer">
      <div className="similarity-bar" aria-label={`${displayValue} weighted similarity points`}>
        <span style={{ width: `${width}%` }} />
      </div>
      <strong>Narrative pathway: {displayValue} pts</strong>
      <div className="similarity-signals">
        {signals.length ? signals.slice(0, 4).map((signal) => (
          <span key={signal}>{signal}</span>
        )) : <span>Low signal</span>}
      </div>
    </div>
  );
}

function DistanceBar({ distance }) {
  const closeness = Math.max(0, 100 - Number(distance || 0));

  return (
    <div className="similarity-bar" aria-label={`${distance} point distance`}>
      <span style={{ width: `${Math.max(2, closeness)}%` }} />
    </div>
  );
}

function formatDrivers(drivers) {
  const labels = {
    axis: "Axis",
    subcategory: "subcategory",
    modifier: "modifier"
  };

  return drivers.map((driver) => labels[driver] || driver).join(" + ");
}

function getMatchStructure(match) {
  const structural = Number(match.contribution_breakdown?.axis || 0);
  const narrative = Number(match.contribution_breakdown?.subcategory || 0);
  const behavioural = Number(match.contribution_breakdown?.modifier || 0);
  const total = structural + narrative + behavioural;
  const narrativeShare = total === 0 ? 0 : narrative / total;
  const behaviouralShare = total === 0 ? 0 : behavioural / total;
  const lowNarrativeSignal = narrative < 0.05 || narrativeShare < 0.1;
  const narrativeMeaningful = !lowNarrativeSignal;
  const behaviouralMeaningful = behaviouralShare >= 0.15 || match.main_drivers?.includes("modifier");
  const structuralMeaningful = structural > 0;
  const sortedLayers = [
    ["structural", structural],
    ["narrative", narrative],
    ["behavioural", behavioural]
  ].sort((a, b) => b[1] - a[1]);
  const dominantLayer = sortedLayers[0]?.[0] || "structural";

  let type = "Partial match";
  if (structuralMeaningful && narrativeMeaningful && behaviouralMeaningful) {
    type = "Full match";
  } else if (dominantLayer === "behavioural" || (!structuralMeaningful && behaviouralMeaningful)) {
    type = "Behavioural fit";
  } else if (dominantLayer === "narrative" && narrativeMeaningful) {
    type = "Narrative anchor";
  } else if (structuralMeaningful && narrativeMeaningful) {
    type = "Structural + narrative anchor";
  } else if (structuralMeaningful && lowNarrativeSignal) {
    type = "Structural anchor";
  }

  return {
    type,
    structural,
    narrative,
    behavioural,
    dominantLayer,
    lowNarrativeSignal,
    narrativeMeaningful,
    behaviouralMeaningful
  };
}

function getResultStructure(matches) {
  const analyses = matches.map(getMatchStructure);
  const structuralDominantCount = analyses.filter((analysis) => (
    analysis.dominantLayer === "structural"
  )).length;
  const narrativeCount = analyses.filter((analysis) => analysis.narrativeMeaningful).length;
  const behaviouralCount = analyses.filter((analysis) => analysis.behaviouralMeaningful).length;
  const lowNarrativeCount = analyses.filter((analysis) => analysis.lowNarrativeSignal).length;
  const majority = Math.ceil(matches.length / 2);

  if (behaviouralCount >= majority && structuralDominantCount < majority) {
    return {
      label: "Behavioural-dominant",
      description: "Your nearby anchors are being pulled mainly by Response Intensity and Action Pull fit."
    };
  }

  if (narrativeCount >= majority && structuralDominantCount < majority) {
    return {
      label: "Narrative-dominant",
      description: "Your nearby anchors are being pulled mainly by specific mythic subcategory pathways."
    };
  }

  if (narrativeCount >= majority && structuralDominantCount >= majority) {
    return {
      label: "Mixed",
      description: "Your nearby anchors are being pulled by both broad sensitivity shape and active mythic subcategory pathways."
    };
  }

  if (structuralDominantCount >= majority && lowNarrativeCount >= majority) {
    return {
      label: "Axis-dominant",
      description: "Your nearby anchors are being pulled mainly by broad sensitivity shape and response/action fit. The system is not detecting a strong single mythic subcategory pathway in this result."
    };
  }

  return {
    label: "Mixed",
    description: "Your nearby anchors are being pulled by different combinations of structural, narrative, and behavioural fit."
  };
}

function buildMatchStructureNote(match, matchStructure) {
  const strongestAxes = orderedAxisOverlaps(match)
    .filter((overlap) => overlap.distance <= 25)
    .slice(0, 2)
    .map((overlap) => overlap.label);
  const distantModifiers = match.modifier_overlap
    .filter((overlap) => overlap.distance > 40)
    .map((overlap) => overlap.label);
  const closeModifiers = match.modifier_overlap
    .filter((overlap) => overlap.distance <= 25)
    .map((overlap) => overlap.label);

  if (matchStructure.lowNarrativeSignal && matchStructure.dominantLayer === "structural") {
    const axisText = strongestAxes.length ? ` through ${formatList(strongestAxes)}` : "";
    const modifierText = distantModifiers.length
      ? ` ${formatList(distantModifiers)} is much farther from your result.`
      : "";

    return `This is mainly a structural match${axisText}. The narrative subcategory pathway is low in this result.${modifierText}`;
  }

  if (matchStructure.lowNarrativeSignal && closeModifiers.length) {
    return `This anchor is close through broad structure and ${formatList(closeModifiers)}, not through a strong active subcategory pathway.`;
  }

  if (matchStructure.narrativeMeaningful) {
    const pathways = match.subcategory_overlap.slice(0, 2).map((overlap) => overlap.label);
    return `This anchor has an active narrative pathway through ${formatList(pathways)}, alongside its structural fit.`;
  }

  return "This anchor is nearby, but no single layer fully explains the match on its own.";
}

function formatLayerPoints(breakdown) {
  return `Structural ${Math.round(Number(breakdown.axis || 0) * 100)} / Narrative ${Math.round(Number(breakdown.subcategory || 0) * 100)} / Behavioural ${Math.round(Number(breakdown.modifier || 0) * 100)}`;
}

function formatAxes(axes) {
  return axes.map((axis) => AXIS_LABELS[axis] || axis).join(" + ");
}

function orderedAxisOverlaps(match) {
  return ["self", "social", "care", "order"]
    .map((key) => match.axis_overlap.find((overlap) => overlap.key === key))
    .filter(Boolean);
}

function formatList(items) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function topDeitySubcategories(match, limit = 4) {
  return Object.entries(match.deity_subcategories || {})
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
    .slice(0, limit)
    .map(([key]) => SUBCATEGORY_TO_REASON[key] || key.replaceAll("_", " "));
}

function getDeityProfileScores(deityId) {
  const deity = deityMap.deities.find((candidate) => candidate.deity_id === deityId);

  return deity?.axis_vector || {};
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "profile-shape";
}

function formatModifierFit(overlaps) {
  const close = overlaps
    .filter((overlap) => overlap.distance <= 25)
    .map((overlap) => `${overlap.label} fit`);

  if (close.length) return close.join(", ");

  return overlaps
    .map((overlap) => `${overlap.label} distance ${overlap.distance}`)
    .join(", ");
}

function fitLabelForDistance(distance) {
  if (distance <= 10) return "strong";
  if (distance <= 25) return "medium";
  if (distance <= 40) return "weak";

  return "distant";
}

function isCloseField(matches) {
  const [first, second] = matches;
  if (!first || !second) return false;

  return Math.abs((first.match_percentage || 0) - (second.match_percentage || 0)) <= 3;
}

function formatMythicFieldTitle(field) {
  if (!field.secondary_field) return field.label;

  return `${field.label} + ${field.secondary_field.label}`;
}

function buildRelatedDeityLine(matches) {
  const related = matches.slice(1, 4);
  if (related.length === 0) return "";

  const names = related.map((match) => match.name_en || match.name_ko);
  const last = names.pop();
  const list = names.length ? `${names.join(", ")} and ${last}` : last;

  return `You can also read this result beside ${list}; these nearby anchors show other ways into the same response field.`;
}

function ResultTextBlock({ block, eyebrow }) {
  return (
    <div className="writing-block">
      <h2>{eyebrow}</h2>
      <h3>{block.title}</h3>
      {block.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}
