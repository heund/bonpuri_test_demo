export const MAIN_AXES = ["self", "social", "care", "justice"];
export const MODIFIER_AXIS = "response_intensity";
export const ALL_SCORE_KEYS = [...MAIN_AXES, MODIFIER_AXIS];

export function emptyScores() {
  return ALL_SCORE_KEYS.reduce((scores, key) => {
    scores[key] = 0;
    return scores;
  }, {});
}

export function getMaxPossibleScores(questionsData) {
  const maxScores = emptyScores();

  for (const question of questionsData.questions) {
    for (const key of ALL_SCORE_KEYS) {
      const questionMax = Math.max(
        ...question.options.map((option) => Number(option.scores[key] || 0))
      );
      maxScores[key] += questionMax;
    }
  }

  return maxScores;
}

export function scoreAnswers(questionsData, answersByQuestionId) {
  const rawScores = emptyScores();
  const selectedOptions = [];

  for (const question of questionsData.questions) {
    const optionId = answersByQuestionId[question.id];
    if (!optionId) {
      throw new Error(`Missing answer for question ${question.id}`);
    }

    const option = question.options.find((candidate) => candidate.id === optionId);
    if (!option) {
      throw new Error(`Unknown option ${optionId} for question ${question.id}`);
    }

    selectedOptions.push({
      question_id: question.id,
      option_id: option.id
    });

    for (const key of ALL_SCORE_KEYS) {
      rawScores[key] += Number(option.scores[key] || 0);
    }
  }

  return {
    rawScores,
    maxScores: getMaxPossibleScores(questionsData),
    selectedOptions
  };
}

export function normaliseScores(rawScores, maxScores) {
  const normalised = {};

  for (const key of ALL_SCORE_KEYS) {
    normalised[key] = maxScores[key] === 0
      ? 0
      : Math.round((rawScores[key] / maxScores[key]) * 100);
  }

  return normalised;
}

export function getAxisProfile(normalisedScores) {
  return MAIN_AXES.reduce((profile, key) => {
    profile[key] = normalisedScores[key];
    return profile;
  }, {});
}

export function hasCompleteVector(deity) {
  return deity.axis_vector
    && ALL_SCORE_KEYS.every((key) => typeof deity.axis_vector[key] === "number");
}

export function euclideanDistance(userProfile, deityVector) {
  const sumSquares = MAIN_AXES.reduce((sum, key) => {
    const difference = userProfile[key] - deityVector[key];
    return sum + (difference * difference);
  }, 0);

  return Math.sqrt(sumSquares);
}

export function rankDeityAnchors(axisProfile, responseIntensity, deityMap, options = {}) {
  const reactivityWeight = options.reactivityWeight ?? 0.25;

  return deityMap.deities
    .filter(hasCompleteVector)
    .map((deity) => {
      const baseDistance = euclideanDistance(axisProfile, deity.axis_vector);
      const reactivityDistance = Math.abs(
        responseIntensity - deity.axis_vector[MODIFIER_AXIS]
      );
      const finalScore = baseDistance + (reactivityDistance * reactivityWeight);

      return {
        deity,
        base_distance: roundNumber(baseDistance),
        reactivity_distance: roundNumber(reactivityDistance),
        final_score: roundNumber(finalScore)
      };
    })
    .sort((a, b) => a.final_score - b.final_score);
}

export function roundNumber(value) {
  return Math.round(value * 100) / 100;
}

export function getPrimaryCombination(axisProfile) {
  const sortedAxes = MAIN_AXES
    .map((axis) => ({ axis, value: axisProfile[axis] }))
    .sort((a, b) => b.value - a.value);

  const [first, second, third] = sortedAxes;
  const isMixed = third && Math.abs(second.value - third.value) <= 5;

  if (isMixed) {
    return "Mixed Field";
  }

  const pair = [first.axis, second.axis].sort().join("+");
  const combinationMap = {
    "care+self": "Self + Care",
    "justice+self": "Self + Justice",
    "care+social": "Social + Care",
    "justice+social": "Social + Justice",
    "self+social": "Mixed Field",
    "care+justice": "Mixed Field"
  };

  return combinationMap[pair] || "Mixed Field";
}

