const AXES = ["self", "social", "care", "order", "response_intensity", "agency"];
const MAIN_AXES = ["self", "social", "care", "order"];
const LABELS = {
  self: "Self",
  social: "Social",
  care: "Care",
  order: "Order",
  response_intensity: "Response Intensity",
  agency: "Action Pull"
};
const WEIGHTS = {
  response_intensity: 0.25,
  agency: 0.20
};
const PRESETS = {
  ideal_jacheongbi_1: { self: 75, social: 35, care: 85, order: 55, response_intensity: 45, agency: 90 },
  ideal_jacheongbi_2: { self: 85, social: 45, care: 80, order: 65, response_intensity: 55, agency: 90 },
  ideal_jacheongbi_3: { self: 70, social: 50, care: 90, order: 45, response_intensity: 40, agency: 85 },
  ideal_nokdisaengi_1: { self: 35, social: 85, care: 70, order: 75, response_intensity: 70, agency: 85 },
  ideal_nokdisaengi_2: { self: 45, social: 90, care: 65, order: 80, response_intensity: 75, agency: 90 },
  ideal_nokdisaengi_3: { self: 40, social: 80, care: 75, order: 65, response_intensity: 65, agency: 80 }
};

const state = {
  coordinates: [],
  distances: {},
  coverage: null,
  meta: null,
  deityMap: null,
  questions: null,
  selected: null,
  hovered: null,
  manualProfile: { self: 50, social: 50, care: 50, order: 50, response_intensity: 50, agency: 50 },
  view: { scale: 1, offsetX: 0, offsetY: 0 },
  drag: null
};

