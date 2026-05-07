import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import {
  generateResult,
  loadPrototypeData
} from "../src/bonpuriScoring.js";

const require = createRequire(import.meta.url);
const sampleProfiles = require("../data/sample_user_profiles.json");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const data = loadPrototypeData(rootDir);
const sampleId = process.argv[2] || "sample_self_justice";
const sample = sampleProfiles.samples.find((profile) => profile.id === sampleId);

if (!sample) {
  throw new Error(`Unknown sample profile: ${sampleId}`);
}

const result = generateResult(sample.answers, data);
console.log(JSON.stringify(result, null, 2));
