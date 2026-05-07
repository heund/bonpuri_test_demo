import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  MAIN_AXES,
  MODIFIER_AXIS,
  AGENCY_AXIS,
  scoreAnswers,
  normaliseScores,
  rankDeityAnchors,
  matchPercentage,
  getPrimaryCombination,
  generateResult as generateResultFromData
} from "./bonpuriScoringCore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function loadPrototypeData(rootDir = path.resolve(__dirname, "..")) {
  return {
    axisDefinitions: loadJson(path.join(rootDir, "data", "axis_definitions.json")),
    questions: loadJson(path.join(rootDir, "data", "test_questions_seed.json")),
    deityMap: loadJson(path.join(rootDir, "data", "deity_axis_map.json")),
    subcategoryDefinitions: loadJson(path.join(rootDir, "data", "subcategory_definitions.json")),
    deitySubcategoryProfiles: loadJson(path.join(rootDir, "data", "deity_subcategory_profiles.json")),
    templates: loadJson(path.join(rootDir, "data", "result_templates.json"))
  };
}

export function generateResult(answersByQuestionId, data = loadPrototypeData()) {
  return generateResultFromData(answersByQuestionId, data);
}

export {
  MAIN_AXES,
  MODIFIER_AXIS,
  AGENCY_AXIS,
  scoreAnswers,
  normaliseScores,
  rankDeityAnchors,
  matchPercentage,
  getPrimaryCombination
};