const elements = {
  status: document.querySelector("#status"),
  map: document.querySelector("#map"),
  tooltip: document.querySelector("#tooltip"),
  detail: document.querySelector("#deity-detail"),
  coverageNote: document.querySelector("#coverage-note"),
  coverageTable: document.querySelector("#coverage-table"),
  questionList: document.querySelector("#question-list"),
  supportPanel: document.querySelector("#support-panel"),
  sliders: document.querySelector("#sliders"),
  manualResults: document.querySelector("#manual-results")
};
const ctx = elements.map.getContext("2d");

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${path}`);
  }
  return response.json();
}

async function init() {
  try {
    const [coordinates, distances, coverage, meta, deityMap, questions] = await Promise.all([
      loadJson("../../outputs/deity_space/deity_anchor_space_coordinates.json"),
      loadJson("../../outputs/deity_space/deity_pairwise_weighted_distances.json"),
      loadJson("../../outputs/deity_space/deity_coverage_diagnostics.json"),
      loadJson("../../outputs/deity_space/deity_space_projection_meta.json"),
      loadJson("../../data/deity_axis_map.json"),
      loadJson("../../data/test_questions_seed.json")
    ]);

    state.coordinates = coordinates;
    state.distances = distances;
    state.coverage = coverage;
    state.meta = meta;
    state.deityMap = deityMap;
    state.questions = questions;
    state.selected = coordinates[0];
    elements.status.textContent = `Loaded ${coordinates.length} deities. Coverage samples: ${coverage.sample_size}. Projection stress: ${round(meta.stress)}.`;

    bindEvents();
    renderAll();
  } catch (error) {
    elements.status.textContent = `${error.message}. Run npm run deity:space and npm run deity:diagnostics, then serve from project root.`;
  }
}

function bindEvents() {
  elements.map.addEventListener("mousemove", handleMapMove);
  elements.map.addEventListener("click", handleMapClick);
  elements.map.addEventListener("wheel", handleWheel, { passive: false });
  elements.map.addEventListener("mousedown", (event) => {
    state.drag = { x: event.clientX, y: event.clientY, offsetX: state.view.offsetX, offsetY: state.view.offsetY };
  });
  window.addEventListener("mouseup", () => { state.drag = null; });
  window.addEventListener("mousemove", (event) => {
    if (!state.drag) return;
    state.view.offsetX = state.drag.offsetX + (event.clientX - state.drag.x);
    state.view.offsetY = state.drag.offsetY + (event.clientY - state.drag.y);
    drawMap();
  });
  document.querySelector("#reset-map").addEventListener("click", () => {
    state.view = { scale: 1, offsetX: 0, offsetY: 0 };
    drawMap();
  });
  ["#question-search", "#id-filter", "#field-filter", "#min-score-filter"].forEach((selector) => {
    document.querySelector(selector).addEventListener("input", renderQuestions);
  });
  document.querySelectorAll("[data-export]").forEach((button) => {
    button.addEventListener("click", () => exportData(button.dataset.export));
  });
}

function renderAll() {
  renderCoverage();
  renderQuestions();
  renderSliders();
  renderPresets();
  renderManualResults();
  renderSelectedDeity();
  drawMap();
}

function bounds() {
  const xs = state.coordinates.map((row) => row.mds_x);
  const ys = state.coordinates.map((row) => row.mds_y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  };
}

function project(row) {
  const b = bounds();
  const padding = 70;
  const width = elements.map.width - padding * 2;
  const height = elements.map.height - padding * 2;
  const x = padding + ((row.mds_x - b.minX) / (b.maxX - b.minX || 1)) * width;
  const y = elements.map.height - padding - ((row.mds_y - b.minY) / (b.maxY - b.minY || 1)) * height;
  return {
    x: x * state.view.scale + state.view.offsetX,
    y: y * state.view.scale + state.view.offsetY
  };
}

function drawMap() {
  ctx.clearRect(0, 0, elements.map.width, elements.map.height);
  ctx.fillStyle = "#090b0e";
  ctx.fillRect(0, 0, elements.map.width, elements.map.height);
  ctx.strokeStyle = "#232832";
  ctx.lineWidth = 1;
  for (let x = 0; x <= elements.map.width; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, elements.map.height);
    ctx.stroke();
  }
  for (let y = 0; y <= elements.map.height; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(elements.map.width, y);
    ctx.stroke();
  }

  for (const row of state.coordinates) {
    const point = project(row);
    const selected = state.selected && state.selected.deity_id === row.deity_id;
    ctx.beginPath();
    ctx.arc(point.x, point.y, selected ? 7 : 5, 0, Math.PI * 2);
    ctx.fillStyle = selected ? "#f2d16b" : "#8ab4f8";
    ctx.fill();
    ctx.strokeStyle = "#d8e2ff";
    ctx.stroke();
    ctx.fillStyle = "#dce6f6";
    ctx.font = "12px Arial";
    ctx.fillText(row.name_ko || row.name_en, point.x + 8, point.y - 8);
  }

  drawManualApproxPoint();
}

function drawManualApproxPoint() {
  const ranked = rankProfile(state.manualProfile);
  const top = ranked.slice(0, 5);
  let totalWeight = 0;
  let x = 0;
  let y = 0;
  for (const match of top) {
    const row = state.coordinates.find((candidate) => candidate.deity_id === match.deity_id);
    const point = project(row);
    const weight = 1 / Math.max(match.final_score, 0.0001);
    totalWeight += weight;
    x += point.x * weight;
    y += point.y * weight;
  }
  if (!totalWeight) return;
  ctx.beginPath();
  ctx.rect(x / totalWeight - 6, y / totalWeight - 6, 12, 12);
  ctx.fillStyle = "#ff7f7f";
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
  ctx.fillStyle = "#ffb3b3";
  ctx.fillText("manual approx", x / totalWeight + 10, y / totalWeight + 4);
}

function mapPointAt(event) {
  const rect = elements.map.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (elements.map.width / rect.width);
  const y = (event.clientY - rect.top) * (elements.map.height / rect.height);
  let nearest = null;
  let nearestDistance = Infinity;
  for (const row of state.coordinates) {
    const point = project(row);
    const distance = Math.hypot(x - point.x, y - point.y);
    if (distance < nearestDistance) {
      nearest = row;
      nearestDistance = distance;
    }
  }
  return nearestDistance <= 18 ? nearest : null;
}

function handleMapMove(event) {
  const row = mapPointAt(event);
  state.hovered = row;
  if (!row) {
    elements.tooltip.hidden = true;
    return;
  }
  elements.tooltip.hidden = false;
  elements.tooltip.style.left = `${event.clientX + 12}px`;
  elements.tooltip.style.top = `${event.clientY + 12}px`;
  elements.tooltip.textContent = `${row.name_ko}
