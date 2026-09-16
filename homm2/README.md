# HoMM2 Save Editor

Single-page static web editor for Heroes of Might & Magic II save files.
It runs entirely in the browser: no .NET SDK, build step, server, or install is required.

## Run

Open [index.html](index.html) directly in a modern browser, then choose a `.GXC`,
`.GMC`, or `.savc` save file with **Open save file**.

The app edits the loaded save in browser memory. Use **Download Edited Save File** to export
the modified file, which is named like `SAVE.edited.GXC`, `SAVE.edited.GMC`, or `SAVE.edited.savc`.

## Supported formats

- `.GXC` Gold/expansion saves: hero, resources, roster ownership, visibility reveal, verified town editing, and barrier/Traveller's Tent discovery.
- `.GMC` standard campaign saves: detected as the original 54-hero format with a different hero table and resource offset. Hero fields, roster ownership, map visibility reveal, player resources, and mapped town fields are editable.
- `.savc` fheroes2 campaign saves: initial hero-editing support for save-format versions `10025` through `10034`. Requires a browser with `CompressionStream` and `DecompressionStream` support.

### fheroes2 Campaign Saves

The `.savc` format is not an original HoMM2 save with a different extension. It has
a versioned, big-endian header and a zlib-compressed world and campaign payload.
The editor parses variable-length hero records and exports a compressed `.savc`
without converting it to a legacy format.

Editable fields:

- Attack, Defense, Knowledge, and Spell Power
- Experience (fheroes2 derives the hero's level from experience)
- Spell points and current movement points
- Creature types and 32-bit counts in all five army slots
- All 14 secondary-skill choices, with None/Basic/Advanced/Expert levels; add or remove
	skills within fheroes2's limit of eight active skills per hero
- All 14 artifact slots, including empty slots and spell selection for spell scrolls;
	editor-only artifact placeholders are excluded and duplicate spell books are prevented

Names, portraits, ownership, learned spells, resources, towns, visibility, gates,
and campaign progress are preserved but are not editable for `.savc` yet.
Unsupported controls are omitted or read-only. Adding or removing secondary skills
resizes their serialized list and updates the offsets of later records. Untouched
artifact entries retain their metadata; replacing a scroll clears its old spell data.
All payload bytes outside the edited fields/lists and the original save header are preserved;
compressed bytes can differ after export. Unsupported versions and malformed headers
or compressed data are rejected. For an older save, open and re-save it in a supported
fheroes2 release first.

The layout is based on the [fheroes2 serialization source](https://github.com/ihhub/fheroes2),
including `game_io.cpp`, `heroes.cpp`, and `save_format_version.h`. Automated tests use
synthetic binary fixtures and verify decompressed byte preservation with independent
Node.js zlib checks, including repeated ID-zero placeholders for unused heroes.
Real version `10032` Succession Wars campaign saves have also been checked for browser
loading, skill addition/removal, artifact editing, and byte-preserving edit/export/reopen.
Loading an edited real campaign save
in fheroes2 itself has not yet been verified; keep a backup.

## What it edits

The following capabilities apply to the original `.GXC` and `.GMC` formats.

Verified fields only — all other bytes are preserved untouched. `.GMC` support currently covers
hero fields, roster ownership, visibility reveal, resources, and mapped town editing.

Global save data:

- Player resources: Wood, Mercury, Ore, Sulfur, Crystal, Gems, and Gold

Per hero:

- Name (max 13 ASCII chars)
- Owner assignment through the player hero rosters
- Portrait ID
- Class display (Knight … Necromancer) and level
- Experience
- Primary skills: Attack / Defense / Spell Power / Knowledge
- Secondary skills: Pathfinding, Archery, Logistics, Scouting, Diplomacy, Navigation, Leadership, Wisdom, Mysticism, Luck, Ballistics, Eagle Eye, Necromancy, and Estates levels
- Spell points and current-day movement values, including a refill-current-day action. Movement is recalculated by the game on a new day from army speed, skills, artifacts, and map bonuses.
- Army (5 slots: creature type ID + count)
- Artifact bag possession (14 slots, `0xFF` empty)
- Map visibility reveal for the hero's current owner

Per town:

- Building flags, including faction-specific dwellings, turrets, Marketplace, moat, Captain's Quarters, and special buildings; `.GMC` castle toggles also update the adventure-map exterior
- Faction info building and Tavern flags
- Mage Guild level
- Dwelling creature stock

For `.GXC` barriers and Traveller's Tents:

- The Gates tab groups barriers and Traveller's Tents by color instead of listing individual map objects.
- Each color shows all players with a checkbox for the matching tent visit. Changing a checkbox updates that player's duplicated visit mask; defeated players with no heroes or towns are disabled.
- The write format was confirmed with controlled saves made immediately before and after visiting a Green tent.

The record list can be filtered by name. Heroes can be filtered by class and owner;
towns can be filtered by town class and owner.
Hero ownership is primarily derived from the player roster blocks. For `.GXC` saves, if
a hero is not in a roster, the hero-record sentinel is used as a fallback: `0xFEFF`
means recruited, `0xFFFF` means recruitment pool. For recruited fallback heroes, byte
`+0x21` is treated as the owner player index: `0` Blue, `1` Green, `2` Red, `3` Yellow,
`4` Orange, `5` Purple. Standard `.GMC` campaign saves treat roster blocks as
authoritative because their hero-record ownership bytes can contain stale values.

## Detection

Each save type is detected through a format profile. `.GXC` heroes are anchored at `0x7FA`
with stride `0xFA`; `.GMC` standard-campaign heroes are anchored at `0x08ED` with stride
`0xEC`. Records are accepted when they match the header signature: printable ASCII name
padded with NULs, portrait ID < 128, and sentinel `0xFEFF` or `0xFFFF` at `+0x1F`.
Hero class is derived from the record's fixed table slot; byte `+0x33` stores hero level.

Town tables are also profile-based. `.GXC` town editing remains anchored at `0x3CFB`.
`.GMC` town records are identified from `0x3AFA`; mapped building flags, Mage Guild
level, dwelling stock, and castle exterior sprites are editable.

## Safety

- The browser does not overwrite the original file. Saving is export-based through a downloaded edited copy.
- Only fields listed above are written; unknown/unmapped regions are preserved byte-for-byte.
- Keep a backup of the original save before replacing it with an edited export.

## Tests

With Node.js 22 or newer installed, run `node --test savc.test.js` for the fheroes2
codec, version detection, corruption rejection, and hero edit round-trip tests.
Node.js is only needed for tests, not for running the editor.
