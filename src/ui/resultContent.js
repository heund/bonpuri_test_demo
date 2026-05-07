import combinationMarkdown from "../../Combination_results.md?raw";
import categoryMarkdown from "../../Category_results.md?raw";
import deityMarkdown from "../../Deity_results.md?raw";

const COMBINATION_HEADINGS = [
  "Self + Care",
  "Social + Care",
  "Self + Order",
  "Social + Order",
  "SELF + CARE",
  "SOCIAL + CARE",
  "SELF + ORDER",
  "SOCIAL + ORDER"
];

const COMBINATION_KEYS = {
  "Self + Care": "Self + Care",
  "Self + Order": "Self + Order",
  "Social + Care": "Social + Care",
  "Social + Order": "Social + Order"
};

const DEITY_HEADINGS = {
  gamunjangagi: "Gameunjang-agi",
  oneuri: "Oneuri",
  jacheongbi: "Jacheongbi",
  hallakgungi: "Hallakgungi",
  chogong_three_brothers: "The Three Chogong Brothers",
  yu_jeongseungs_daughter: "Yu Jeongseung’s Daughter",
  myeongjinguks_daughter: "Myeongjinguk’s Daughter / Samseung Halmang",
  samseung_halmang: "Myeongjinguk’s Daughter / Samseung Halmang",
  donghae_yonggungs_daughter: "Daughter of the East Sea Dragon Palace / Jeoseung Halmang",
  jeoseung_halmang: "Daughter of the East Sea Dragon Palace / Jeoseung Halmang",
  yeosan_buin: "Yeosan Buin",
  nokdisaengi: "Nokdisaengi",
  chilseong_agi: "Chilseong-agi",
  samani: "Samani",
  yeongdeung_halmang: "Yeongdeung Halmang",
  wongang_ami: "Wongang Ami",
  noga_danpung_agissi: "Noga-danpung-agissi",
  gangnim: "Gangnim",
  jijang_agissi: "Jijang-agissi",
  sobyeolwang: "Sobyeolwang",
  daebyeolwang: "Daebyeolwang",
  daebyeolsang_manura: "Daebyeolsang Manura"
};

const AXIS_LABELS = {
  self: "Self",
  social: "Social",
  care: "Care",
  order: "Order"
};

const PAIR_LABELS = {
  "care+self": "Self + Care",
  "order+self": "Self + Order",
  "care+social": "Social + Care",
  "order+social": "Social + Order"
};

function normalizeLineEndings(text) {
  return text.replace(/\r\n/g, "\n").trim();
}

function parseSectionBlock(block) {
  const lines = normalizeLineEndings(block)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    title: lines[0] || "",
    paragraphs: lines.slice(1)
  };
}

function parseCombinationSections(markdown) {
  const text = normalizeLineEndings(markdown);
  const sections = {};

  for (let index = 0; index < COMBINATION_HEADINGS.length; index += 1) {
    const heading = COMBINATION_HEADINGS[index];
    const start = text.toLowerCase().indexOf(heading.toLowerCase());

    if (start < 0 || sections[heading]) continue;

    const laterHeadings = COMBINATION_HEADINGS
      .map((candidate) => text.toLowerCase().indexOf(candidate.toLowerCase(), start + heading.length))
      .filter((candidateStart) => candidateStart > start);
    const end = laterHeadings.length ? Math.min(...laterHeadings) : text.length;

    sections[heading] = parseSectionBlock(text.slice(start, end));
  }

  return sections;
}

function normalizeHeading(title) {
  return title
    .replace(/^\d+\.\s*/, "")
    .replace(/^Main\s+(Lens|Orientation):\s*/i, "")
    .trim()
    .toLowerCase();
}

function parseNumberedSections(markdown) {
  const text = normalizeLineEndings(markdown);
  const matches = [...text.matchAll(/(?:^|\n)(\d+\.\s+[^\n]+)/g)];

  return matches.map((match, index) => {
    const start = match.index + (match[0].startsWith("\n") ? 1 : 0);
    const nextMatch = matches[index + 1];
    const end = nextMatch ? nextMatch.index : text.length;
    return parseSectionBlock(text.slice(start, end));
  });
}

