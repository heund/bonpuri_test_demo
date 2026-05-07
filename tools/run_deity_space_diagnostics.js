import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  getPrimaryCombination,
  matchPercentage,
  rankDeityAnchors
} from "../src/bonpuriScoringCore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "outputs", "deity_space");

const SCORE_KEYS = ["self", "social", "care", "order", "response_intensity", "agency"];
const MAIN_AXES = ["self", "social", "care", "order"];
const DEFAULT_SAMPLES = 250000;
const DEFAULT_SEED = 20260508;

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    samples: DEFAULT_SAMPLES,
    seed: DEFAULT_SEED
  };

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--samples") {
      parsed.samples = Number(args[index + 1]);
      index += 1;
    } else if (args[index] === "--seed") {
      parsed.seed = Number(args[index + 1]);
      index += 1;
    }
  }

  if (!Number.isInteger(parsed.samples) || parsed.samples <= 0) {
    throw new Error("--samples must be a positive integer");
  }

  if (!Number.isInteger(parsed.seed)) {
    throw new Error("--seed must be an integer");
  }

  return parsed;
}

function loadJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), "utf8"));
}

function createRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function getMaxScores(questionsData) {
  const maxScores = Object.fromEntries(SCORE_KEYS.map((key) => [key, 0]));

  for (const question of questionsData.questions) {
    for (const key of SCORE_KEYS) {
      maxScores[key] += Math.max(
        ...question.options.map((option) => Number(option.scores[key] || 0))
      );
    }
  }

  return maxScores;
}

function getSubcategoryKeys(subcategoryDefinitions) {
  return subcategoryDefinitions.subcategories.map((subcategory) => subcategory.key);
}

function getMaxSubcategoryScores(questionsData, subcategoryKeys) {
  const maxScores = Object.fromEntries(subcategoryKeys.map((key) => [key, 0]));

  for (const question of questionsData.questions) {
    for (const key of subcategoryKeys) {
      maxScores[key] += Math.max(
        0,
        ...question.options.map((option) => Number(option.subcategories?.[key] || 0))
      );
    }
  }

  return maxScores;
}

function randomAnswerProfile(questionsData, maxScores, maxSubcategoryScores, subcategoryKeys, random) {
  const rawScores = Object.fromEntries(SCORE_KEYS.map((key) => [key, 0]));
  const rawSubcategoryScores = Object.fromEntries(subcategoryKeys.map((key) => [key, 0]));
  const selectedOptions = [];

  for (const question of questionsData.questions) {
    const option = question.options[Math.floor(random() * question.options.length)];
    selectedOptions.push(option.id);
    for (const key of SCORE_KEYS) {
      rawScores[key] += Number(option.scores[key] || 0);
    }
    for (const key of subcategoryKeys) {
      rawSubcategoryScores[key] += Number(option.subcategories?.[key] || 0);
    }
  }

  const profile = {};
  for (const key of SCORE_KEYS) {
    profile[key] = maxScores[key] === 0
      ? 0
      : Math.round((rawScores[key] / maxScores[key]) * 100);
  }
  const subcategoryProfile = {};
  for (const key of subcategoryKeys) {
    subcategoryProfile[key] = maxSubcategoryScores[key] === 0
      ? 0
      : Math.round((rawSubcategoryScores[key] / maxSubcategoryScores[key]) * 100);
  }

  return {
    selectedOptions,
    profile,
    subcategoryProfile
  };
}

function axisProfile(profile) {
  return MAIN_AXES.reduce((result, axis) => {
    result[axis] = profile[axis];
    return result;
  }, {});
}

function emptyDeityMap(deities, value) {
  return Object.fromEntries(deities.map((deity) => [deity.deity_id, value]));
}

function formatMatch(match, rank) {
  return {
    rank,
    deity_id: match.deity.deity_id,
    name_ko: match.deity.name_ko,
    name_en: match.deity.name_en,
    bonpuri: match.deity.bonpuri,
    match_percentage: match.match_percentage ?? matchPercentage(match.final_score),
    final_score: match.final_score,
    base_distance: match.base_distance,
    response_intensity_distance: match.affective_reactivity_distance,
    agency_distance: match.agency_distance,
    similarity_breakdown: match.similarity_breakdown
  };
}

