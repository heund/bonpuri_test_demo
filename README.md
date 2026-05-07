# Bonpuri Questionnaire Prototype

This prototype is currently stripped down for survey structure and scoring work.

The app keeps the questionnaire flow, answer collection, scoring logic, deity matching, and result text generation. Visual design has intentionally been reduced to basic HTML and minimal CSS.

## Commands

```sh
npm run dev
npm run build
npm run sample
```

## Deity Space Diagnostics

Generate the local deity-space chart and data:

```sh
npm run deity:space
npm run deity:diagnostics
```

Open the diagnostics viewer:

```sh
npm run deity:viewer
```

Then visit `http://127.0.0.1:5174/tools/deity-space-viewer/`.

The viewer is a debugging tool. The deity map is a 2D MDS projection of the real 6D weighted matching space, and coverage percentages are sampled estimates.
