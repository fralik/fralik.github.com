# Talk Counter

Single-page static timer for managing talks, presentations, and timed discussions.
It runs entirely in the browser: no build step, server, or install is required.

## Run

Open [index.html](index.html) directly in a modern browser.

The app stores settings in browser local storage so your timing preferences are restored the next time you open it in the same browser.

## Modes

- Forward counter: counts up from zero for open-ended talks or discussions.
- Countdown timer: counts down from a configured duration for scheduled sessions.

The display changes phase color as the timer progresses so it can be read from a distance during a talk.

## Controls

Use the on-screen controls or keyboard shortcuts:

- `S`: start or stop the timer
- `P`: pause or resume
- `F`: enter or exit fullscreen
- `H`: open help
- `Ctrl+,`: open settings

## Settings

The settings dialog controls timer mode, durations, and phase thresholds. Changes are saved locally in the browser and do not leave the device.
