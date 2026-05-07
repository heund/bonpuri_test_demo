from __future__ import annotations

import csv
import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


ROOT_DIR = Path(__file__).resolve().parents[1]
DEITY_MAP_PATH = ROOT_DIR / "data" / "deity_axis_map.json"
OUTPUT_DIR = ROOT_DIR / "outputs" / "deity_space"

MAIN_AXES = ["self", "social", "care", "order"]
MODIFIER_AXES = ["response_intensity", "agency"]
ALL_AXES = [*MAIN_AXES, *MODIFIER_AXES]
WEIGHTS = {
    "response_intensity": 0.25,
    "agency": 0.20,
}

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def load_deities() -> list[dict]:
    with DEITY_MAP_PATH.open("r", encoding="utf-8") as file:
        data = json.load(file)

    deities = data.get("deities", [])
    if not deities:
        raise ValueError(f"No deities found in {DEITY_MAP_PATH}")

    errors = []
    for deity in deities:
        vector = deity.get("axis_vector") or {}
        for axis in ALL_AXES:
            value = vector.get(axis)
            if not isinstance(value, (int, float)) or isinstance(value, bool):
                errors.append(f"{deity.get('deity_id', '<missing id>')} missing numeric {axis}")

    if errors:
        raise ValueError("Invalid deity vectors:\n" + "\n".join(errors))

    return deities


def weighted_distance(a: dict, b: dict) -> float:
    main_distance = math.sqrt(sum((a[axis] - b[axis]) ** 2 for axis in MAIN_AXES))
    response_distance = abs(a["response_intensity"] - b["response_intensity"]) * WEIGHTS["response_intensity"]
    agency_distance = abs(a["agency"] - b["agency"]) * WEIGHTS["agency"]
    return main_distance + response_distance + agency_distance


def build_distance_matrix(deities: list[dict]) -> np.ndarray:
    count = len(deities)
    distances = np.zeros((count, count), dtype=float)
    vectors = [deity["axis_vector"] for deity in deities]

    for i in range(count):
        for j in range(i + 1, count):
            distance = weighted_distance(vectors[i], vectors[j])
            distances[i, j] = distance
            distances[j, i] = distance

    return distances


def classical_mds(distances: np.ndarray, dimensions: int = 2) -> tuple[np.ndarray, np.ndarray]:
    n = distances.shape[0]
    squared = distances ** 2
    centering = np.eye(n) - np.ones((n, n)) / n
    gram = -0.5 * centering @ squared @ centering
    eigenvalues, eigenvectors = np.linalg.eigh(gram)
    order = np.argsort(eigenvalues)[::-1]
    eigenvalues = eigenvalues[order]
    eigenvectors = eigenvectors[:, order]

    positive = np.maximum(eigenvalues[:dimensions], 0)
    coordinates = eigenvectors[:, :dimensions] * np.sqrt(positive)
    return coordinates, eigenvalues


def projection_stress(original_distances: np.ndarray, coordinates: np.ndarray) -> float:
    projected_distances = np.linalg.norm(
        coordinates[:, np.newaxis, :] - coordinates[np.newaxis, :, :],
        axis=2,
    )
    upper = np.triu_indices_from(original_distances, k=1)
    numerator = np.sum((original_distances[upper] - projected_distances[upper]) ** 2)
    denominator = np.sum(original_distances[upper] ** 2)
    return float(math.sqrt(numerator / denominator)) if denominator else 0.0


def make_rows(deities: list[dict], coordinates: np.ndarray) -> list[dict]:
    rows = []
    for deity, coord in zip(deities, coordinates):
        vector = deity["axis_vector"]
        rows.append(
            {
                "deity_id": deity["deity_id"],
                "name_ko": deity.get("name_ko", ""),
                "name_en": deity.get("name_en", ""),
                "bonpuri": deity.get("bonpuri", ""),
                **{axis: vector[axis] for axis in ALL_AXES},
                "mds_x": float(coord[0]),
                "mds_y": float(coord[1]),
            }
        )
    return rows


