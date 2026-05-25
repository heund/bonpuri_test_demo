import combinationContent from "./combination_content.json";
import deityContent from "./deity_content.json";
import deityContentKo from "./deity_content_ko.json";
import lensContent from "./lens_content.json";
import lensContentKo from "./lens_content_ko.json";
import orientationContent from "./orientation_content.json";
import resultShells from "./result_shells.json";

const shells = resultShells.result_shells;

function fillTemplate(template = "", values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value ?? ""),
    template
  );
}

function combinationShell(language = "en") {
  return language === "ko"
    ? shells.combination_ko || shells.combination
    : shells.combination;
}

function axisSource(type, language = "en") {
  if (type === "lens" && language === "ko") return lensContentKo;
  return type === "lens" ? lensContent : orientationContent;
}

function combinationPairId(axis1, axis2) {
  const lens = [axis1, axis2].find((axis) => axis?.type === "lens");
  const orientation = [axis1, axis2].find((axis) => axis?.type === "orientation");
  return lens && orientation ? `${lens.id}_${orientation.id}` : "";
}

function findAxisContent(axis, language = "en") {
  if (!axis) return null;
  const content = axisSource(axis.type, language).items.find((entry) => entry.id === axis.id);
  return content ? { ...content, type: axis.type } : null;
}

function renderAxisSegments(content) {
  if (!content) return [];
  const values = { label: content.label };
  const axisType = content.type === "lens" ? "Lens" : "Orientation";

  return [
    {
      marker: `{${content.label} ${axisType}.primary_mode.text}`,
      text: fillTemplate(content.primary_mode.text, values)
    },
    ...content.aspects.flatMap((aspect) => [
      {
        marker: `{${content.label} ${axisType}.${aspect.id}.attention}`,
        text: fillTemplate(aspect.attention, values)
      },
      {
        marker: `{${content.label} ${axisType}.${aspect.id}.strength}`,
        text: fillTemplate(aspect.strength, values)
      },
      {
        marker: `{${content.label} ${axisType}.${aspect.id}.friction}`,
        text: fillTemplate(aspect.friction, values)
      }
    ]),
    {
      marker: `{${content.label} ${axisType}.core_question}`,
      text: fillTemplate(content.core_question, values)
    }
  ];
}

function getCombinationBridge(combination, axis, position, language = "en") {
  if (language === "ko" && axis.type === "lens" && axis.bridge) {
    return axis.bridge;
  }

  const shell = combinationShell(language);

  if (combination.type === "lens_orientation" && axis.type === "lens") {
    return fillTemplate(shell.lens_bridge_template, { label: axis.label });
  }

  if (combination.type === "lens_orientation" && axis.type === "orientation") {
    return fillTemplate(shell.orientation_bridge_template, { label: axis.label });
  }

  return "";
}

function combinationId(label = "") {
  return label.toLowerCase().replaceAll(" + ", "_").replaceAll(" ", "_");
}

function axisDisplayLabel(axis, language = "en") {
  if (!axis) return "";
  if (language === "ko") {
    const koreanAxisLabels = {
      self: "ᄆᆞᆷ속",
      social: "궨당",
      care: "거념",
      order: "가리"
    };
    const axisTypeLabel = axis.type === "lens" ? "기준" : "감각";
    return `${axisTypeLabel}: ${koreanAxisLabels[axis.id] || axis.label}`;
  }
  return `${axis.label} ${axis.type === "lens" ? "Lens" : "Orientation"}`;
}

function combinationDisplayLabel(combination, axis1, axis2, language = "en") {
  if (!axis1 || !axis2) return combination.label;
  if (language === "ko") {
    return `${axisDisplayLabel(axis1, language)} + ${axisDisplayLabel(axis2, language)}`;
  }
  return `${axisDisplayLabel(axis1, language)} with ${axisDisplayLabel(axis2, language)}`;
}

function combinationAxisTemplateValues(axis1, axis2) {
  const lens = [axis1, axis2].find((axis) => axis?.type === "lens");
  const lensShortDescription = (
    lens?.short_definition || "following several signals at once"
  ).replace(/\s+first$/i, "");

  return {
    lens: lens?.label || axis1?.label || "",
    "lens short definition": lensShortDescription,
    lens_short_description: lensShortDescription,
    orientation: [axis1, axis2].find((axis) => axis?.type === "orientation")?.label
      || axis2?.label
      || ""
  };
}

