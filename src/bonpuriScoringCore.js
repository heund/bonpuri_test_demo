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
  shape: 0.40,
  rawAxes: 0.25,
  mainAxes: 0.25,
  subcategories: 0.25,
  modifiers: 0.10
};
export const SUBCATEGORY_NORMALISATION_SMOOTHING = 3;
export const MYTHIC_FIELDS = [
  {
    id: "ritual_pressure_order",
    label: "Ritual pressure and the formation of a new order",
    trigger_subcategories: [
      "ritual_responsibility",
      "calling_initiation",
      "origin_cost",
      "procedural_order",
      "rupture_harm_return",
      "restoration",
      "birth_arrival",
      "failed_arrival"
    ],
    description: "Your answers gather around figures whose stories involve a life, body, role, or passage being pushed out of an ordinary structure and needing to find another form."
  },
  {
    id: "origin_self_recognition",
    label: "Hidden origin and self-recognition",
    trigger_subcategories: [
      "source_origin",
      "self_recognition",
      "hidden_force",
      "restoration"
    ],
    description: "Your answers gather around figures whose stories involve recognising the hidden source of a life, choice, or direction before it is fully understood by others."
  },
  {
    id: "cultivation_becoming",
    label: "Cultivation and becoming",
    trigger_subcategories: [
      "becoming_cultivation",
      "self_recognition",
      "domestic_care",
      "restoration",
      "seasonal_cycle"
    ],
    description: "Your answers gather around figures whose stories involve learning, practice, timing, growth, and the conditions that allow something to become fully formed."
  },
  {
    id: "household_reception_sustaining",
    label: "Reception and sustaining life",
    trigger_subcategories: [
      "household_sustaining",
      "domestic_care",
      "reception_of_strange",
      "seasonal_cycle",
      "restoration"
    ],
    description: "Your answers gather around figures whose stories involve receiving, feeding, tending, and sustaining life inside a household, relationship, or community."
  },
  {
    id: "fragile_arrival_life_death",
    label: "Fragile arrival and life-death passage",
    trigger_subcategories: [
      "birth_arrival",
      "failed_arrival",
      "mourning_passage",
      "death_crossing",
      "hidden_force",
      "domestic_care"
    ],
    description: "Your answers gather around figures whose stories involve arrival, failed arrival, fragile passage, birth, death, and what must be held carefully at a threshold."
  },
  {
    id: "crooked_order_unresolved_wrong",
    label: "Crooked order and unresolved wrong",
    trigger_subcategories: [
      "crooked_order",
      "procedural_order",
      "rupture_harm_return",
      "hidden_force",
      "cosmic_law"
    ],
    description: "Your answers gather around figures whose stories involve wrong structures, distorted order, unaddressed harm, or a world that has settled around something unstable."
  },
  {
    id: "law_separation_cosmic_order",
    label: "Law, separation, and world-order",
    trigger_subcategories: [
      "cosmic_law",
      "procedural_order",
      "death_crossing",
      "restoration",
      "source_origin"
    ],
    description: "Your answers gather around figures whose stories involve law, separation, judgement, cosmic structure, and the placement of things into a larger order."
  }
];
export const DEITY_ANCHOR_METADATA = {
  chogong_three_brothers: {
    anchor_line: "Role transition and ritual responsibility.",
    longer_anchor_description: "A path of ordinary success is interrupted by ritual demand, forcing life into another structure."
  },
  daebyeolwang: {
    anchor_line: "Law, separation, and world-order.",
    longer_anchor_description: "A figure of clean order, separation, and the placement of worlds into their proper structure."
  },
  noga_danpung_agissi: {
    anchor_line: "Origin-cost and the body that carries a future structure.",
    longer_anchor_description: "A figure whose suffering and body become the ground from which a later ritual order can emerge."
  },
  yu_jeongseungs_daughter: {
    anchor_line: "Calling, initiation, and pressure into ritual role.",
    longer_anchor_description: "A figure moved out of ordinary life and into ritual function through pressure, illness, and transmission."
  },
  donghae_yonggungs_daughter: {
    anchor_line: "Failed birth-power and unsafe arrival.",
    longer_anchor_description: "A figure who can bring conception but cannot secure safe passage into life."
  },
  myeongjinguks_daughter: {
    anchor_line: "Safe arrival and the protection of life.",
    longer_anchor_description: "A figure who gives birth its proper passage and protects life as it enters the world."
  },
  yeosan_buin: {
    anchor_line: "Domestic care and the sustaining warmth of the household.",
    longer_anchor_description: "A figure of feeding, tending, household survival, and the everyday work that keeps life intact."
  },
  chilseong_agi: {
    anchor_line: "Receiving the strange force that becomes household wealth.",
    longer_anchor_description: "A rejected and feared force that becomes protection and abundance when properly received."
  },
  samani: {
    anchor_line: "Care for the neglected dead and protection through acknowledgement.",
    longer_anchor_description: "A figure who receives what others abandon and turns neglected death into protection and continuity."
  },
  gangnim: {
    anchor_line: "Procedure, death-crossing, and hidden cause.",
    longer_anchor_description: "A figure who crosses into the underworld to retrieve the missing order behind death."
  },
  sobyeolwang: {
    anchor_line: "Crooked order and the flawed structure of the living world.",
    longer_anchor_description: "A figure whose trickery explains why this world carries disorder, conflict, and imperfection."
  },
  gamunjangagi: {
    anchor_line: "Hidden fortune and self-recognition.",
    longer_anchor_description: "A figure who names the hidden source of her own life before others can recognise it."
  },
  hallakgungi: {
    anchor_line: "Return after harm and restoration through force.",
    longer_anchor_description: "A figure who returns after violence with the power to destroy, revive, and restore."
  },
  jijang_agissi: {
    anchor_line: "Mourning, passage, and ritual care for the dead.",
    longer_anchor_description: "A figure who lives through repeated loss and turns grief into passage for the dead."
  },
  wongang_ami: {
    anchor_line: "Dignity under oppression and the cost that calls return.",
    longer_anchor_description: "A figure whose suffering becomes the moral ground for return, judgement, and restoration."
  },
  daebyeolsang_manura: {
    anchor_line: "Disease-power and dangerous force brought into order.",
    longer_anchor_description: "A figure of illness, threat, and the force that must be negotiated into a workable place."
  },
  nokdisaengi: {
    anchor_line: "Household rupture and the recovery of relational order.",
    longer_anchor_description: "A figure tied to broken family structure, detection, and the restoration of household order."
  },
  cheonjiwang: {
    anchor_line: "Cosmic beginning and the first ordering of the world.",
    longer_anchor_description: "A figure of origin, descent, and the conditions that allow cosmic order to begin."
  }
};
export const SUBCATEGORY_REASON_LABELS = {
  source_origin: "hidden origin",
  self_recognition: "self-recognition",
  becoming_cultivation: "cultivation / becoming",
  reception_of_strange: "reception of the unfamiliar",
  household_sustaining: "sustaining shared life",
  birth_arrival: "arrival into life",
  failed_arrival: "failed or unsafe arrival",
  rupture_harm_return: "rupture and return",
  mourning_passage: "mourning / passage",
  procedural_order: "procedure / hidden sequence",
  cosmic_law: "cosmic law",
  crooked_order: "crooked order",
  calling_initiation: "calling / initiation",
  origin_cost: "origin-cost",
  seasonal_cycle: "seasonal timing",
  hidden_force: "hidden force",
  restoration: "restoration",
  domestic_care: "domestic care",
  ritual_responsibility: "ritual responsibility",
  death_crossing: "death crossing"
};
export const SHARED_ANCHOR_FAMILIES = [
  {
    id: "self_origin_reformation",
    keys: [
      "source_origin",
      "self_recognition",
      "becoming_cultivation",
      "calling_initiation",
      "ritual_responsibility",
      "rupture_harm_return",
      "restoration",
      "origin_cost"
    ],
    label: "Hidden origin and the life that has to change form",
    description: "These anchors sit close because they involve a life being pulled away from its expected shape. Some figures name a hidden source, some search for origin through encounter, some enter ritual responsibility, and some return after harm to restore what was broken."
  },
  {
    id: "care_arrival_loss",
    keys: [
      "household_sustaining",
      "domestic_care",
      "seasonal_cycle",
      "reception_of_strange",
      "mourning_passage",
      "birth_arrival",
      "failed_arrival",
      "origin_cost",
      "hidden_force"
    ],
    label: "Care at the edge of arrival and loss",
    description: "These anchors sit close because they involve something fragile that must be received, tended, or acknowledged before life can continue. A force arrives, a household must be sustained, a neglected presence must be acknowledged, a birth becomes dangerous, or a body carries the cost of what comes after."
  },
  {
    id: "ritual_pressure_order",
    keys: [
      "ritual_responsibility",
      "calling_initiation",
      "origin_cost",
      "procedural_order",
      "rupture_harm_return",
      "restoration",
      "birth_arrival",
      "failed_arrival"
    ],
    label: "Ritual pressure and the formation of a new order",
    description: "These anchors sit close because they involve a life, body, role, or passage being pushed out of an ordinary structure and needing to find another form."
  },
  {
    id: "origin_self_recognition",
    keys: [
      "source_origin",
      "self_recognition",
      "hidden_force",
      "restoration",
      "becoming_cultivation"
    ],
    label: "Hidden origin and self-recognition",
    description: "These anchors sit close because they involve recognising the hidden source of a life, choice, or direction before it is fully understood by others."
  },
  {
    id: "cultivation_becoming",
    keys: [
      "becoming_cultivation",
      "self_recognition",
      "domestic_care",
      "restoration",
      "seasonal_cycle",
      "birth_arrival"
    ],
    label: "Cultivation and becoming",
    description: "These anchors sit close because they involve learning, practice, timing, growth, and the conditions that allow something to become fully formed."
  },
  {
    id: "crooked_order_unresolved_wrong",
    keys: [
      "crooked_order",
      "procedural_order",
      "rupture_harm_return",
      "hidden_force",
      "cosmic_law",
      "restoration"
    ],
    label: "Crooked order and unresolved wrong",
    description: "These anchors sit close because they involve wrong structures, distorted order, unaddressed harm, or a world that has settled around something unstable."
  },
  {
    id: "law_separation_cosmic_order",
    keys: [
      "cosmic_law",
      "procedural_order",
      "death_crossing",
      "restoration",
      "source_origin"
    ],
    label: "Law, separation, and world-order",
    description: "These anchors sit close because they involve law, separation, judgement, cosmic structure, and the placement of things into a larger order."
  }
];

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
      : Math.round(
        (Number(rawScores[key] || 0) / (maxScores[key] + SUBCATEGORY_NORMALISATION_SMOOTHING)) * 100
      );
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

