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

function topMatches(result) {
  const deityById = new Map(deityMap.deities.map((deity) => [deity.deity_id, deity]));

  if (result.top_matches) {
    return result.top_matches.map((match, index) => {
      const deity = deityById.get(match.deity_id);

      return {
        ...match,
        rank: index + 1,
        name_ko: match.name_ko || deity?.name_ko || match.deity_id,
        name_en: match.name_en || deity?.name_en || "",
        bonpuri: match.bonpuri || deity?.result_summary || deity?.bonpuri || "",
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
          Primary match: {selectedMatch?.name_en || selectedMatch?.name_ko}
          {selectedMatch?.name_ko ? ` (${selectedMatch.name_ko})` : ""}
        </p>
        <p>Recognition pattern: {result.primary_combination}</p>
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

        <section className="result-section" aria-labelledby="scores-title">
          <h2 id="scores-title">Scores</h2>
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
            </tbody>
          </table>
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

          {deitySection ? (
            <>
              <div className="writing-divider" />
              <ResultTextBlock
                block={deitySection}
                eyebrow={
                  selectedMatch?.rank === 1
                    ? "Primary Narrative Anchor"
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

        <section className="result-section" aria-labelledby="matches-title">
          <h2 id="matches-title">Top 5 Deity Matches</h2>
          <div className="matches-list">
            {matches.map((match) => (
              <button
                className="match-button"
                key={match.deity_id}
                type="button"
                onClick={() => handleSelectDeity(match.deity_id)}
                aria-pressed={match.deity_id === selectedMatch?.deity_id}
              >
                {match.rank}. {match.name_en || match.name_ko}
                {match.name_en && match.name_ko ? ` / ${match.name_ko}` : ""}
                {" - "}
                {match.match_percentage}%
                {match.bonpuri ? ` - ${match.bonpuri}` : ""}
                {match.primary_axes.length ? ` - ${formatAxes(match.primary_axes)}` : ""}
              </button>
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

function formatAxes(axes) {
  const labels = {
    self: "Self",
    social: "Social",
    care: "Care",
    order: "Order"
  };

  return axes.map((axis) => labels[axis] || axis).join(" + ");
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