${row.name_en}
${row.bonpuri}
${AXES.map((axis) => `${LABELS[axis]}: ${row[axis]}`).join("\n")}`;
}

function handleMapClick(event) {
  const row = mapPointAt(event);
  if (!row) return;
  state.selected = row;
  renderSelectedDeity();
  drawMap();
}

function handleWheel(event) {
  event.preventDefault();
  state.view.scale = Math.min(3, Math.max(0.6, state.view.scale + (event.deltaY < 0 ? 0.1 : -0.1)));
  drawMap();
}

function renderSelectedDeity() {
  const row = state.selected;
  if (!row) return;
  const coverage = coverageFor(row.deity_id);
  const neighbours = Object.entries(state.distances[row.deity_id])
    .filter(([id]) => id !== row.deity_id)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 8)
    .map(([id, distance]) => {
      const deity = state.coordinates.find((candidate) => candidate.deity_id === id);
      return `<tr><td>${deity.name_ko}</td><td>${deity.name_en}</td><td>${round(distance)}</td></tr>`;
    })
    .join("");

  elements.detail.innerHTML = `
    <h3>${row.name_ko} / ${row.name_en}</h3>
    <p>${row.deity_id}<br>${row.bonpuri}</p>
    ${vectorTable(row)}
    <h3>Nearest Neighbours</h3>
    <table><thead><tr><th>KO</th><th>EN</th><th>Weighted distance</th></tr></thead><tbody>${neighbours}</tbody></table>
    <h3>Sampled Ranking Behaviour</h3>
    ${coverage ? `<p>Primary: ${coverage.observed_primary_count} (${coverage.observed_primary_percentage}%)<br>Top 5: ${coverage.observed_top5_count} (${coverage.observed_top5_percentage}%)<br>Best rank: ${coverage.best_observed_rank ?? "not observed"}<br>Best score: ${coverage.best_observed_final_score ?? "not observed"}</p>` : "<p>No coverage diagnostics loaded.</p>"}
    ${coverage && coverage.best_observed_top_matches ? `<h3>Best Observed Top Competitors</h3><table><thead><tr><th>Rank</th><th>Deity</th><th>Final</th></tr></thead><tbody>${coverage.best_observed_top_matches.slice(0, 6).map((match) => `<tr><td>${match.rank}</td><td>${match.name_ko}<br>${match.name_en}</td><td>${match.final_score}</td></tr>`).join("")}</tbody></table>` : ""}
  `;
  renderSupport();
}

function vectorTable(row) {
  return `<table><tbody>${AXES.map((axis) => `<tr><th>${LABELS[axis]}</th><td>${row[axis]}</td></tr>`).join("")}</tbody></table>`;
}

function renderCoverage() {
  elements.coverageNote.textContent = state.coverage.note;
  const rows = [...state.coverage.per_deity].sort((a, b) => b.observed_top5_count - a.observed_top5_count);
  elements.coverageTable.innerHTML = `
    <thead><tr><th>Deity</th><th>Primary</th><th>Primary %</th><th>Top 5</th><th>Top 5 %</th><th>Best rank</th><th>Best score</th><th>Flags</th></tr></thead>
    <tbody>
      ${rows.map((row) => `<tr>
        <td>${row.name_ko}<br>${row.name_en}</td>
        <td>${row.observed_primary_count}</td>
        <td>${row.observed_primary_percentage}</td>
        <td>${row.observed_top5_count}</td>
        <td>${row.observed_top5_percentage}</td>
        <td>${row.best_observed_rank ?? ""}</td>
        <td>${row.best_observed_final_score ?? ""}</td>
        <td>${row.appeared_as_primary ? "primary" : ""} ${row.appeared_in_top5 ? "top5" : "not observed top5"}</td>
      </tr>`).join("")}
    </tbody>
  `;
}

function renderQuestions() {
  const textFilter = document.querySelector("#question-search").value.toLowerCase();
  const idFilter = document.querySelector("#id-filter").value.toLowerCase();
  const field = document.querySelector("#field-filter").value;
  const minScore = Number(document.querySelector("#min-score-filter").value || 0);
  const html = [];

  for (const question of state.questions.questions) {
    const matchingOptions = question.options.filter((option) => {
      const haystack = `${question.id} ${question.text} ${option.id} ${option.text}`.toLowerCase();
      const textMatch = !textFilter || haystack.includes(textFilter);
      const idMatch = !idFilter || question.id.toLowerCase().includes(idFilter) || option.id.toLowerCase().includes(idFilter);
      const scoreMatch = !field || Number(option.scores[field] || 0) >= minScore;
      return textMatch && idMatch && scoreMatch;
    });
    if (!matchingOptions.length) continue;
    html.push(`<div class="question"><strong>${question.id}</strong> <span class="note">${question.phase || inferQuestionType(question)}</span><br>${question.text}`);
    for (const option of matchingOptions) {
      html.push(`<div class="option"><strong>${option.id}</strong>: ${option.text}<br><span class="score">${scoreString(option.scores)}</span></div>`);
    }
    html.push("</div>");
  }

  elements.questionList.innerHTML = html.join("") || "No matching options.";
}

function inferQuestionType(question) {
  const totals = Object.fromEntries(AXES.map((axis) => [axis, 0]));
  for (const option of question.options) {
    for (const axis of AXES) totals[axis] += Number(option.scores[axis] || 0);
  }
  if (totals.agency > 0 && MAIN_AXES.every((axis) => totals[axis] === 0)) return "action pull";
  if (totals.response_intensity > 0 && totals.agency === 0) return "response intensity";
  return "core recognition";
}

function renderSupport() {
  if (!state.selected) return;
  const deityVector = AXES.map((axis) => Number(state.selected[axis]));
  const rows = [];
  for (const question of state.questions.questions) {
    for (const option of question.options) {
      const optionVector = AXES.map((axis) => Number(option.scores[axis] || 0));
      rows.push({
        question_id: question.id,
        answer_id: option.id,
        question_text: question.text,
        answer_text: option.text,
        scores: option.scores,
        alignment: cosine(optionVector, deityVector)
      });
    }
  }
  rows.sort((a, b) => b.alignment - a.alignment);
  elements.supportPanel.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Question</th><th>Answer</th><th>Alignment</th><th>Scores</th></tr></thead>
        <tbody>${rows.slice(0, 15).map((row) => `<tr>
          <td>${row.question_id}<br>${row.question_text}</td>
          <td>${row.answer_id}<br>${row.answer_text}</td>
          <td>${round(row.alignment)}</td>
          <td><span class="score">${scoreString(row.scores)}</span></td>
        </tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