function parseCategorySections(markdown) {
  const [englishText = "", koreanText = ""] = normalizeLineEndings(markdown).split(/\n\s*Korean\s*\n/i);
  const englishSections = parseNumberedSections(englishText.replace(/^English\s*/i, ""));
  const koreanSections = parseNumberedSections(koreanText);
  const axisOrder = ["self", "social", "care", "order"];
  const sections = { en: {}, kr: {} };

  for (const section of englishSections) {
    const key = normalizeHeading(section.title);
    if (axisOrder.includes(key)) {
      sections.en[key] = section;
    }
  }

  koreanSections.slice(0, axisOrder.length).forEach((section, index) => {
    sections.kr[axisOrder[index]] = section;
  });

  return sections;
}

function parseDeitySections(markdown) {
  const blocks = normalizeLineEndings(markdown)
    .split(/_{10,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return Object.fromEntries(blocks.map((block) => {
    const parsed = cleanDeityOpening(parseSectionBlock(block));
    return [parsed.title, parsed];
  }));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanDeityOpening(section) {
  if (!section.paragraphs[0]) return section;

  let opening = section.paragraphs[0];
  const titlePattern = escapeRegExp(section.title);

  opening = opening.replace(new RegExp(`^${titlePattern}\\s*\\([^)]*\\)\\s*`), "");
  opening = opening.replace(/^(.+?) carries this pattern\./, "This anchor carries this pattern.");

  return {
    ...section,
    paragraphs: [opening, ...section.paragraphs.slice(1)]
  };
}

export const combinationSections = parseCombinationSections(combinationMarkdown);
export const categorySections = parseCategorySections(categoryMarkdown);
export const deitySections = parseDeitySections(deityMarkdown);

export function getCombinationSection(primaryCombination) {
  const key = COMBINATION_KEYS[primaryCombination];
  if (!key) return null;

  return combinationSections[key]
    || combinationSections[key.toUpperCase()]
    || null;
}

export function getCategorySection(axis, language = "en") {
  return categorySections[language]?.[axis] || categorySections.en[axis] || null;
}

export function getDeitySection(deityId) {
  const heading = DEITY_HEADINGS[deityId];
  return heading ? deitySections[heading] : null;
}

function pairForAxes(axisA, axisB) {
  return PAIR_LABELS[[axisA, axisB].sort().join("+")];
}

export function buildOtherHighScoresLine(axisProfile, primaryCombination) {
  const sortedAxes = Object.entries(axisProfile)
    .sort((a, b) => b[1] - a[1])
    .map(([axis, value]) => ({ axis, value, label: AXIS_LABELS[axis] }));

  const highAxes = sortedAxes.filter((item) => item.value >= 55);
  const strongest = sortedAxes[0];
  const alternatives = [];

  for (const axis of highAxes) {
    if (axis.axis === strongest.axis) continue;
    const pair = pairForAxes(strongest.axis, axis.axis);
    if (pair && pair !== primaryCombination && !alternatives.includes(pair)) {
      alternatives.push(pair);
    }
  }

  if (alternatives.length === 0) {
    const secondaryAxes = sortedAxes.slice(1, 3).filter((axis) => axis.value >= 45);
    for (const axis of secondaryAxes) {
      const pair = pairForAxes(strongest.axis, axis.axis);
      if (pair && pair !== primaryCombination && !alternatives.includes(pair)) {
        alternatives.push(pair);
      }
    }
  }

  const otherScores = sortedAxes
    .filter((axis) => axis.value >= 55 && !primaryCombination.includes(axis.label))
    .map((axis) => `${axis.label} ${axis.value}%`);

  if (alternatives.length === 0 && otherScores.length === 0) {
    return "";
  }

  const scoreText = otherScores.length
    ? `Other high scores: ${otherScores.join(", ")}.`
    : `Your next strongest score is ${sortedAxes[1].label} ${sortedAxes[1].value}%.`;
  const visitText = alternatives.length
    ? `You may also want to visit ${alternatives.slice(0, 2).join(" and ")}.`
    : "";

  return [scoreText, visitText].filter(Boolean).join(" ");
}