function buildKoreanPatternSections(shell, axis1, axis2) {
  const lens = [axis1, axis2].find((axis) => axis?.type === "lens");
  const orientation = [axis1, axis2].find((axis) => axis?.type === "orientation");
  const lensPattern = lens ? shell.pattern_lens?.[lens.id] : null;
  const orientationPattern = orientation ? shell.pattern_orientation?.[orientation.id] : null;
  const combinationPattern = shell.pattern_combination?.[combinationPairId(axis1, axis2)];

  return [
    lensPattern ? {
      heading: fillTemplate(lensPattern.heading_template, {
        subtitle: lensPattern.subtitle
      }),
      description: lensPattern.description
    } : null,
    orientationPattern ? {
      heading: fillTemplate(orientationPattern.heading_template, {
        subtitle: orientationPattern.subtitle
      }),
      description: orientationPattern.description
    } : null,
    combinationPattern ? {
      paragraphs: [
        combinationPattern.combination_description,
        combinationPattern.bonpuri_connection
      ].filter(Boolean)
    } : null
  ].filter(Boolean);
}

function buildCombinationBlock(primaryCombination, language = "en") {
  const combination = combinationContent.items.find((entry) => (
    entry.id === combinationId(primaryCombination)
  )) || combinationContent.items.find((entry) => entry.id === "mixed_field");

  if (!combination) return null;

  const axis1 = findAxisContent(combination.axis_1, language);
  const axis2 = findAxisContent(combination.axis_2, language);
  const shell = combinationShell(language);
  const axisTemplateValues = combinationAxisTemplateValues(axis1, axis2);
  const patternSections = language === "ko"
    ? buildKoreanPatternSections(shell, axis1, axis2)
    : [];
  const injections = [axis1, axis2].map((axis, index) => {
    if (!axis) return null;
    const axisType = axis.type === "lens" ? "Lens" : "Orientation";

    return {
      title: axisDisplayLabel(axis, language),
      marker: `{${axis.label} ${axisType} injection}`,
      bridge: getCombinationBridge(combination, axis, index + 1, language),
      bridgeMarker: `{${axis.label} ${axisType} bridge}`,
      segments: renderAxisSegments(axis).slice(0, -1)
    };
  }).filter(Boolean);

  return {
    kind: "combination",
    title: {
      marker: "{combination.title_template}",
      text: shell.title_template
    },
    subtitle: {
      marker: "{combination.label}",
      text: combinationDisplayLabel(combination, axis1, axis2, language)
    },
    opening: {
      marker: "{combination.opening_template}",
      text: fillTemplate(shell.opening_template, axisTemplateValues)
    },
    openingBridge: {
      marker: "{combination.opening_bridge_template}",
      text: fillTemplate(shell.opening_bridge_template, axisTemplateValues)
    },
    patternSections,
    injections,
    closing: [
      {
        marker: "{combination.combined_result_bridge} {combination.combined_result}",
        text: [
          fillTemplate(combination.combined_result_bridge || "", axisTemplateValues),
          combination.combined_result
        ].filter(Boolean).join(" ")
      }
    ],
    ending: {
      marker: "{combination.ending_template}",
      text: shell.ending_template
    }
  };
}

function findDeityContent(deityId, language = "en") {
  const localizedContent = language === "ko" ? deityContentKo : deityContent;
  return localizedContent.items.find((entry) => entry.id === deityId)
    || deityContent.items.find((entry) => entry.id === deityId)
    || null;
}

export function composeDeityResultBlock({ deityId, language = "en" }) {
  const deity = findDeityContent(deityId, language);
  if (!deity) return null;

  return {
    kind: "deity",
    title: deity.title,
    subtitle: deity.subtitle,
    paragraphs: deity.paragraphs || []
  };
}

export function composeResultTextBlocks({ primaryCombination, language = "en" }) {
  return [buildCombinationBlock(primaryCombination, language)].filter(Boolean);
}
