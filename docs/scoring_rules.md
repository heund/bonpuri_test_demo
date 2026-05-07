# Scoring Rules

This prototype uses four main axes and one modifier.

## Axes

**Self** measures how strongly the participant reads rupture through self-understanding, identity, origin, agency, authorship, self-explanation, self-growth, and personal direction.

**Social** measures how strongly the participant reads rupture through relation, belonging, social field, household/community dynamics, recognition, exclusion, reciprocity, and shared structures.

**Care** measures how strongly the participant reads rupture through growth, life-force, cultivation, care, continuation, sustenance, emergence, and the conditions that allow something to survive or become.

**Justice** measures how strongly the participant reads rupture through truth, responsibility, fairness, harm, moral order, power, authority, hidden causes, false explanation, and distorted world-order.

**Response Intensity** is a modifier. It measures how intensely the participant experiences the sensitivity pattern as threat, pressure, instability, anxiety, urgency, or emotional charge. It is not a standalone category.

## Answer Scoring

Each answer option contributes a small integer score to all five fields:

```json
{
  "self": 0,
  "social": 0,
  "care": 0,
  "justice": 0,
  "response_intensity": 0
}
```

The seed data uses a 0-3 scale. Scores are summed across selected answers.

## Normalisation

Each main axis is normalised independently to a 0-100 range:

```text
normalised_score = (raw_score / max_possible_score_for_that_axis) * 100
```

The maximum possible score for an axis is calculated from the question set by adding the highest available option score for that axis in each question.

Response Intensity is normalised separately to 0-100 using the same method. It is kept outside the radar graph because it modifies the tone and deity matching of the four main axes. It is not a fifth main category.

## Deity Matching

The main profile vector is:

```text
[self, social, care, justice]
```

Matching uses Euclidean distance across the four main axes. Response Intensity is compared separately and added as a small modifier:

```text
base_distance = Euclidean distance across self/social/care/justice
reactivity_distance = absolute difference between user.response_intensity and deity.response_intensity
final_score = base_distance + (reactivity_distance * 0.25)
```

Lower `final_score` means a closer deity anchor.

Response Intensity must not dominate matching. It can favour a deity with a similar pressure field only after the main four-axis structure has been considered.

## Result Meaning

The result is narrative placement, not personality labelling. The participant is not assigned a fixed deity identity. The output locates the participant's sensitivity profile near Bonpuri deity anchors as a point of entry into the structure.

The result must not make claims about psychological diagnosis, therapy, healing, trauma, neuroticism, or mental health.