def save_coordinates(rows: list[dict]) -> None:
    csv_path = OUTPUT_DIR / "deity_anchor_space_coordinates.csv"
    json_path = OUTPUT_DIR / "deity_anchor_space_coordinates.json"

    with csv_path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    with json_path.open("w", encoding="utf-8") as file:
        json.dump(rows, file, indent=2, ensure_ascii=False)


def save_distances(deities: list[dict], distances: np.ndarray) -> None:
    ids = [deity["deity_id"] for deity in deities]
    dataframe = pd.DataFrame(distances, index=ids, columns=ids)
    dataframe.to_csv(OUTPUT_DIR / "deity_pairwise_weighted_distances.csv", encoding="utf-8")

    nested = {
        row_id: {
            column_id: float(distances[row_index, column_index])
            for column_index, column_id in enumerate(ids)
        }
        for row_index, row_id in enumerate(ids)
    }
    with (OUTPUT_DIR / "deity_pairwise_weighted_distances.json").open("w", encoding="utf-8") as file:
        json.dump(nested, file, indent=2, ensure_ascii=False)


def save_plot(rows: list[dict], stress: float) -> None:
    plt.style.use("dark_background")
    plt.rcParams["font.sans-serif"] = [
        "Malgun Gothic",
        "AppleGothic",
        "Noto Sans CJK KR",
        "DejaVu Sans",
    ]
    plt.rcParams["axes.unicode_minus"] = False
    fig, ax = plt.subplots(figsize=(12, 9), dpi=160)
    xs = [row["mds_x"] for row in rows]
    ys = [row["mds_y"] for row in rows]

    ax.scatter(xs, ys, s=42, c="#8ab4f8", edgecolors="#d8e2ff", linewidths=0.6)
    for row in rows:
        label = row["name_ko"] or row["name_en"] or row["deity_id"]
        ax.annotate(label, (row["mds_x"], row["mds_y"]), xytext=(4, 4), textcoords="offset points", fontsize=8)

    ax.set_title(
        f"Bonpuri Deity Anchor Space, classical MDS projection\n"
        f"Real matching space is 6D; 2D projection is approximate. Stress: {stress:.4f}",
        fontsize=11,
    )
    ax.set_xlabel("MDS 1")
    ax.set_ylabel("MDS 2")
    ax.grid(color="#333333", linewidth=0.5)
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "deity_anchor_space_mds.png")
    plt.close(fig)


def save_meta(stress: float, eigenvalues: np.ndarray, deity_count: int) -> None:
    positive = eigenvalues[eigenvalues > 0]
    explained = []
    if positive.size:
        explained = [float(value / positive.sum()) for value in np.maximum(eigenvalues[:2], 0)]

    meta = {
        "projection_method": "classical_mds",
        "stress": stress,
        "axes_used": {
            "main_axes": MAIN_AXES,
            "modifiers": MODIFIER_AXES,
        },
        "modifier_weights": WEIGHTS,
        "generated_timestamp": datetime.now(timezone.utc).isoformat(),
        "number_of_deities": deity_count,
        "positive_eigenvalue_explained_share_first_two_dimensions": explained,
        "warning": "The real deity matching space is 6D. This 2D chart is an approximate projection and should not be treated as exact geometry.",
    }

    with (OUTPUT_DIR / "deity_space_projection_meta.json").open("w", encoding="utf-8") as file:
        json.dump(meta, file, indent=2, ensure_ascii=False)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    deities = load_deities()
    distances = build_distance_matrix(deities)
    coordinates, eigenvalues = classical_mds(distances)
    stress = projection_stress(distances, coordinates)
    rows = make_rows(deities, coordinates)

    save_coordinates(rows)
    save_distances(deities, distances)
    save_plot(rows, stress)
    save_meta(stress, eigenvalues, len(deities))

    print("Generated Bonpuri deity-space diagnostics.")
    print(f"Source: {DEITY_MAP_PATH}")
    print(f"Output: {OUTPUT_DIR}")
    print("Projection: classical MDS from weighted 6D matching distances")
    print(f"Projection stress: {stress:.6f}")
    print("Warning: real space is 6D; 2D chart is approximate.")


if __name__ == "__main__":
    main()