function runDiagnostics({ samples, seed }) {
  const questionsData = loadJson("data/test_questions_seed.json");
  const deityMap = loadJson("data/deity_axis_map.json");
  const subcategoryDefinitions = loadJson("data/subcategory_definitions.json");
  const deitySubcategoryProfiles = loadJson("data/deity_subcategory_profiles.json");
  const subcategoryKeys = getSubcategoryKeys(subcategoryDefinitions);
  const maxScores = getMaxScores(questionsData);
  const maxSubcategoryScores = getMaxSubcategoryScores(questionsData, subcategoryKeys);
  const deities = deityMap.deities;
  const random = createRandom(seed);

  const primaryCounts = emptyDeityMap(deities, 0);
  const top5Counts = emptyDeityMap(deities, 0);
  const bestRankByDeity = emptyDeityMap(deities, null);
  const bestScoreByDeity = emptyDeityMap(deities, null);
  const bestProfileByDeity = emptyDeityMap(deities, null);
  const bestTopMatchesByDeity = emptyDeityMap(deities, null);
  const primaryCombinationCounts = {};

  for (let sampleIndex = 0; sampleIndex < samples; sampleIndex += 1) {
    const { profile, subcategoryProfile } = randomAnswerProfile(
      questionsData,
      maxScores,
      maxSubcategoryScores,
      subcategoryKeys,
      random
    );
    const rankedMatches = rankDeityAnchors(
      axisProfile(profile),
      profile.response_intensity,
      profile.agency,
      deityMap,
      {
        subcategoryProfile,
        subcategoryKeys,
        deitySubcategoryProfiles
      }
    );
    const primaryCombination = getPrimaryCombination(axisProfile(profile));
    primaryCombinationCounts[primaryCombination] = (primaryCombinationCounts[primaryCombination] || 0) + 1;

    const primary = rankedMatches[0];
    primaryCounts[primary.deity.deity_id] += 1;

    rankedMatches.slice(0, 5).forEach((match) => {
      top5Counts[match.deity.deity_id] += 1;
    });

    rankedMatches.forEach((match, index) => {
      const deityId = match.deity.deity_id;
      const rank = index + 1;
      const currentBestScore = bestScoreByDeity[deityId];
      const isBetter = currentBestScore === null
        || match.final_score < currentBestScore
        || (match.final_score === currentBestScore && rank < bestRankByDeity[deityId]);

      if (isBetter) {
        bestRankByDeity[deityId] = rank;
        bestScoreByDeity[deityId] = match.final_score;
        bestProfileByDeity[deityId] = {
          axis_profile: profile,
          subcategory_profile: subcategoryProfile
        };
        bestTopMatchesByDeity[deityId] = rankedMatches.slice(0, 10).map(formatMatch);
      }
    });
  }

  const primaryPercentages = {};
  const top5Percentages = {};
  const perDeity = deities.map((deity) => {
    const deityId = deity.deity_id;
    primaryPercentages[deityId] = percentage(primaryCounts[deityId], samples);
    top5Percentages[deityId] = percentage(top5Counts[deityId], samples);

    return {
      deity_id: deityId,
      name_ko: deity.name_ko,
      name_en: deity.name_en,
      bonpuri: deity.bonpuri,
      observed_primary_count: primaryCounts[deityId],
      observed_primary_percentage: primaryPercentages[deityId],
      observed_top5_count: top5Counts[deityId],
      observed_top5_percentage: top5Percentages[deityId],
      best_observed_rank: bestRankByDeity[deityId],
      best_observed_final_score: bestScoreByDeity[deityId],
      best_observed_profile: bestProfileByDeity[deityId],
      best_observed_top_matches: bestTopMatchesByDeity[deityId],
      appeared_as_primary: primaryCounts[deityId] > 0,
      appeared_in_top5: top5Counts[deityId] > 0,
      not_observed_in_scan: top5Counts[deityId] === 0
    };
  });

  return {
    sample_size: samples,
    seed,
    timestamp: new Date().toISOString(),
    note: "Estimated from sampled answer paths, not exact full enumeration. The full answer space is too large for exact enumeration in this diagnostics tool.",
    axes: {
      main_axes: MAIN_AXES,
      modifiers: ["response_intensity", "agency"]
    },
    modifier_weights: {
      response_intensity: 0.25,
      agency: 0.20
    },
    max_scores: maxScores,
    max_subcategory_scores: maxSubcategoryScores,
    subcategory_keys: subcategoryKeys,
    primary_combination_counts: primaryCombinationCounts,
    primary_counts: primaryCounts,
    primary_percentages: primaryPercentages,
    top5_counts: top5Counts,
    top5_percentages: top5Percentages,
    best_rank_by_deity: bestRankByDeity,
    best_score_by_deity: bestScoreByDeity,
    impossible_or_not_observed_top5: deities
      .filter((deity) => top5Counts[deity.deity_id] === 0)
      .map((deity) => deity.deity_id),
    impossible_or_not_observed_primary: deities
      .filter((deity) => primaryCounts[deity.deity_id] === 0)
      .map((deity) => deity.deity_id),
    per_deity: perDeity
  };
}

function percentage(count, total) {
  return Math.round((count / total) * 1000000) / 10000;
}

function main() {
  const args = parseArgs();
  fs.mkdirSync(outputDir, { recursive: true });
  const diagnostics = runDiagnostics(args);
  const outputPath = path.join(outputDir, "deity_coverage_diagnostics.json");
  fs.writeFileSync(outputPath, JSON.stringify(diagnostics, null, 2), "utf8");

  console.log("Generated sampled deity coverage diagnostics.");
  console.log(`Samples: ${diagnostics.sample_size}`);
  console.log(`Seed: ${diagnostics.seed}`);
  console.log(`Output: ${outputPath}`);
  console.log(diagnostics.note);
}

main();