export function getReactivityBand(responseIntensity) {
  if (responseIntensity >= 67) return "high";
  if (responseIntensity >= 34) return "medium";
  return "low";
}

export function anchorSummary(match) {
  if (!match) return null;

  return {
    deity_id: match.deity.deity_id,
    name_ko: match.deity.name_ko,
    name_en: match.deity.name_en,
    bonpuri: match.deity.bonpuri
  };
}

export function buildResultText(primaryCombination, templates, rankedMatches, responseIntensity) {
  const template = templates.axis_combination_templates[primaryCombination]
    || templates.axis_combination_templates["Mixed Field"];
  const reactivityBand = getReactivityBand(responseIntensity);
  const reactivityText = templates.reactivity_language[reactivityBand];

  const primaryMatch = rankedMatches[0];
  const secondaryMatch = rankedMatches[1];
  const hasCloseSecondary = primaryMatch
    && secondaryMatch
    && Math.abs(primaryMatch.final_score - secondaryMatch.final_score) <= 8;

  let summary = template.summary;

  if (hasCloseSecondary) {
    summary = templates.mixed_anchor_sentence
      .replace("{primary}", primaryMatch.deity.name_en)
      .replace("{secondary}", secondaryMatch.deity.name_en)
      .replace("{primary_tone}", primaryMatch.deity.tone || "a nearby narrative field")
      .replace("{secondary_tone}", secondaryMatch.deity.tone || "a nearby narrative field");
  } else if (primaryMatch) {
    summary = `${summary} This profile sits near ${primaryMatch.deity.name_en} (${primaryMatch.deity.name_ko}) as a narrative placement, not a personality label.`;
  }

  return {
    summary,
    axis_explanation: reactivityText
      ? `${template.axis_explanation} ${reactivityText}`
      : template.axis_explanation,
    bonpuri_connection: primaryMatch && primaryMatch.deity.result_summary
      ? primaryMatch.deity.result_summary
      : template.bonpuri_connection,
    encounter_suggestions: primaryMatch && primaryMatch.deity.encounter_prompt
      ? primaryMatch.deity.encounter_prompt
      : template.encounter_suggestions
  };
}

export function getUnscoredAnchors(deityMap) {
  return deityMap.deities
    .filter((deity) => !hasCompleteVector(deity))
    .map((deity) => ({
      deity_id: deity.deity_id,
      name_ko: deity.name_ko,
      name_en: deity.name_en,
      bonpuri: deity.bonpuri,
      requires_manual_scoring: true
    }));
}

export function generateResult(answersByQuestionId, data) {
  const scored = scoreAnswers(data.questions, answersByQuestionId);
  const normalisedScores = normaliseScores(scored.rawScores, scored.maxScores);
  const axisProfile = getAxisProfile(normalisedScores);
  const responseIntensity = normalisedScores[MODIFIER_AXIS];
  const rankedMatches = rankDeityAnchors(
    axisProfile,
    responseIntensity,
    data.deityMap
  );
  const primaryCombination = getPrimaryCombination(axisProfile);
  const resultText = buildResultText(
    primaryCombination,
    data.templates,
    rankedMatches,
    responseIntensity
  );

  return {
    axis_profile: axisProfile,
    radar_graph_data: axisProfile,
    response_intensity: responseIntensity,
    response_intensity_band: getReactivityBand(responseIntensity),
    primary_combination: primaryCombination,
    primary_anchor: anchorSummary(rankedMatches[0]),
    secondary_anchors: rankedMatches.slice(1, 4).map(anchorSummary),
    deity_match_debug: rankedMatches.map((match) => ({
      deity_id: match.deity.deity_id,
      base_distance: match.base_distance,
      reactivity_distance: match.reactivity_distance,
      final_score: match.final_score
    })),
    unscored_anchors: getUnscoredAnchors(data.deityMap),
    result_text: resultText
  };
}
