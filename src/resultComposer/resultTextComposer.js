import combinationContent from "./combination_content.json";
import deityContent from "./deity_content.json";
import deityContentKo from "./deity_content_ko.json";
import lensContent from "./lens_content.json";
import lensContentKo from "./lens_content_ko.json";
import orientationContent from "./orientation_content.json";
import resultShells from "./result_shells.json";

const shells = resultShells.result_shells;

function fillTemplate(template, values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value ?? ""),
    template
  );
}

function axisSource(type, language = "en") {
  if (type === "lens" && language === "ko") return lensContentKo;
  return type === "lens" ? lensContent : orientationContent;
}

function findAxisContent(axis, language = "en") {
  if (!axis) return null;
  const content = axisSource(axis.type, language).items.find((entry) => entry.id === axis.id);
  return content ? { ...content, type: axis.type } : null;
}

function renderAxisSegments(content) {
  if (!content) return [];
  const values = { label: content.label };

  return [
    {
      marker: `{${content.label} ${content.type === "lens" ? "Lens" : "Orientation"}.primary_mode.text}`,
      text: fillTemplate(content.primary_mode.text, values)
    },
    ...content.aspects.flatMap((aspect) => [
      {
        marker: `{${content.label} ${content.type === "lens" ? "Lens" : "Orientation"}.${aspect.id}.attention}`,
        text: fillTemplate(aspect.attention, values)
      },
      {
        marker: `{${content.label} ${content.type === "lens" ? "Lens" : "Orientation"}.${aspect.id}.strength}`,
        text: fillTemplate(aspect.strength, values)
      },
      {
        marker: `{${content.label} ${content.type === "lens" ? "Lens" : "Orientation"}.${aspect.id}.friction}`,
        text: fillTemplate(aspect.friction, values)
      }
    ]),
    {
      marker: `{${content.label} ${content.type === "lens" ? "Lens" : "Orientation"}.core_question}`,
      text: fillTemplate(content.core_question, values)
    }
  ];
}

function getCombinationBridge(combination, axis, position, language = "en") {
  if (language === "ko" && axis.type === "lens" && axis.bridge) {
    return axis.bridge;
  }

  const shell = shells.combination;

  if (combination.type === "lens_orientation" && axis.type === "lens") {
    return fillTemplate(shell.lens_bridge_template, { label: axis.label });
  }

  if (combination.type === "lens_orientation" && axis.type === "orientation") {
    return fillTemplate(shell.orientation_bridge_template, { label: axis.label });
  }

  if (combination.type === "orientation_balance" && position === 1) {
    return fillTemplate(shell.orientation_balance_first_bridge_template, { label: axis.label });
  }

  if (combination.type === "orientation_balance" && position === 2) {
    return fillTemplate(shell.orientation_balance_second_bridge_template, { label: axis.label });
  }

  return "";
}

function combinationId(label = "") {
  return label.toLowerCase().replaceAll(" + ", "_").replaceAll(" ", "_");
}

function axisDisplayLabel(axis, language = "en") {
  if (!axis) return "";
  if (language === "ko" && axis.type === "lens") return `기준: ${axis.label}`;
  return `${axis.label} ${axis.type === "lens" ? "Lens" : "Orientation"}`;
}

function combinationDisplayLabel(combination, axis1, axis2, language = "en") {
  if (!axis1 || !axis2) return combination.label;
  return `${axisDisplayLabel(axis1, language)} with ${axisDisplayLabel(axis2, language)}`;
}

function combinationAxisTemplateValues(axis1, axis2) {
  return {
    lens: [axis1, axis2].find((axis) => axis?.type === "lens")?.label
      || axis1?.label
      || "",
    orientation: [axis1, axis2].find((axis) => axis?.type === "orientation")?.label
      || axis2?.label
      || ""
  };
}

function buildCombinationBlock(primaryCombination, language = "en") {
  const combination = combinationContent.items.find((entry) => (
    entry.id === combinationId(primaryCombination)
  )) || combinationContent.items.find((entry) => entry.id === "mixed_field");

  if (!combination) return null;

  const axis1 = findAxisContent(combination.axis_1, language);
  const axis2 = findAxisContent(combination.axis_2, language);
  const axisTemplateValues = combinationAxisTemplateValues(axis1, axis2);
  const injections = [axis1, axis2].map((axis, index) => {
    if (!axis) return null;

    return {
      title: axisDisplayLabel(axis, language),
      marker: `{${axis.label} ${axis.type === "lens" ? "Lens" : "Orientation"} injection}`,
      bridge: getCombinationBridge(combination, axis, index + 1, language),
      bridgeMarker: `{${axis.label} ${axis.type === "lens" ? "Lens" : "Orientation"} bridge}`,
      segments: renderAxisSegments(axis).slice(0, -1)
    };
  }).filter(Boolean);

  return {
    kind: "combination",
    title: {
      marker: "{combination.title_template}",
      text: shells.combination.title_template
    },
    subtitle: {
      marker: "{combination.label}",
      text: combinationDisplayLabel(combination, axis1, axis2, language)
    },
    opening: {
      marker: "{combination.combined_short_sentence}",
      text: combination.combined_short_sentence
    },
    injections,
    closing: [
      {
        marker: "{combination.combined_result_bridge} {combination.combined_result}",
        text: [
          fillTemplate(combination.combined_result_bridge || "", axisTemplateValues),
          combination.combined_result
        ].filter(Boolean).join(" ")
      }
    ]
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
