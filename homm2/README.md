# HoMM2 Save Editor

Single-page static web editor for Heroes of Might & Magic II save files.
It runs entirely in the browser: no .NET SDK, build step, server, or install is required.

## Run

Open [web/index.html](web/index.html) directly in a modern browser, then choose a `.GXC`
or `.GMC` save file with **Open save file**.

The app edits the loaded save in browser memory. Use **Download Edited Save File** to export
the modified file, which is named like `SAVE.edited.GXC` or `SAVE.edited.GMC`.

## Supported formats

- `.GXC` Gold/expansion saves: hero, resources, roster ownership, visibility reveal, and verified town editing.
- `.GMC` standard campaign saves: detected as the original 54-hero format with a different hero table and resource offset. Hero fields, roster ownership, map visibility reveal, player resources, and mapped town fields are editable.

## What it edits

Verified fields only — all other bytes are preserved untouched. `.GMC` support currently covers
hero fields, roster ownership, visibility reveal, resources, and mapped town editing.

Global save data:

- Player resources: Wood, Mercury, Ore, Sulfur, Crystal, Gems, and Gold

Per hero:

- Name (max 13 ASCII chars)
- Owner assignment through the player hero rosters
- Portrait ID
- Class (Knight … Necromancer)
- Experience
- Primary skills: Attack / Defense / Spell Power / Knowledge
- Spell points and current-day movement values, including a refill-current-day action. Movement is recalculated by the game on a new day from army speed, skills, artifacts, and map bonuses.
- Army (5 slots: creature type ID + count)
- Artifact bag possession (14 slots, `0xFF` empty)
- Map visibility reveal for the hero's current owner

Per town:

- Building flags, including faction-specific dwellings, turrets, Marketplace, moat, Captain's Quarters, and special buildings
- Faction info building and Tavern flags
- Mage Guild level
- Dwelling creature stock

The record list can be filtered by name. Heroes can also be filtered by class and owner.
Hero ownership is primarily derived from the player roster blocks. If a hero is not in a
roster, the hero-record sentinel is used as a fallback: `0xFEFF` means recruited,
`0xFFFF` means recruitment pool. For recruited heroes, byte `+0x21` is treated as the
owner player index: `0` Blue, `1` Green, `2` Red, `3` Yellow, `4` Orange, `5` Purple.

## Detection

Each save type is detected through a format profile. `.GXC` heroes are anchored at `0x7FA`
with stride `0xFA`; `.GMC` standard-campaign heroes are anchored at `0x08ED` with stride
`0xEC`. Records are accepted when they match the header signature: printable ASCII name
padded with NULs, portrait ID < 128, sentinel `0xFEFF` or `0xFFFF` at `+0x1F`, and class
byte < 16.

Town tables are also profile-based. `.GXC` town editing remains anchored at `0x3CFB`.
`.GMC` town records are currently identified from `0x3AFA` for display and raw-byte inspection.

## Safety

- The browser does not overwrite the original file. Saving is export-based through a downloaded edited copy.
- Only fields listed above are written; unknown/unmapped regions are preserved byte-for-byte.
- Keep a backup of the original save before replacing it with an edited export.
