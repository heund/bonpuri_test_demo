export const MAIN_AXES = ["self", "social", "care", "order"];
export const MODIFIER_AXIS = "response_intensity";
export const AGENCY_AXIS = "agency";
export const ALL_SCORE_KEYS = [...MAIN_AXES, MODIFIER_AXIS, AGENCY_AXIS];
export const MATCH_SCORE_KEYS = [...MAIN_AXES, MODIFIER_AXIS, AGENCY_AXIS];
export const DEFAULT_MATCH_WEIGHTS = {
  responseIntensity: 0.25,
  agency: 0.2
};
export const SUBCATEGORY_MATCH_WEIGHTS = {
  mainAxes: 0.65,
  subcategories: 0.25,
  modifiers: 0.10
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

export function getSubcategoryKeys(subcategoryDefinitions) {
  return subcategoryDefinitions?.subcategories?.map((subcategory) => subcategory.key) || [];
}

export function emptySubcategoryScores(subcategoryKeys = []) {
  return subcategoryKeys.reduce((scores, key) => {
    scores[key] = 0;
    return scores;
  }, {});
}

export function getMaxPossibleSubcategoryScores(questionsData, subcategoryKeys = []) {
  const maxScores = emptySubcategoryScores(subcategoryKeys);

  for (const question of questionsData.questions) {
    for (const key of subcategoryKeys) {
      const questionMax = Math.max(
        0,
        ...question.options.map((option) => Number(option.subcategories?.[key] || 0))
      );
      maxScores[key] += questionMax;
    }
  }

  return maxScores;
}

export function scoreAnswers(questionsData, answersByQuestionId, subcategoryDefinitions = null) {
  const rawScores = emptyScores();
  const subcategoryKeys = getSubcategoryKeys(subcategoryDefinitions);
  const rawSubcategoryScores = emptySubcategoryScores(subcategoryKeys);
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
      option_id: option.id,
      subcategories: option.subcategories || {}
    });

    for (const key of ALL_SCORE_KEYS) {
      rawScores[key] += Number(option.scores[key] || 0);
    }

    for (const key of subcategoryKeys) {
      rawSubcategoryScores[key] += Number(option.subcategories?.[key] || 0);
    }
  }

  return {
    rawScores,
    maxScores: getMaxPossibleScores(questionsData),
    rawSubcategoryScores,
    maxSubcategoryScores: getMaxPossibleSubcategoryScores(questionsData, subcategoryKeys),
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

export function normaliseSubcategoryScores(rawScores, maxScores, subcategoryKeys = Object.keys(rawScores)) {
  const normalised = {};

  for (const key of subcategoryKeys) {
    normalised[key] = maxScores[key] === 0
      ? 0
      : Math.round((Number(rawScores[key] || 0) / maxScores[key]) * 100);
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

export function getDeitySubcategoryProfile(deity, deitySubcategoryProfiles) {
  return deitySubcategoryProfiles?.profiles?.find((profile) => profile.id === deity.deity_id) || null;
}

export function cosineSimilarity(userVector, deityVector, keys) {
  let dotProduct = 0;
  let userMagnitude = 0;
  let deityMagnitude = 0;

  for (const key of keys) {
    const userValue = Number(userVector?.[key] || 0);
    const deityValue = Number(deityVector?.[key] || 0);
    dotProduct += userValue * deityValue;
    userMagnitude += userValue * userValue;
    deityMagnitude += deityValue * deityValue;
  }

  if (!userMagnitude || !deityMagnitude) {
    return 0;
  }

  return dotProduct / (Math.sqrt(userMagnitude) * Math.sqrt(deityMagnitude));
}

export function mainAxisSimilarity(baseDistance) {
  const maxDistance = Math.sqrt(MAIN_AXES.length * (100 ** 2));
  return Math.max(0, 1 - (baseDistance / maxDistance));
}

export function modifierSimilarity(reactivityDistance, agencyDistance, reactivityWeight, agencyWeight) {
  const weightedDistance = (reactivityDistance * reactivityWeight) + (agencyDistance * agencyWeight);
  const maxDistance = (100 * reactivityWeight) + (100 * agencyWeight);
  return maxDistance === 0 ? 1 : Math.max(0, 1 - (weightedDistance / maxDistance));
}

export function rankDeityAnchors(
  axisProfile,
  responseIntensity,
  agency,
  deityMap,
  options = {}
) {
  const reactivityWeight = options.reactivityWeight ?? DEFAULT_MATCH_WEIGHTS.responseIntensity;
  const agencyWeight = options.agencyWeight ?? DEFAULT_MATCH_WEIGHTS.agency;
  const subcategoryProfile = options.subcategoryProfile || {};
  const subcategoryKeys = options.subcategoryKeys || Object.keys(subcategoryProfile);
  const deitySubcategoryProfiles = options.deitySubcategoryProfiles || null;
  const matchWeights = options.matchWeights || SUBCATEGORY_MATCH_WEIGHTS;

  return deityMap.deities
    .filter(hasCompleteVector)
    .map((deity) => {
      const deitySubcategoryProfile = getDeitySubcategoryProfile(deity, deitySubcategoryProfiles);
      const baseDistance = euclideanDistance(axisProfile, deity.axis_vector);
      const reactivityDistance = Math.abs(
        responseIntensity - deity.axis_vector[MODIFIER_AXIS]
      );
      const agencyDistance = Math.abs(agency - deity.axis_vector[AGENCY_AXIS]);
      const axisModifierDistance = baseDistance
        + (reactivityDistance * reactivityWeight)
        + (agencyDistance * agencyWeight);
      const mainSimilarity = mainAxisSimilarity(baseDistance);
      const subcategorySimilarity = cosineSimilarity(
        subcategoryProfile,
        deitySubcategoryProfile?.subcategories || {},
        subcategoryKeys
      );
      const modifiersSimilarity = modifierSimilarity(
        reactivityDistance,
        agencyDistance,
        reactivityWeight,
        agencyWeight
      );
      const totalSimilarity = (mainSimilarity * matchWeights.mainAxes)
        + (subcategorySimilarity * matchWeights.subcategories)
        + (modifiersSimilarity * matchWeights.modifiers);
      const finalScore = (1 - totalSimilarity) * 100;

      return {
        deity,
        deity_subcategory_profile: deitySubcategoryProfile,
        base_distance: roundNumber(baseDistance),
        reactivity_distance: roundNumber(reactivityDistance),
        affective_reactivity_distance: roundNumber(reactivityDistance),
        agency_distance: roundNumber(agencyDistance),
        axis_modifier_distance: roundNumber(axisModifierDistance),
        main_axis_similarity: roundNumber(mainSimilarity),
        subcategory_similarity: roundNumber(subcategorySimilarity),
        modifier_similarity: roundNumber(modifiersSimilarity),
        total_similarity: roundNumber(totalSimilarity),
        similarity_breakdown: {
          main_axis_similarity: roundNumber(mainSimilarity),
          subcategory_similarity: roundNumber(subcategorySimilarity),
          modifier_similarity: roundNumber(modifiersSimilarity),
          weights: matchWeights
        },
        final_score: roundNumber(finalScore),
        match_percentage: Math.max(0, Math.round(totalSimilarity * 100))
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
    match_percentage: match.match_percentage ?? matchPercentage(match.final_score),
    final_score: match.final_score,
    base_distance: match.base_distance,
    affective_reactivity_distance: match.affective_reactivity_distance,
    agency_distance: match.agency_distance,
    similarity_breakdown: match.similarity_breakdown
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
    match_percentage: match.match_percentage ?? matchPercentage(match.final_score),
    final_score: match.final_score,
    base_distance: match.base_distance,
    affective_reactivity_distance: match.affective_reactivity_distance,
    agency_distance: match.agency_distance,
    axis_modifier_distance: match.axis_modifier_distance,
    similarity_breakdown: match.similarity_breakdown,
    deity_subcategories: match.deity_subcategory_profile?.subcategories || {},
    hinge: match.deity_subcategory_profile?.hinge || "",
    close_neighbours: match.deity_subcategory_profile?.close_neighbours || []
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

export function explainMatchWin(primaryMatch, closeMatches) {
  if (!primaryMatch || !closeMatches.length) {
    return "No close neighbour comparison available.";
  }

  const explanations = closeMatches.map((match) => {
    const mainDelta = roundNumber(primaryMatch.main_axis_similarity - match.main_axis_similarity);
    const subcategoryDelta = roundNumber(primaryMatch.subcategory_similarity - match.subcategory_similarity);
    const modifierDelta = roundNumber(primaryMatch.modifier_similarity - match.modifier_similarity);
    const strongest = [
      { key: "main axes", value: mainDelta },
      { key: "subcategories", value: subcategoryDelta },
      { key: "modifiers", value: modifierDelta }
    ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0];

    const direction = strongest.value >= 0 ? "led" : "trailed";
    return `${primaryMatch.deity.name_en} ${direction} ${match.deity.name_en} most on ${strongest.key} (${strongest.value}).`;
  });

  return explanations.join(" ");
}

export function generateResult(answersByQuestionId, data) {
  const subcategoryKeys = getSubcategoryKeys(data.subcategoryDefinitions);
  const scored = scoreAnswers(data.questions, answersByQuestionId, data.subcategoryDefinitions);
  const normalisedScores = normaliseScores(scored.rawScores, scored.maxScores);
  const normalisedSubcategoryScores = normaliseSubcategoryScores(
    scored.rawSubcategoryScores,
    scored.maxSubcategoryScores,
    subcategoryKeys
  );
  const axisProfile = getAxisProfile(normalisedScores);
  const responseIntensity = normalisedScores[MODIFIER_AXIS];
  const agency = normalisedScores[AGENCY_AXIS];
  const rankedMatches = rankDeityAnchors(
    axisProfile,
    responseIntensity,
    agency,
    data.deityMap,
    {
      subcategoryProfile: normalisedSubcategoryScores,
      subcategoryKeys,
      deitySubcategoryProfiles: data.deitySubcategoryProfiles
    }
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
    subcategory_scores: scored.rawSubcategoryScores,
    subcategory_profile: normalisedSubcategoryScores,
    primary_combination: primaryCombination,
    primary_anchor: anchorSummary(rankedMatches[0]),
    secondary_anchors: rankedMatches.slice(1, 4).map(anchorSummary),
    top_matches: rankedMatches.slice(0, 5).map(formatTopMatch),
    match_reason: explainMatchWin(rankedMatches[0], rankedMatches.slice(1, 5)),
    deity_match_debug: rankedMatches.map((match) => ({
      deity_id: match.deity.deity_id,
      base_distance: match.base_distance,
      reactivity_distance: match.reactivity_distance,
      affective_reactivity_distance: match.affective_reactivity_distance,
      agency_distance: match.agency_distance,
      axis_modifier_distance: match.axis_modifier_distance,
      main_axis_similarity: match.main_axis_similarity,
      subcategory_similarity: match.subcategory_similarity,
      modifier_similarity: match.modifier_similarity,
      total_similarity: match.total_similarity,
      match_percentage: match.match_percentage,
      final_score: match.final_score,
      deity_subcategories: match.deity_subcategory_profile?.subcategories || {}
    })),
    unscored_anchors: getUnscoredAnchors(data.deityMap),
    result_text: resultText
  };
}