function scoreVector(scores) {
  return MATCH_SCORE_KEYS.map((key) => Number(scores?.[key] || 0));
}

function meanCenteredCosineSimilarity(userScores, deityScores) {
  const userVector = scoreVector(userScores);
  const deityVector = scoreVector(deityScores);
  const userMean = average(userVector);
  const deityMean = average(deityVector);
  const centeredUser = userVector.map((value) => value - userMean);
  const centeredDeity = deityVector.map((value) => value - deityMean);
  let dotProduct = 0;
  let userMagnitude = 0;
  let deityMagnitude = 0;

  for (let index = 0; index < centeredUser.length; index += 1) {
    dotProduct += centeredUser[index] * centeredDeity[index];
    userMagnitude += centeredUser[index] * centeredUser[index];
    deityMagnitude += centeredDeity[index] * centeredDeity[index];
  }

  if (!userMagnitude || !deityMagnitude) return 0.5;

  return Math.max(
    0,
    Math.min(1, ((dotProduct / (Math.sqrt(userMagnitude) * Math.sqrt(deityMagnitude))) + 1) / 2)
  );
}

function rankedScoreKeys(scores) {
  return MATCH_SCORE_KEYS
    .map((key, index) => ({ key, value: Number(scores?.[key] || 0), index }))
    .sort((a, b) => b.value - a.value || a.index - b.index)
    .map((entry) => entry.key);
}

