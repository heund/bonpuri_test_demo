# Calibration Notes

## Prototype Calibration Record 1

Status: Preliminary

This record documents a light calibration pass for the current 16-question Bonpuri Code prototype. It should not be treated as final calibration. Final calibration should happen only after the expanded question set and the Category 3 layer are implemented.

## Scope

This pass did not redesign the model.

No new categories were added. Axis names were not changed. The matching formula was not changed. The questionnaire text was not rewritten. No new questions were added.

The goal was only to reduce obvious scoring skew while keeping the current questionnaire and deity-matching model intact.

## Changes Made

### Response Intensity

Response Intensity was reduced across ordinary axis questions.

The main Response Intensity questions remain:

- `q03`
- `q07`
- `q11`
- `q15`

For ordinary axis questions, most `response_intensity` values were reduced to `0`. A value of `1` was kept where the answer clearly implies pressure, persistence, unresolved charge, threat, or urgency. Values of `2` and `3` were avoided outside the main Response Intensity questions.

After this pass, reachable Response Intensity became:

```json
{
  "min": 17,
  "max": 100,
  "average_over_reachable_states": 60.6,
  "average_over_answer_combinations": 59.8
}
```

Previously, the reachable minimum was `39`, so low-reactivity profiles were underrepresented.

### Composite Options

Several existing options were lightly strengthened where the language already supported a composite reading.

Jacheongbi-style `Self + Care + Order` support:

- `q15_c`: "It sits with me, waiting to find its shape."
- `q16_b`: "Something that ended before it could finish becoming."
- `q06_b`: "Knowing something real got wasted."
- `q10_b`: "Something is going to fall apart if no one pays attention to it."

Nokdisaengi-style `Social + Care + Order` support:

- `q10_c`: "Someone is being failed by the people around them and nobody notices."
- `q12_c`: "Who's been quietly carrying it."
- `q09_c`: "Where the tension between people is really coming from."
- `q06_c`: "Someone ending up alone with something they shouldn't have had to carry."

### Duplicate Deity Vectors

Two pairs of near-duplicate deity vectors were separated while keeping them conceptually close.

Updated provisional vectors:

```json
{
  "myeongjinguks_daughter": {
    "self": 50,
    "social": 55,
    "care": 90,
    "order": 50,
    "response_intensity": 35
  },
  "samseung_halmang": {
    "self": 40,
    "social": 65,
    "care": 98,
    "order": 60,
    "response_intensity": 30
  },
  "donghae_yonggungs_daughter": {
    "self": 55,
    "social": 45,
    "care": 80,
    "order": 50,
    "response_intensity": 80
  },
  "jeoseung_halmang": {
    "self": 40,
    "social": 55,
    "care": 70,
    "order": 65,
    "response_intensity": 90
  }
}
```

## Diagnostic Results

Diagnostics were run over reachable score states after the light calibration pass.

Primary distribution over reachable score states:

```json
[
  ["daebyeolwang", 16.3],
  ["jeoseung_halmang", 16.1],
  ["samani", 11.5],
  ["donghae_yonggungs_daughter", 11.5],
  ["chogong_three_brothers", 11.2],
  ["oneuri", 7.9],
  ["yeongdeung_halmang", 7.2],
  ["sobyeolwang", 5.2],
  ["yu_jeongseungs_daughter", 4.0],
  ["gamunjangagi", 4.0],
  ["myeongjinguks_daughter", 3.9],
  ["hallakgungi", 1.0],
  ["gangnim", 0.2]
]
```

Very rare but possible as primary:

- `noga_danpung_agissi`
- `yeosan_buin`
- `daebyeolsang_manura`
- `jijang_agissi`

Still not primary in reachable states:

- `jacheongbi`
- `samseung_halmang`
- `nokdisaengi`
- `chilseong_agi`
- `wongang_ami`

## Top 5 Reachability

After this pass:

- `nokdisaengi` can appear in the top 5, but very rarely.
- `jacheongbi` still does not appear in the top 5.

The only deity still impossible as top 5 in the current 16-question prototype is:

- `jacheongbi`

## Interpretation

This pass improved the reachable score geometry without forcing equal deity distribution.

The remaining Jacheongbi issue should not be overcorrected at this stage. Jacheongbi requires a stronger reachable `Self + Care + Order` profile than the current 16-question set naturally supports. This may be better addressed by the expanded question set or Category 3 layer rather than by heavy tuning in the current preliminary prototype.

## Final Calibration Note

This record is preliminary. Final calibration should wait until:

- the expanded question set is implemented;
- the Category 3 layer is implemented;
- deity vectors are manually reviewed again;
- real or curator-guided test responses are available for comparison.
