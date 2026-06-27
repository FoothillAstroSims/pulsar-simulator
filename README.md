# Foothill AstroSims: Pulsar Beam Intensity Simulator

https://foothillastrosims.github.io/pulsar-simulator/

Basic simulator demonstrating how the intensity of the beams emanating from a spinning pulsar varies based on parameters such as the pulsar period, latitude of the beams, and angular diameter. Created for use in Foothill College's ASTR 10A/B courses, but all are welcome to try it out!

## Features
- 3D model of the pulsar and the beams, built with Three.js
- Sliders, buttons, and checkboxes to control various pulsar parameters e.g phase, period, beam latitude, angular diameter
- Graphs of the beam intensity based on the phase (rotation of the pulsar) and the time
- "Sky view" depicting what an observer far away from the pulsar would detect
- Toggleable free camera mode
- Responsive UI based on screen/window size
- Works on Firefox, Chrome, and mobile browsers (Safari/Webkit does not currently work)

## Local deployment

Currently, the simulator uses:

- Node v25.6.1 as the runtime environment
- Vite v8.0.16 as the frontend server
- Vitest v4.1.9 for testing and CI
- pnpm v11 as the package manager.

Other versions of these may still work but are not guaranteed, so proceed at your own risk!

Run the following commands to deploy the app on your own device:

```bash
git clone git@github.com:FoothillAstroSims/pulsar-simulator.git
npm install -g pnpm@latest
pnpm install --frozen-lockfile
pnpm run dev
```

To run tests locally, run the previous commands, then run the following:

```bash
npx --no playwright install --with-deps --only-shell
pnpm run test
```

## Credits
This simulator was built by Steven Yuan for Foothill College's CS 77B course in spring 2026, with support from Dr. Baba Kofi Weusijana and Dr. Geoff Mathews.