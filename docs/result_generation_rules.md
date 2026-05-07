# Result Generation Rules

The result describes a sensitivity profile across four axes, one modifier, and one separate action field. It must not become a personality type, diagnosis, or fixed deity identity.

## Required Result Structure

Prototype output should include:

- `axis_profile`
- `response_intensity`
- `agency`
- `action_pull`
- `action_pull_band`
- `primary_combination`
- `primary_anchor`
- `secondary_anchors`
- `result_text`

The radar graph data object includes only:

- `self`
- `social`
- `care`
- `order`

Response Intensity is returned separately.

Action Pull is also returned separately. It should not appear in radar graph data. It affects deity matching only as a light modifier.

## Allowed Phrasing

Use phrasing such as:

- "Your responses resonate with..."
- "Your strongest recognition pattern appears around..."
- "This profile sits near..."
- "This deity anchor offers a narrative placement for..."
- "This result is a point of entry into the Bonpuri structure."

For high Response Intensity, use terms such as:

- "strong response intensity"
- "high sensitivity charge"
- "heightened pressure field"
- "strong affective signal"

Do not describe high Response Intensity negatively.

## Forbidden Claims

Do not say:

- "You are this deity."
- "This is your personality type."
- "You have trauma."
- "You need healing."
- "This means you are anxious/neurotic."

Do not make claims about psychological diagnosis, therapy, healing, or mental health.

## Tie and Mixed Profile Handling

If multiple deities are close, return the closest as the primary anchor and return 2-3 secondary anchors when scored deity vectors are available.

If scores are very close, phrase the result as a mixed field instead of forcing a single clean result.

Example:

```text
Your result sits between Gamunjangagi and Jacheongbi. The first carries the question of self-source; the second carries the question of cultivated capacity.
```

If deity vectors are missing, the prototype should report available matches and keep unscored deity anchors editable in `data/deity_axis_map.json`.

## Text Sections

`summary` gives the main recognition pattern.

`axis_explanation` names the leading axes and explains the sensitivity pattern.

`bonpuri_connection` links the profile to Bonpuri structure without assigning identity.

`encounter_suggestions` suggests related deity encounters or narrative entry points.