function rankOrderSimilarity(userScores, deityScores) {
  const userRanked = rankedScoreKeys(userScores);
  const deityRanked = rankedScoreKeys(deityScores);
  const deityPositions = Object.fromEntries(deityRanked.map((key, index) => [key, index]));
  const maxDistance = MATCH_SCORE_KEYS.length * (MATCH_SCORE_KEYS.length - 1);
  const distance = userRanked.reduce((sum, key, index) => (
    sum + Math.abs(index - deityPositions[key])
  ), 0);

  return Math.max(0, 1 - (distance / maxDistance));
}

function setOverlapSimilarity(userScores, deityScores, count, fromEnd = false) {
  const userRanked = rankedScoreKeys(userScores);
  const deityRanked = rankedScoreKeys(deityScores);
  const userSet = new Set((fromEnd ? userRanked.slice(-count) : userRanked.slice(0, count)));
  const deitySet = new Set((fromEnd ? deityRanked.slice(-count) : deityRanked.slice(0, count)));
  const overlapCount = [...userSet].filter((key) => deitySet.has(key)).length;

  return overlapCount / count;
}

function dominantFieldSimilarity(userScores, deityScores) {
  const fieldValues = (scores) => ({
    lens: Math.max(Number(scores?.self || 0), Number(scores?.social || 0)),
    orientation: Math.max(Number(scores?.care || 0), Number(scores?.order || 0)),
    modifier: Math.max(
      Number(scores?.[MODIFIER_AXIS] || 0),
      Number(scores?.[AGENCY_AXIS] || 0)
    )
  });
  const strongestField = (scores) => Object.entries(fieldValues(scores))
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  return strongestField(userScores) === strongestField(deityScores) ? 1 : 0;
}

