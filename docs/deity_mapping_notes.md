# Deity Mapping Notes

The deity vectors in `data/deity_axis_map.json` are provisional and manually adjustable.

Only vectors explicitly supplied by the project specification should be treated as scored anchors. If an anchor has `axis_vector: null`, it is present as a candidate but requires manual scoring before it can participate in matching.

## Multiple Axes

One deity can sit across multiple axes. The `primary_axes` and `secondary_axes` fields are mapping aids, not fixed labels.

The four main conceptual groupings currently used for testing are:

- Self + Care
- Self + Justice
- Social + Care
- Social + Justice

These groupings help generate result language, but they should not flatten a deity into one simple type.

## Response Intensity

High Response Intensity does not mean "bad". It indicates a strong response intensity, high sensitivity charge, heightened pressure field, or strong affective signal.

Low to medium Response Intensity can favour anchors whose structures are stabilising, constructive, investigative, cultivating, or ordering.

High Response Intensity can favour anchors whose structures include pressure, threat, failed emergence, expulsion, violence, disease, crooked order, abandonment, high-stakes judgement, or unstable transformation.

Response Intensity modifies ranking, but it must not determine the result by itself.

## Pressure and Shadow Anchors

Some deities may act as pressure anchors or shadow anchors. This means their narrative structure carries failed emergence, distorted order, abandonment, threat, high-stakes judgement, or other charged conditions.

This should never be written to the participant as a negative personal judgement. It describes the narrative field around an anchor, not the participant's character.

## Editable During Testing

All deity mapping values must stay easy to edit during conceptual testing:

- axis vectors
- primary axes
- secondary axes
- tone
- keywords
- result summaries
- encounter prompts

Do not over-optimise the mapping logic before exact vectors and interpretation rules are manually reviewed.
