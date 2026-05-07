# Scoring Rules

This prototype uses four main axes, one modifier, and one separate action field.

## Axes

**Self** measures how strongly the participant reads rupture through self-understanding, identity, origin, agency, authorship, self-explanation, self-growth, and personal direction.

**Social** measures how strongly the participant reads rupture through relation, belonging, social field, household/community dynamics, recognition, exclusion, reciprocity, and shared structures.

**Care** measures how strongly the participant reads rupture through growth, life-force, cultivation, care, continuation, sustenance, emergence, and the conditions that allow something to survive or become.

**Order** measures how strongly the participant reads rupture through truth, responsibility, fairness, harm, moral order, power, authority, hidden causes, false explanation, and distorted world-order.

**Response Intensity** is a modifier. It measures how intensely the participant experiences the sensitivity pattern as threat, pressure, instability, anxiety, urgency, or emotional charge. It is not a standalone category.

**Agency / Action Pull** is a separate action field. It measures how much a recognised signal moves the participant toward action, shaping, intervention, clarification, or transformation. It is normalised and displayed separately, but it is not part of the radar graph or deity matching formula yet.

## Answer Scoring

Each answer option contributes a small integer score to all six recognised fields:

```json
{
  "self": 0,
  "social": 0,
  "care": 0,
  "order": 0,
  "response_intensity": 0,
  "agency": 0
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

Agency / Action Pull is also normalised separately to 0-100 using the same method. It is displayed beside or below Response Intensity. It is not included in the radar graph.

## Agency / Action Pull Bands

```text
0-30: Observing / receptive
The participant tends to notice, wait, watch, or stay with something before acting.

31-60: Processing / responsive
The participant tends to keep working with the signal internally or relationally until the next step becomes clearer.

61-80: Shaping / active
The participant tends to clarify, support, structure, repair, or move something forward.

81-100: Intervening / transformative
The participant tends to act quickly, name directly, push for change, or make something concrete.
```

## Deity Matching

The main profile vector is:

```text
[self, social, care, order]
```

Matching uses Euclidean distance across the four main axes. Response Intensity and Agency / Action Pull are compared separately and added as light modifiers:

```text
base_distance = Euclidean distance across self/social/care/order
reactivity_distance = absolute difference between user.response_intensity and deity.response_intensity
agency_distance = absolute difference between user.agency and deity.agency

final_score = base_distance
            + (reactivity_distance * 0.25)
            + (agency_distance * 0.20)
```

Lower `final_score` means a closer deity anchor.

Response Intensity and Agency / Action Pull must not dominate matching. They can favour a deity with a similar pressure or action field only after the main four-axis structure has been considered.

## Result Meaning

The result is narrative placement, not personality labelling. The participant is not assigned a fixed deity identity. The output locates the participant's sensitivity profile near Bonpuri deity anchors as a point of entry into the structure.

The result must not make claims about psychological diagnosis, therapy, healing, trauma, neuroticism, or mental health.