export function calculateShapeSimilarity(userScores, deityScores) {
  const centeredCosine = meanCenteredCosineSimilarity(userScores, deityScores);
  const rankSimilarity = rankOrderSimilarity(userScores, deityScores);
  const topOverlap = setOverlapSimilarity(userScores, deityScores, 3);
  const lowOverlap = setOverlapSimilarity(userScores, deityScores, 2, true);
  const dominantSimilarity = dominantFieldSimilarity(userScores, deityScores);

  return Math.max(0, Math.min(1, (
    (centeredCosine * 0.45)
    + (rankSimilarity * 0.25)
    + (topOverlap * 0.15)
    + (lowOverlap * 0.10)
    + (dominantSimilarity * 0.05)
  )));
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
      const userMatchScores = {
        ...axisProfile,
        [MODIFIER_AXIS]: responseIntensity,
        [AGENCY_AXIS]: agency
      };
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
      const shapeSimilarity = calculateShapeSimilarity(userMatchScores, deity.axis_vector);
      const rawAxisWeight = matchWeights.rawAxes ?? matchWeights.mainAxes ?? 0;
      const totalSimilarity = (shapeSimilarity * (matchWeights.shape ?? 0))
        + (mainSimilarity * rawAxisWeight)
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
        shape_similarity: roundNumber(shapeSimilarity),
        raw_axis_similarity: roundNumber(mainSimilarity),
        main_axis_similarity: roundNumber(mainSimilarity),
        subcategory_similarity: roundNumber(subcategorySimilarity),
        modifier_similarity: roundNumber(modifiersSimilarity),
        total_similarity: roundNumber(totalSimilarity),
        similarity_breakdown: {
          shape_similarity: roundNumber(shapeSimilarity),
          raw_axis_similarity: roundNumber(mainSimilarity),
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
  const isMixed = third && Math.abs(first.value - third.value) <= 5;

  if (isMixed) {
    return "Mixed Field";
  }

  const lens = axisProfile.self >= axisProfile.social ? "self" : "social";
  const orientation = axisProfile.care >= axisProfile.order ? "care" : "order";
  const pair = [lens, orientation].sort().join("+");
  const combinationMap = {
    "care+self": "Self + Care",
    "order+self": "Self + Order",
    "care+social": "Social + Care",
    "order+social": "Social + Order",
  };

  return combinationMap[pair] || "Mixed Field";
}

export function getRecognitionPattern(axisProfile) {
  const lensKey = axisProfile.self >= axisProfile.social ? "self" : "social";
  const orientationKey = axisProfile.order >= axisProfile.care ? "order" : "care";
  const labels = {
    self: "Self",
    social: "Social",
    care: "Care",
    order: "Order"
  };

  return {
    lens: labels[lensKey],
    orientation: labels[orientationKey],
    label: `${labels[lensKey]} + ${labels[orientationKey]}`,
    lens_axis: lensKey,
    orientation_axis: orientationKey
  };
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
    shape_similarity: match.shape_similarity,
    raw_axis_similarity: match.raw_axis_similarity,
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

export function subcategoryReasonLabel(key) {
  return SUBCATEGORY_REASON_LABELS[key] || key.replaceAll("_", " ");
}

export function getMatchReasons(userSubcategoryProfile, deitySubcategoryProfile, limit = 3) {
  const deitySubcategories = deitySubcategoryProfile?.subcategories || {};
  const overlappingReasons = Object.keys(deitySubcategories)
    .map((key) => ({
      key,
      label: subcategoryReasonLabel(key),
      score: Number(userSubcategoryProfile?.[key] || 0) * Number(deitySubcategories[key] || 0),
      user_score: Number(userSubcategoryProfile?.[key] || 0),
      deity_score: Number(deitySubcategories[key] || 0)
    }))
    .filter((reason) => reason.score > 0)
    .sort((a, b) => b.score - a.score || b.deity_score - a.deity_score)
    .slice(0, limit)
    .map((reason) => reason.label);

  if (overlappingReasons.length > 0) {
    return overlappingReasons;
  }

  return Object.entries(deitySubcategories)
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
    .slice(0, limit)
    .map(([key]) => subcategoryReasonLabel(key));
}

export function formatTopMatch(match, userSubcategoryProfile = {}) {
  const matchReasons = getMatchReasons(userSubcategoryProfile, match.deity_subcategory_profile);

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
    match_reasons: matchReasons,
    hinge: match.deity_subcategory_profile?.hinge || "",
    close_neighbours: match.deity_subcategory_profile?.close_neighbours || []
  };
}

export function formatTopDeityMatch(match, userSubcategoryProfile = {}) {
  const metadata = DEITY_ANCHOR_METADATA[match.deity.deity_id] || {};

  return {
    id: match.deity.deity_id,
    display_name: match.deity.name_en || match.deity.name_ko || match.deity.deity_id,
    korean_name: match.deity.name_ko,
    bonpuri: match.deity.bonpuri,
    match_percent: match.match_percentage ?? matchPercentage(match.final_score),
    anchor_line: metadata.anchor_line || match.deity.result_summary || "",
    longer_anchor_description: metadata.longer_anchor_description || match.deity.encounter_prompt || "",
    final_score: match.final_score,
    match_reasons: getMatchReasons(userSubcategoryProfile, match.deity_subcategory_profile),
    field_connection_line: "",
    shape_similarity: match.shape_similarity,
    raw_axis_similarity: match.raw_axis_similarity,
    deity_subcategories: match.deity_subcategory_profile?.subcategories || {}
  };
}

export function getSharedAnchorLogic(userSubcategoryProfile, rankedMatches) {
  const topMatches = rankedMatches.slice(0, 5);
  const familyScores = scoreSharedAnchorFamilies(userSubcategoryProfile, topMatches);
  const primaryFamily = familyScores[0] || null;
  const secondaryFamily = familyScores[1]
    && primaryFamily
    && primaryFamily.score > 0
    && ((primaryFamily.score - familyScores[1].score) / primaryFamily.score) <= 0.1
    ? familyScores[1]
    : null;
  const winningKeys = primaryFamily ? primaryFamily.keys : [];
  const dominantSubcategories = getDominantSharedSubcategories(
    userSubcategoryProfile,
    topMatches,
    winningKeys
  );
  const deityConnections = topMatches.map((match) => getDeityConnection(
    match,
    userSubcategoryProfile,
    winningKeys
  ));

  if (!primaryFamily) {
    return summarizeSharedAnchorLogic([], [], []);
  }

  return {
    id: primaryFamily.id,
    family_id: primaryFamily.id,
    label: primaryFamily.label,
    description: primaryFamily.description,
    score: primaryFamily.score,
    confidence: primaryFamily.score,
    family_scores: familyScores.map((family) => ({
      id: family.id,
      label: family.label,
      score: family.score,
      user_family_score: family.user_family_score,
      deity_family_score: family.deity_family_score,
      overlap_score: family.overlap_score
    })),
    dominant_families: [primaryFamily.id],
    secondary_shared_anchor_logic: secondaryFamily
      ? {
        id: secondaryFamily.id,
        family_id: secondaryFamily.id,
        label: secondaryFamily.label,
        description: secondaryFamily.description,
        score: secondaryFamily.score
      }
      : null,
    dominant_subcategories: dominantSubcategories,
    deity_connections: deityConnections
  };
}

export function scoreSharedAnchorFamilies(userSubcategoryProfile, topMatches) {
  return SHARED_ANCHOR_FAMILIES
    .map((family) => {
      const userFamilyScore = family.keys.reduce(
        (sum, key) => sum + Number(userSubcategoryProfile?.[key] || 0),
        0
      );
      const deityFamilyScore = topMatches.reduce((matchSum, match) => {
        const deityWeight = (match.match_percentage ?? 0) / 100;
        const deitySubcategories = match.deity_subcategory_profile?.subcategories || {};
        const deityFamilyTotal = family.keys.reduce(
          (sum, key) => sum + Number(deitySubcategories[key] || 0),
          0
        );

        return matchSum + (deityWeight * deityFamilyTotal);
      }, 0);
      const overlapScore = family.keys.reduce((sum, key) => {
        const userScore = Number(userSubcategoryProfile?.[key] || 0);
        if (userScore <= 0) return sum;

        const deityMatches = topMatches
          .map((match) => Number(match.deity_subcategory_profile?.subcategories?.[key] || 0))
          .filter((value) => value > 0);

        if (!deityMatches.length) return sum;

        return sum + (userScore * average(deityMatches));
      }, 0);
      const score = (userFamilyScore * 0.35)
        + (deityFamilyScore * 0.25)
        + (overlapScore * 0.40);

      return {
        id: family.id,
        keys: family.keys,
        label: family.label,
        description: family.description,
        score: roundNumber(score),
        user_family_score: roundNumber(userFamilyScore),
        deity_family_score: roundNumber(deityFamilyScore),
        overlap_score: roundNumber(overlapScore)
      };
    })
    .filter((family) => family.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function getDominantSharedSubcategories(userSubcategoryProfile, topMatches, familyKeys) {
  return familyKeys
    .map((key) => {
      const userScore = Number(userSubcategoryProfile?.[key] || 0);
      const deityWeights = topMatches
        .map((match) => Number(match.deity_subcategory_profile?.subcategories?.[key] || 0))
        .filter((value) => value > 0);

      if (userScore <= 0 || !deityWeights.length) return null;

      return {
        key,
        label: subcategoryReasonLabel(key),
        score: roundNumber(userScore * average(deityWeights))
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);
}

export function summarizeSharedAnchorLogic(dominantSubcategories) {
  const topLabels = dominantSubcategories.slice(0, 3).map((subcategory) => subcategory.label);
  const label = topLabels.length
    ? `Shared field: ${formatList(topLabels)}`
    : "Shared field: nearby narrative anchors";
  const description = topLabels.length
    ? `These anchors sit close because they share overlapping signals in ${formatList(topLabels)}.`
    : "These anchors sit close through the stable deity matching logic, but this result does not have a strong shared subcategory field.";

  return {
    id: "shared_field_fallback",
    label,
    description,
    score: roundNumber(dominantSubcategories.reduce((sum, subcategory) => sum + subcategory.score, 0))
  };
}

export function getDeityConnection(match, userSubcategoryProfile, familyKeys) {
  const metadata = DEITY_ANCHOR_METADATA[match.deity.deity_id] || {};
  const familyKeySet = new Set(familyKeys);
  const deitySubcategories = match.deity_subcategory_profile?.subcategories || {};
  const contributingSubcategories = Object.keys(deitySubcategories)
    .filter((key) => familyKeySet.has(key))
    .sort((a, b) => (
      (
        (Math.max(1, Number(userSubcategoryProfile?.[b] || 0)))
        * Number(deitySubcategories[b] || 0)
      )
      - (
        (Math.max(1, Number(userSubcategoryProfile?.[a] || 0)))
        * Number(deitySubcategories[a] || 0)
      )
    ));
  const labels = contributingSubcategories.map(subcategoryReasonLabel);
  const fieldConnectionLine = labels.length
    ? `${metadata.anchor_line || match.deity.name_en} This anchor connects through ${formatList(labels.slice(0, 3))}.`
    : metadata.longer_anchor_description || metadata.anchor_line || "";

  return {
    deity_id: match.deity.deity_id,
    display_name: match.deity.name_en || match.deity.name_ko || match.deity.deity_id,
    anchor_line: metadata.anchor_line || match.deity.result_summary || "",
    field_connection_line: fieldConnectionLine,
    contributing_subcategories: contributingSubcategories
  };
}

export function buildAnchorRelationMap(sharedAnchorLogic) {
  const logic = sharedAnchorLogic || {};
  const deityConnections = logic.deity_connections || [];
  const centerNode = {
    id: logic.id || "shared_field",
    type: "shared_field",
    label: logic.label || "Shared field"
  };
  const deityNodes = deityConnections.map((connection) => ({
    id: connection.deity_id,
    type: "deity",
    label: connection.display_name,
    anchor_line: connection.anchor_line
  }));
  const fieldEdges = deityConnections.map((connection) => ({
    source: centerNode.id,
    target: connection.deity_id,
    labels: (connection.contributing_subcategories || []).map(subcategoryReasonLabel)
  }));
  const deityEdges = [];

  for (let sourceIndex = 0; sourceIndex < deityConnections.length; sourceIndex += 1) {
    for (let targetIndex = sourceIndex + 1; targetIndex < deityConnections.length; targetIndex += 1) {
      const source = deityConnections[sourceIndex];
      const target = deityConnections[targetIndex];
      const sourceSubcategories = source.contributing_subcategories || [];
      const targetSubcategories = target.contributing_subcategories || [];
      const sharedKeys = sourceSubcategories.filter((key) => (
        targetSubcategories.includes(key)
      ));

      if (sharedKeys.length >= 2) {
        deityEdges.push({
          source: source.deity_id,
          target: target.deity_id,
          labels: sharedKeys.map(subcategoryReasonLabel)
        });
      }
    }
  }

  return {
    center_node: centerNode,
    deity_nodes: deityNodes,
    field_edges: fieldEdges,
    deity_edges: deityEdges
  };
}

export function getSimilarityDecomposition(
  rankedMatches,
  axisProfile,
  responseIntensity,
  agency,
  userSubcategoryProfile
) {
  const userScores = {
    ...axisProfile,
    [MODIFIER_AXIS]: responseIntensity,
    [AGENCY_AXIS]: agency
  };
  const topMatches = rankedMatches.slice(0, 5);
  const decomposedMatches = topMatches.map((match) => {
    const contributionBreakdown = getContributionBreakdown(match);
    const mainDrivers = getMainSimilarityDrivers(contributionBreakdown);
    const axisOverlap = getAxisOverlap(userScores, match.deity.axis_vector);
    const subcategoryOverlap = getSubcategoryOverlap(
      userSubcategoryProfile,
      match.deity_subcategory_profile?.subcategories || {}
    );
    const modifierOverlap = getModifierOverlap(userScores, match.deity.axis_vector);

    return {
      deity_id: match.deity.deity_id,
      display_name: match.deity.name_en || match.deity.name_ko || match.deity.deity_id,
      korean_name: match.deity.name_ko,
      match_percent: match.match_percentage,
      shape_similarity: match.shape_similarity,
      axis_similarity: match.main_axis_similarity,
      raw_axis_similarity: match.raw_axis_similarity,
      subcategory_similarity: match.subcategory_similarity,
      modifier_similarity: match.modifier_similarity,
      main_drivers: mainDrivers,
      axis_overlap: axisOverlap,
      subcategory_overlap: subcategoryOverlap,
      modifier_overlap: modifierOverlap,
      contribution_breakdown: contributionBreakdown,
      deity_subcategories: match.deity_subcategory_profile?.subcategories || {}
    };
  });

  return {
    top_matches: decomposedMatches,
    graph_nodes: buildSimilarityGraphNodes(decomposedMatches),
    graph_edges: buildSimilarityGraphEdges(decomposedMatches)
  };
}

function getContributionBreakdown(match) {
  const weights = match.similarity_breakdown?.weights || SUBCATEGORY_MATCH_WEIGHTS;
  const rawAxisWeight = weights.rawAxes ?? weights.mainAxes ?? 0;

  return {
    shape: roundNumber((match.shape_similarity || 0) * (weights.shape || 0)),
    raw_axis: roundNumber(match.main_axis_similarity * rawAxisWeight),
    subcategory: roundNumber(match.subcategory_similarity * weights.subcategories),
    modifier: roundNumber(match.modifier_similarity * weights.modifiers)
  };
}

function getMainSimilarityDrivers(contributionBreakdown) {
  const total = Object.values(contributionBreakdown).reduce((sum, value) => sum + value, 0);
  const ranked = Object.entries(contributionBreakdown)
    .map(([key, value]) => ({
      key,
      value,
      share: total === 0 ? 0 : value / total
    }))
    .sort((a, b) => b.value - a.value);

  return ranked
    .filter((driver, index) => index < 2 || driver.share >= 0.18)
    .filter((driver) => driver.value > 0)
    .map((driver) => driver.key);
}

function getAxisOverlap(userScores, deityVector) {
  return MAIN_AXES
    .map((key) => {
      const userScore = Number(userScores[key] || 0);
      const deityScore = Number(deityVector[key] || 0);
      const distance = Math.abs(userScore - deityScore);

      return {
        key,
        label: scoreKeyLabel(key),
        user_score: userScore,
        deity_score: deityScore,
        distance: roundNumber(distance),
        contribution_label: contributionLabelForDistance(distance)
      };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4);
}

function getSubcategoryOverlap(userSubcategoryProfile, deitySubcategories) {
  return Object.entries(deitySubcategories)
    .map(([key, deityWeight]) => {
      const userScore = Number(userSubcategoryProfile?.[key] || 0);

      return {
        key,
        label: subcategoryReasonLabel(key),
        user_score: userScore,
        deity_weight: Number(deityWeight || 0),
        overlap_score: roundNumber(userScore * Number(deityWeight || 0))
      };
    })
    .filter((overlap) => overlap.user_score > 0 && overlap.deity_weight > 0)
    .sort((a, b) => b.overlap_score - a.overlap_score)
    .slice(0, 4);
}

function getModifierOverlap(userScores, deityVector) {
  return [MODIFIER_AXIS, AGENCY_AXIS].map((key) => {
    const userScore = Number(userScores[key] || 0);
    const deityScore = Number(deityVector[key] || 0);

    return {
      key,
      label: scoreKeyLabel(key),
      user_score: userScore,
      deity_score: deityScore,
      distance: roundNumber(Math.abs(userScore - deityScore))
    };
  });
}

function buildSimilarityGraphNodes(decomposedMatches) {
  return [
    {
      id: "user_result",
      type: "user",
      label: "User Result"
    },
    {
      id: "axis_similarity",
      type: "similarity_layer",
      label: "Axis similarity"
    },
    {
      id: "subcategory_similarity",
      type: "similarity_layer",
      label: "Subcategory similarity"
    },
    {
      id: "modifier_fit",
      type: "similarity_layer",
      label: "Modifier fit"
    },
    ...decomposedMatches.map((match) => ({
      id: match.deity_id,
      type: "deity",
      label: match.display_name,
      match_percent: match.match_percent
    }))
  ];
}

function buildSimilarityGraphEdges(decomposedMatches) {
  const edges = [
    {
      source: "user_result",
      target: "axis_similarity",
      label: "axis scores"
    },
    {
      source: "user_result",
      target: "subcategory_similarity",
      label: "subcategory overlap"
    },
    {
      source: "user_result",
      target: "modifier_fit",
      label: "response + action"
    }
  ];

  for (const match of decomposedMatches) {
    const total = Object.values(match.contribution_breakdown).reduce((sum, value) => sum + value, 0);
    const edgeSpecs = [
      {
        driver: "shape",
        source: "axis_similarity",
        labels: match.axis_overlap.map((overlap) => overlap.label)
      },
      {
        driver: "raw_axis",
        source: "axis_similarity",
        labels: match.axis_overlap.map((overlap) => overlap.label)
      },
      {
        driver: "subcategory",
        source: "subcategory_similarity",
        labels: match.subcategory_overlap.map((overlap) => overlap.label)
      },
      {
        driver: "modifier",
        source: "modifier_fit",
        labels: modifierFitLabels(match.modifier_overlap)
      }
    ];

    for (const spec of edgeSpecs) {
      const value = match.contribution_breakdown[spec.driver];
      const share = total === 0 ? 0 : value / total;
      const isMeaningful = match.main_drivers.includes(spec.driver)
        || (spec.driver === "modifier" && value >= 0.06)
        || (spec.driver === "subcategory" && value >= 0.03)
        || (spec.driver === "shape" && value >= 0.15)
        || (spec.driver === "raw_axis" && value >= 0.15);

      if (!isMeaningful || spec.labels.length === 0) continue;

      edges.push({
        source: spec.source,
        target: match.deity_id,
        layer: spec.driver,
        strength: contributionStrength(share),
        label: spec.labels.slice(0, 3).join(", ")
      });
    }
  }

  return edges;
}

function modifierFitLabels(modifierOverlap) {
  return modifierOverlap
    .filter((overlap) => overlap.distance <= 25)
    .sort((a, b) => a.distance - b.distance)
    .map((overlap) => `${overlap.label} fit`);
}

function contributionStrength(share) {
  if (share >= 0.45) return "strong";
  if (share >= 0.2) return "medium";
  return "weak";
}

function contributionLabelForDistance(distance) {
  if (distance <= 10) return "strong";
  if (distance <= 25) return "medium";
  if (distance <= 40) return "weak";
  return "distant";
}

function scoreKeyLabel(key) {
  const labels = {
    self: "Self",
    social: "Social",
    care: "Care",
    order: "Order",
    response_intensity: "Response Intensity",
    agency: "Action Pull"
  };

  return labels[key] || key;
}

function formatList(items) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getMythicField(userSubcategoryProfile, rankedMatches) {
  const topMatches = rankedMatches.slice(0, 5);
  const scoredFields = MYTHIC_FIELDS.map((field) => {
    const triggers = field.trigger_subcategories;
    const userOverlap = triggers.length === 0
      ? 0
      : triggers.reduce((sum, key) => sum + Number(userSubcategoryProfile?.[key] || 0), 0) / triggers.length;
    const top5DeityOverlap = topMatches.length === 0 || triggers.length === 0
      ? 0
      : topMatches.reduce((matchSum, match) => {
        const deitySubcategories = match.deity_subcategory_profile?.subcategories || {};
        const triggerTotal = triggers.reduce(
          (sum, key) => sum + Number(deitySubcategories[key] || 0),
          0
        );
        return matchSum + ((triggerTotal / (triggers.length * 3)) * 100);
      }, 0) / topMatches.length;
    const score = (userOverlap * 0.6) + (top5DeityOverlap * 0.4);

    return {
      id: field.id,
      label: field.label,
      description: field.description,
      trigger_subcategories: triggers,
      score: roundNumber(score),
      user_overlap: roundNumber(userOverlap),
      top5_deity_overlap: roundNumber(top5DeityOverlap)
    };
  }).sort((a, b) => b.score - a.score);

  const [primaryField, secondaryField] = scoredFields;
  const isCloseSecondary = secondaryField && (primaryField.score - secondaryField.score) <= 10;

  return {
    ...primaryField,
    secondary_field: isCloseSecondary ? secondaryField : null,
    field_scores: scoredFields
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
  const recognitionPattern = getRecognitionPattern(axisProfile);
  const mythicField = getMythicField(normalisedSubcategoryScores, rankedMatches);
  const sharedAnchorLogic = getSharedAnchorLogic(normalisedSubcategoryScores, rankedMatches);
  const anchorRelationMap = buildAnchorRelationMap(sharedAnchorLogic);
  const similarityDecomposition = getSimilarityDecomposition(
    rankedMatches,
    axisProfile,
    responseIntensity,
    agency,
    normalisedSubcategoryScores
  );
  const nearbyNarrativeAnchors = rankedMatches
    .slice(0, 5)
    .map((match) => {
      const formatted = formatTopDeityMatch(match, normalisedSubcategoryScores);
      const connection = (sharedAnchorLogic.deity_connections || []).find((candidate) => (
        candidate.deity_id === formatted.id
      ));

      return {
        ...formatted,
        field_connection_line: connection?.field_connection_line || formatted.longer_anchor_description
      };
    });
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
    recognition_pattern: recognitionPattern,
    mythic_field: mythicField,
    shared_anchor_logic: sharedAnchorLogic,
    primary_anchor: anchorSummary(rankedMatches[0]),
    secondary_anchors: rankedMatches.slice(1, 4).map(anchorSummary),
    top_matches: rankedMatches.slice(0, 5).map((match) => formatTopMatch(match, normalisedSubcategoryScores)),
    nearby_narrative_anchors: nearbyNarrativeAnchors,
    top_deity_matches: nearbyNarrativeAnchors,
    anchor_relation_map: anchorRelationMap,
    similarity_decomposition: similarityDecomposition,
    match_reason: explainMatchWin(rankedMatches[0], rankedMatches.slice(1, 5)),
    deity_match_debug: rankedMatches.map((match) => ({
      deity_id: match.deity.deity_id,
      base_distance: match.base_distance,
      reactivity_distance: match.reactivity_distance,
      affective_reactivity_distance: match.affective_reactivity_distance,
      agency_distance: match.agency_distance,
      axis_modifier_distance: match.axis_modifier_distance,
      main_axis_similarity: match.main_axis_similarity,
      shape_similarity: match.shape_similarity,
      raw_axis_similarity: match.raw_axis_similarity,
      subcategory_similarity: match.subcategory_similarity,
      modifier_similarity: match.modifier_similarity,
      total_similarity: match.total_similarity,
      match_percentage: match.match_percentage,
      final_score: match.final_score,
      deity_subcategories: match.deity_subcategory_profile?.subcategories || {}
    })),
    diagnostic_scores: {
      ...axisProfile,
      [MODIFIER_AXIS]: responseIntensity,
      [AGENCY_AXIS]: agency
    },
    diagnostic_subcategories: normalisedSubcategoryScores,
    unscored_anchors: getUnscoredAnchors(data.deityMap),
    result_text: resultText
  };
}
