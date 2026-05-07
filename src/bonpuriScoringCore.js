export const MAIN_AXES = ["self", "social", "care", "order"];
export const MODIFIER_AXIS = "response_intensity";
export const AGENCY_AXIS = "agency";
export const ALL_SCORE_KEYS = [...MAIN_AXES, MODIFIER_AXIS, AGENCY_AXIS];
export const MATCH_SCORE_KEYS = [...MAIN_AXES, MODIFIER_AXIS, AGENCY_AXIS];
export const DEFAULT_MATCH_WEIGHTS = {
  responseIntensity: 0.25,
  agency: 0.2
};

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
    && MATCH_SCORE_KEYS.every((key) => typeof deity.axis_vector[key] === "number");
}

export function euclideanDistance(userProfile, deityVector) {
  const sumSquares = MAIN_AXES.reduce((sum, key) => {
    const difference = userProfile[key] - deityVector[key];
    return sum + (difference * difference);
  }, 0);

  return Math.sqrt(sumSquares);
}

export function rankDeityAnchors(axisProfile, responseIntensity, agency, deityMap, options = {}) {
  const reactivityWeight = options.reactivityWeight ?? DEFAULT_MATCH_WEIGHTS.responseIntensity;
  const agencyWeight = options.agencyWeight ?? DEFAULT_MATCH_WEIGHTS.agency;

  return deityMap.deities
    .filter(hasCompleteVector)
    .map((deity) => {
      const baseDistance = euclideanDistance(axisProfile, deity.axis_vector);
      const reactivityDistance = Math.abs(
        responseIntensity - deity.axis_vector[MODIFIER_AXIS]
      );
      const agencyDistance = Math.abs(agency - deity.axis_vector[AGENCY_AXIS]);
      const finalScore = baseDistance
        + (reactivityDistance * reactivityWeight)
        + (agencyDistance * agencyWeight);

      return {
        deity,
        base_distance: roundNumber(baseDistance),
        reactivity_distance: roundNumber(reactivityDistance),
        affective_reactivity_distance: roundNumber(reactivityDistance),
        agency_distance: roundNumber(agencyDistance),
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
    "order+self": "Self + Order",
    "care+social": "Social + Care",
    "order+social": "Social + Order",
    "self+social": "Mixed Field",
    "care+order": "Mixed Field"
  };

  return combinationMap[pair] || "Mixed Field";
}

export function getReactivityBand(responseIntensity) {
  if (responseIntensity >= 67) return "high";
  if (responseIntensity >= 34) return "medium";
  return "low";
}

export function getAgencyBand(agency) {
  if (agency >= 81) {
    return {
      id: "intervening_transformative",
      label: "Intervening / transformative",
      description: "The participant tends to act quickly, name directly, push for change, or make something concrete."
    };
  }

  if (agency >= 61) {
    return {
      id: "shaping_active",
      label: "Shaping / active",
      description: "The participant tends to clarify, support, structure, repair, or move something forward."
    };
  }

  if (agency >= 31) {
    return {
      id: "processing_responsive",
      label: "Processing / responsive",
      description: "The participant tends to keep working with the signal internally or relationally until the next step becomes clearer."
    };
  }

  return {
    id: "observing_receptive",
    label: "Observing / receptive",
    description: "The participant tends to notice, wait, watch, or stay with something before acting."
  };
}

export function anchorSummary(match) {
  if (!match) return null;

  return {
    deity_id: match.deity.deity_id,
    name_ko: match.deity.name_ko,
    name_en: match.deity.name_en,
    bonpuri: match.deity.bonpuri,
    match_percentage: matchPercentage(match.final_score),
    final_score: match.final_score,
    base_distance: match.base_distance,
    affective_reactivity_distance: match.affective_reactivity_distance,
    agency_distance: match.agency_distance
  };
}

function maxPossibleDistance() {
  const mainAxisMax = Math.sqrt(MAIN_AXES.length * (100 ** 2));
  const responseModifierMax = 100 * DEFAULT_MATCH_WEIGHTS.responseIntensity;
  const agencyModifierMax = 100 * DEFAULT_MATCH_WEIGHTS.agency;
  return mainAxisMax + responseModifierMax + agencyModifierMax;
}

export function matchPercentage(finalDistance) {
  const percentage = 100 * (1 - (finalDistance / maxPossibleDistance()));
  return Math.max(0, Math.round(percentage));
}

export function formatTopMatch(match) {
  return {
    deity_id: match.deity.deity_id,
    name_ko: match.deity.name_ko,
    name_en: match.deity.name_en,
    bonpuri: match.deity.bonpuri,
    match_percentage: matchPercentage(match.final_score),
    final_score: match.final_score,
    base_distance: match.base_distance,
    affective_reactivity_distance: match.affective_reactivity_distance,
    agency_distance: match.agency_distance
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
  const agency = normalisedScores[AGENCY_AXIS];
  const rankedMatches = rankDeityAnchors(
    axisProfile,
    responseIntensity,
    agency,
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
    affective_reactivity: responseIntensity,
    response_intensity: responseIntensity,
    response_intensity_band: getReactivityBand(responseIntensity),
    agency,
    action_pull: agency,
    action_pull_band: getAgencyBand(agency),
    primary_combination: primaryCombination,
    primary_anchor: anchorSummary(rankedMatches[0]),
    secondary_anchors: rankedMatches.slice(1, 4).map(anchorSummary),
    top_matches: rankedMatches.slice(0, 5).map(formatTopMatch),
    deity_match_debug: rankedMatches.map((match) => ({
      deity_id: match.deity.deity_id,
      base_distance: match.base_distance,
      reactivity_distance: match.reactivity_distance,
      affective_reactivity_distance: match.affective_reactivity_distance,
      agency_distance: match.agency_distance,
      final_score: match.final_score
    })),
    unscored_anchors: getUnscoredAnchors(data.deityMap),
    result_text: resultText
  };
}