function renderSliders() {
  elements.sliders.innerHTML = AXES.map((axis) => `
    <label class="slider-row">
      <span>${LABELS[axis]}</span>
      <input data-slider="${axis}" type="range" min="0" max="100" value="${state.manualProfile[axis]}" />
      <span id="value-${axis}">${state.manualProfile[axis]}</span>
    </label>
  `).join("");
  document.querySelectorAll("[data-slider]").forEach((slider) => {
    slider.addEventListener("input", () => {
      state.manualProfile[slider.dataset.slider] = Number(slider.value);
      document.querySelector(`#value-${slider.dataset.slider}`).textContent = slider.value;
      renderManualResults();
      drawMap();
    });
  });
}

function renderPresets() {
  document.querySelector("#presets").innerHTML = Object.entries(PRESETS)
    .map(([id]) => `<button data-preset="${id}">${id}</button>`)
    .join("");
  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      state.manualProfile = { ...PRESETS[button.dataset.preset] };
      renderSliders();
      renderManualResults();
      drawMap();
    });
  });
}

function renderManualResults() {
  const matches = rankProfile(state.manualProfile).slice(0, 10);
  elements.manualResults.innerHTML = `
    <thead><tr><th>Rank</th><th>Deity</th><th>Match %</th><th>Final</th><th>Base</th><th>Response dist</th><th>Action dist</th></tr></thead>
    <tbody>${matches.map((match, index) => `<tr>
      <td>${index + 1}</td>
      <td>${match.name_ko}<br>${match.name_en}<br>${match.bonpuri}</td>
      <td>${match.match_percentage}</td>
      <td>${match.final_score}</td>
      <td>${match.base_distance}</td>
      <td>${match.response_intensity_distance}</td>
      <td>${match.agency_distance}</td>
    </tr>`).join("")}</tbody>
  `;
}

function rankProfile(profile) {
  return state.coordinates.map((deity) => {
    const baseDistance = Math.sqrt(MAIN_AXES.reduce((sum, axis) => sum + ((profile[axis] - deity[axis]) ** 2), 0));
    const responseDistance = Math.abs(profile.response_intensity - deity.response_intensity);
    const agencyDistance = Math.abs(profile.agency - deity.agency);
    const finalScore = baseDistance + responseDistance * WEIGHTS.response_intensity + agencyDistance * WEIGHTS.agency;
    return {
      deity_id: deity.deity_id,
      name_ko: deity.name_ko,
      name_en: deity.name_en,
      bonpuri: deity.bonpuri,
      match_percentage: matchPercentage(finalScore),
      final_score: round(finalScore),
      base_distance: round(baseDistance),
      response_intensity_distance: round(responseDistance),
      agency_distance: round(agencyDistance)
    };
  }).sort((a, b) => a.final_score - b.final_score);
}

function matchPercentage(finalDistance) {
  const maxDistance = Math.sqrt(MAIN_AXES.length * (100 ** 2)) + 25 + 20;
  return Math.max(0, Math.round(100 * (1 - finalDistance / maxDistance)));
}

function coverageFor(deityId) {
  return state.coverage.per_deity.find((row) => row.deity_id === deityId);
}

function scoreString(scores) {
  return AXES.map((axis) => `${axis}:${scores[axis] ?? 0}`).join(" ");
}

function cosine(a, b) {
  const dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
  const aLength = Math.sqrt(a.reduce((sum, value) => sum + value ** 2, 0));
  const bLength = Math.sqrt(b.reduce((sum, value) => sum + value ** 2, 0));
  return aLength && bLength ? dot / (aLength * bLength) : 0;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function exportData(type) {
  const payloads = {
    coordinates: state.coordinates,
    distances: state.distances,
    coverage: state.coverage,
    selected: state.selected ? {
      deity: state.selected,
      coverage: coverageFor(state.selected.deity_id),
      nearest_distances: state.distances[state.selected.deity_id]
    } : null,
    manual: {
      profile: state.manualProfile,
      top10: rankProfile(state.manualProfile).slice(0, 10)
    }
  };
  downloadJson(`bonpuri_${type}.json`, payloads[type]);
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

init();
