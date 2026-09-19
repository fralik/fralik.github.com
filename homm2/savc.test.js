"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { deflateSync, inflateSync } = require("node:zlib");
require("./savc.js");

function envelope(payload) {
  const compressed = deflateSync(payload);
  const bytes = Buffer.alloc(16 + compressed.length);
  bytes.set([0xFF, 0x03, 0xAB, 0xCD]);
  bytes.writeUInt32BE(payload.length, 4);
  bytes.writeUInt32BE(compressed.length, 8);
  bytes.set(compressed, 16);
  return bytes;
}

test("fheroes2 compression preserves header and payload through an edit", async () => {
  const original = envelope(Buffer.from([1, 2, 3, 4, 0xFF, 0x03]));
  const save = await Savc.unpack(original, 4);
  assert.deepEqual([...save.payload], [1, 2, 3, 4, 0xFF, 0x03]);
  save.payload[1] = 42;
  const edited = await Savc.pack(save);
  assert.deepEqual([...edited.subarray(0, 4)], [...original.subarray(0, 4)]);
  assert.deepEqual([...inflateSync(edited.subarray(16))], [1, 42, 3, 4, 0xFF, 0x03]);
  assert.deepEqual((await Savc.unpack(edited, 4)).payload, save.payload);
});

test("fheroes2 rejects truncated, oversized and damaged compressed payloads", async () => {
  const original = envelope(Buffer.from([1, 2, 0xFF, 0x03]));
  await assert.rejects(Savc.unpack(original.subarray(0, original.length - 1), 4));
  const oversized = Buffer.from(original);
  oversized.writeUInt32BE(0xFFFFFFFF, 4);
  await assert.rejects(Savc.unpack(oversized, 4));
  const damaged = Buffer.from(original);
  damaged[damaged.length - 1] ^= 1;
  await assert.rejects(Savc.unpack(damaged, 4));
  await assert.rejects(Savc.unpack(envelope(Buffer.from([1, 2, 3, 4])), 4));
});

test("binary reader checks bounds before advancing", () => {
  const reader = new Savc.Reader(new Uint8Array([0, 0, 0, 5]));
  assert.throws(() => reader.string(), /Truncated/);
  assert.throws(() => reader.skip(-1), /invalid/);
});

class Writer {
  constructor() { this.parts = []; }
  u8(value) { this.parts.push(Buffer.from([value])); return this; }
  u16(value) { const bytes = Buffer.alloc(2); bytes.writeUInt16BE(value); this.parts.push(bytes); return this; }
  u32(value) { const bytes = Buffer.alloc(4); bytes.writeUInt32BE(value >>> 0); this.parts.push(bytes); return this; }
  string(value) { const bytes = Buffer.from(value); this.u32(bytes.length); this.parts.push(bytes); return this; }
  bytes() { return Buffer.concat(this.parts); }
}

function header(version = 10034, mapVersion = 0) {
  const writer = new Writer();
  writer.u16(0xFF03).string(String(version)).u16(version).u16(0);
  writer.string("CAMPAIGN.MP2").string("Campaign fixture").string("Test map");
  writer.u16(36).u16(36).u8(1).u8(6);
  for (let player = 0; player < 6; player += 1) writer.u8(1).u8(1 << player);
  writer.u8(63).u8(1).u8(62).u8(0);
  writer.u8(0).u8(1).u8(1).u16(0).u16(0).u8(0).u16(0).u16(0);
  writer.u32(1234).u8(1).u32(mapVersion).u32(1).u32(1).u32(1).u8(0);
  if (version >= 10033) writer.string("Creator notes");
  writer.u32(2);
  return writer.bytes();
}

function puzzle(writer, pieces = "0".repeat(48)) {
  writer.string(pieces);
  for (let zone = 0; zone < 4; zone += 1) {
    writer.u8(12);
    for (let tile = 0; tile < 12; tile += 1) writer.u8(zone * 12 + tile);
  }
}

test("SAVC puzzle records validate visibility bits and tile ordering", () => {
  const writer = new Writer();
  puzzle(writer);
  const bytes = writer.bytes();
  const reader = new Savc.Reader(bytes);
  assert.deepEqual(reader.puzzle(), { offset: 4, revealed: false });
  assert.equal(reader.offset, bytes.length);
  bytes.fill(0x31, 4, 52);
  assert.equal(new Savc.Reader(bytes).puzzle().revealed, true);
  bytes[4] = 0x32;
  assert.throws(() => new Savc.Reader(bytes).puzzle(), /puzzle/);
  bytes[4] = 0x31;
  bytes[54] = bytes[53];
  assert.throws(() => new Savc.Reader(bytes).puzzle(), /puzzle tile/);
});

test("campaign headers locate compression after version-dependent fields", () => {
  for (const version of [10025, 10030, 10031, 10032, 10033, 10034]) {
    const bytes = header(version);
    assert.deepEqual(Savc.readHeader(bytes), {
      version, mapVersion: 0, mapName: "Campaign fixture", width: 36, height: 36, size: bytes.length
    });
  }
  assert.throws(() => Savc.readHeader(header(10024)), /Unsupported/);
  assert.throws(() => Savc.readHeader(header(10035)), /Unsupported/);
  const hotseat = header();
  hotseat.writeUInt32BE(4, hotseat.length - 4);
  assert.throws(() => Savc.readHeader(hotseat), /not a campaign/);
});

function campaign(version = 10034, heroIds = [0, 1], castleRace = 1, mapVersion = 0, castleBuildings = 0x00000800) {
  const writer = new Writer();
  const color = value => version < 10031 ? writer.u32(value) : writer.u8(value);
  writer.u32(36).u32(36).u32(36 * 36);
  for (let tile = 0; tile < 36 * 36; tile += 1) {
    writer.u32(tile).u16(0).u8(0).u16(511);
    writer.u8(0).u32(0).u8(0).u8(0).u16(0).u8(63);
    writer.u32(3).u32(0).u32(0).u32(0).u8(0).u8(0);
    writer.u32(1).u8(0).u32(123).u8(1).u8(2);
    writer.u32(0).u8(0);
  }
  writer.u32(heroIds.length);
  for (const hero of heroIds) {
    writer.u32(3).u32(4).u32(5).u32(6).u16(12).u16(13).u32(0).u32(50).u32(1200);
    writer.u32(2).u32(1).u32(2);
    writer.u32(14);
    for (let slot = 0; slot < 14; slot += 1) writer.u32(slot === 0 ? 87 : 0).u32(slot === 0 ? 15 : 0);
    writer.string(hero ? "Roland" : "Unknown");
    color(hero ? 1 : 0);
    writer.u32(5000).u32(2).u32(1).u32(2).u32(8).u32(1);
    writer.u32(5);
    for (let slot = 0; slot < 5; slot += 1) writer.u32(slot === 0 ? 1 : 0).u32(slot === 0 ? 20 : 0);
    writer.u8(1);
    color(0);
    writer.u32(hero).u32(hero).u32(1).u16(0);
    writer.u8(1).u32(1).u32(12).u32(2).u32(100);
    writer.u32(2).u32(18).u32(12).u32(13).u32(0);
    writer.u32(1).u32(456).u16(123).u32(7);
  }
  const tailOffset = writer.bytes().length;
  writer.u32(1);
  writer.u16(12).u16(14).u32(0).u32(castleRace).u32(castleBuildings).u32(0);
  writer.u32(1).u32(1).u32(1).u32(1).u16(12).u16(14).u32(0).u32(10).u32(0);
  writer.u32(1).u32(1).u32(1).u32(82).u32(0);
  color(1);
  writer.string("Castle fixture").u32(1).u32(1).u32(0);
  writer.u32(6);
  for (let dwelling = 0; dwelling < 6; dwelling += 1) writer.u32(10);
  writer.u32(5);
  for (let slot = 0; slot < 5; slot += 1) writer.u32(0).u32(0);
  writer.u8(1);
  color(1);
  writer.u32(7);
  for (let player = 0; player < 7; player += 1) {
    writer.u32(0);
    color(player < 6 ? 1 << player : 0);
    for (let resource = 0; resource < 7; resource += 1) writer.u32(100);
    writer.u32(7).u32(player < 2 ? 1 : 0);
    if (player < 2) writer.u32(516);
    writer.u32(0).u32(0).u32(0).u32(0).u32(0);
    writer.u32(1).u32(400).u16(123);
    puzzle(writer, player === 1 ? "10".repeat(24) : "0".repeat(48));
    writer.u32(3).u32(0).u32(0);
    if (version >= 10034) writer.u32(1).u32(123);
  }
  writer.u32(1).string("Rumor fixture").u32(1);
  for (let resource = 0; resource < 7; resource += 1) writer.u32(100);
  writer.u8(1).u32(2).u32(7);
  color(63);
  writer.string("Event message").string("Event title");
  writer.u32(5);
  for (const [index, type, owner] of [[100, 149, 1], [200, 149, 1], [300, 149, 2], [400, 149, 0], [500, 151, 1]]) {
    writer.u32(index).u16(type);
    color(owner);
    writer.u32(1).u32(20);
  }
  writer.string("Untouched artifact, settings and campaign data").u16(0xFF03);
  const payload = writer.bytes();
  const prefix = header(version, mapVersion);
  const wrapped = envelope(payload);
  return { bytes: Buffer.concat([prefix, wrapped.subarray(4)]), payload, tailOffset };
}

test("SAVC movement matches army speed, skills, artifacts and location bonuses", async () => {
  const hero = (await Savc.open(campaign().bytes)).heroes[0];
  assert.equal(Savc.getMaxMovePoints(hero), 1000);
  for (const [type, expected] of [[1, 1000], [14, 1100], [3, 1200], [5, 1300], [8, 1400], [9, 1500], [66, 1200]]) {
    hero.army[0].type = type;
    assert.equal(Savc.getMaxMovePoints(hero), expected);
  }
  hero.army[0].type = 9;
  hero.army[1] = { type: 14, count: 1 };
  hero.secondary = [{ id: 3, level: 3 }];
  assert.equal(Savc.getMaxMovePoints(hero), 1430);
  hero.army[1].count = 0;
  assert.equal(Savc.getMaxMovePoints(hero), 1950);
  hero.artifacts = [34, 34, 35, 40, 41].map(id => ({ id }));
  hero.visitedObjects = [{ type: 145 }, { type: 145 }];
  assert.equal(Savc.getMaxMovePoints(hero, 2), 3750);
  hero.modes = 1;
  for (const [level, expected] of [[0, 1500], [1, 2000], [2, 2500], [3, 3000]]) {
    hero.secondary = [{ id: 3, level: 3 }, { id: 6, level }];
    assert.equal(Savc.getMaxMovePoints(hero, 2), expected + 2500);
  }
  hero.modes = 0;
  hero.army = [];
  hero.artifacts = [];
  hero.visitedObjects = [];
  assert.equal(Savc.getMaxMovePoints(hero), 0);
});

test("SAVC refill writes only current movement after collection resizing", async () => {
  for (let version = 10025; version <= 10034; version += 1) {
    const save = await Savc.open(campaign(version, [0, 1, 0, 2, 0]).bytes);
    assert.deepEqual(save.capturedObjects[0], { index: 100, type: 149, color: 1 });
    Savc.setSecondarySkill(save, 1, 3, 3);
    Savc.setArtifact(save, 1, 1, 34);
    let expected = Buffer.from(save.payload);
    expected.writeUInt32BE(1900, save.heroes[0].fields.movePoints.offset);
    assert.equal(Savc.refillMovement(save, 1), 1900);
    assert.equal(save.heroes[0].movePoints, 1900);
    assert.deepEqual(Buffer.from((await Savc.open(await Savc.pack(save))).payload), expected);
    Savc.setSecondarySkill(save, 1, 6, 2);
    Savc.setArtifact(save, 1, 2, 41);
    const hero = save.heroes[0];
    hero.modes |= 1;
    Savc.writeValue(save, hero.fileOffset + 20, hero.modes);
    expected = Buffer.from(save.payload);
    expected.writeUInt32BE(4500, hero.fields.movePoints.offset);
    assert.equal(Savc.refillMovement(save, 1), 4500);
    assert.equal(Savc.refillMovement(save, 1), 4500);
    assert.throws(() => Savc.refillMovement(save, 0), /Invalid/);
    const reopened = await Savc.open(await Savc.pack(save));
    assert.deepEqual(Buffer.from(reopened.payload), expected);
    assert.equal(reopened.heroes[1].movePoints, 1200);
    assert.equal(Savc.refillMovement(reopened, 1), 4500);
  }
});

test("SAVC hero edits round-trip without changing unrelated payload bytes", async () => {
  for (const version of [10025, 10030, 10031, 10032, 10033, 10034]) {
    const fixture = campaign(version);
    const save = await Savc.open(fixture.bytes);
    assert.equal(save.tailOffset, fixture.tailOffset);
    assert.equal(save.heroes.length, 1);
    const hero = save.heroes[0];
    assert.equal(hero.name, "Roland");
    assert.equal(hero.ownerPlayerId, 0);
    assert.equal(hero.knowledge, 5);
    assert.equal(hero.spellPower, 6);
    assert.equal(hero.positionX, 12);
    assert.equal(hero.modes, 0);
    assert.deepEqual(hero.visitedObjects, [{ index: 456, type: 123 }]);
    assert.equal(hero.army[0].count, 20);
    const edits = [[hero.fields.attack.offset, 99], [hero.fields.movePoints.offset, 4000],
      [hero.army[0].countOffset, 100000], [hero.secondary[0].offset, 3]];
    for (const [offset, value] of edits) Savc.writeValue(save, offset, value);
    const output = await Savc.pack(save);
    const reopened = await Savc.open(output);
    assert.equal(reopened.heroes[0].attack, 99);
    assert.equal(reopened.heroes[0].movePoints, 4000);
    assert.equal(reopened.heroes[0].army[0].count, 100000);
    assert.equal(reopened.heroes[0].secondary[0].level, 3);
    assert.equal(reopened.heroes[0].artifacts[0].metadata, 15);
    const expected = Buffer.from(fixture.payload);
    for (const [offset, value] of edits) expected.writeUInt32BE(value, offset);
    assert.deepEqual(Buffer.from(reopened.payload), expected);
    assert.deepEqual(output.subarray(0, save.size), new Uint8Array(fixture.bytes.subarray(0, save.size)));
  }
});

test("SAVC town buildings and dwelling stock round-trip without changing unrelated bytes", async () => {
  for (let version = 10025; version <= 10034; version += 1) {
    const fixture = campaign(version);
    const save = await Savc.open(fixture.bytes);
    assert.equal(save.towns.length, 1);
    const town = save.towns[0];
    assert.equal(town.name, "Castle fixture");
    assert.equal(town.factionId, 0);
    assert.equal(town.ownerPlayerId, 0);
    assert.deepEqual(town.dwellingStock, [10, 10, 10, 10, 10, 10]);

    const buildings = 0x7FF1C880;
    Savc.setTownBuildings(save, town.index, buildings);
    Savc.setTownDwelling(save, town.index, 0, 123456);
    Savc.setTownDwelling(save, town.index, 5, 0xFFFFFFFF);
    assert.throws(() => Savc.setTownDwelling(save, town.index, 6, 1), /dwelling/);

    const expected = Buffer.from(fixture.payload);
    expected.writeUInt32BE(buildings, town.fields.buildings.offset);
    expected.writeUInt32BE(123456, town.fields.dwelling0.offset);
    expected.writeUInt32BE(0xFFFFFFFF, town.fields.dwelling5.offset);
    const reopened = await Savc.open(await Savc.pack(save));
    assert.deepEqual(Buffer.from(reopened.payload), expected);
    assert.equal(reopened.towns[0].buildFlags, buildings);
    assert.deepEqual(reopened.towns[0].dwellingStock, [123456, 10, 10, 10, 10, 0xFFFFFFFF]);
  }
});

test("SAVC rejects town building combinations that can crash the Well", async () => {
  const races = [1, 2, 4, 8, 16, 32];
  const allowedUpgrades = [0x7C000000, 0x34000000, 0x1C000000, 0xD0000000, 0x68000000, 0x3C000000];
  for (let factionId = 0; factionId < races.length; factionId += 1) {
    const save = await Savc.open(campaign(10034, [0, 1], races[factionId], factionId === 5 ? 1 : 0).bytes);
    const town = save.towns[0];
    assert.equal(Savc.getTownBuildingRules(save, town).allowedUpgrades, allowedUpgrades[factionId]);
    const original = Buffer.from(save.payload);
    const invalidUpgrade = [0x80000000, 0x08000000, 0x20000000, 0x04000000, 0x10000000, 0x40000000][factionId];
    assert.throws(() => Savc.setTownBuildings(save, town.index, town.buildFlags | invalidUpgrade), /faction/);
    assert.deepEqual(Buffer.from(save.payload), original);
  }

  const save = await Savc.open(campaign().bytes);
  const town = save.towns[0];
  assert.throws(() => Savc.setTownBuildings(save, town.index, town.buildFlags | 0x04000000), /Dwelling 2/);
  assert.throws(() => Savc.setTownBuildings(save, town.index, town.buildFlags | 0x00008000), /cumulative/);
  assert.throws(() => Savc.setTownBuildings(save, town.index, town.buildFlags ^ 0x00000800), /Castle/);
  assert.throws(() => Savc.setTownBuildings(save, town.index, town.buildFlags | 0x00000004), /Shipyard/);
  assert.throws(() => Savc.setTownBuildings(save, town.index, town.buildFlags | 0x00001000), /Captain/);

  Savc.setTownBuildings(save, town.index, town.buildFlags | 0x00200000 | 0x04000000);
  assert.equal(town.buildFlags, 0x04200800);

  const successionNecromancer = await Savc.open(campaign(10034, [0, 1], 32).bytes);
  const successionTown = successionNecromancer.towns[0];
  assert.throws(() => Savc.setTownBuildings(successionNecromancer, successionTown.index, successionTown.buildFlags | 0x00000002), /Tavern/);
  assert.throws(() => Savc.setTownBuildings(successionNecromancer, successionTown.index, successionTown.buildFlags | 0x00002000), /Shrine/);

  const loyaltyNecromancer = await Savc.open(campaign(10034, [0, 1], 32, 1).bytes);
  const loyaltyTown = loyaltyNecromancer.towns[0];
  Savc.setTownBuildings(loyaltyNecromancer, loyaltyTown.index, loyaltyTown.buildFlags | 0x00002000);
  assert.equal(loyaltyTown.buildFlags, 0x00002800);

  const tentSave = await Savc.open(campaign(10034, [0, 1], 1, 0, 0x00080000).bytes);
  const tentTown = tentSave.towns[0];
  assert.throws(() => Savc.setTownBuildings(tentSave, tentTown.index, tentTown.buildFlags | 0x00000008), /until the town has a Castle/);

  const contradictorySave = await Savc.open(campaign(10034, [0, 1], 1, 0, 0x00080800).bytes);
  const contradictoryTown = contradictorySave.towns[0];
  assert.throws(() => Savc.setTownBuildings(contradictorySave, contradictoryTown.index, contradictoryTown.buildFlags), /either a Castle or a construction Tent/);
});

test("SAVC puzzle reveal changes only the selected player's visibility bytes", async () => {
  for (let version = 10025; version <= 10034; version += 1) {
    const save = await Savc.open(campaign(version).bytes);
    assert.equal(save.kingdoms.length, 7);
    assert.throws(() => Savc.revealPuzzle(save, 0), /active/);
    assert.throws(() => Savc.revealPuzzle(save, 4), /active/);
    assert.throws(() => Savc.revealPuzzle(save, 3), /active/);
    Savc.setSecondarySkill(save, 1, 14, 3);
    const expected = Buffer.from(save.payload);
    const offset = save.kingdoms[1].puzzle.offset;
    expected.fill(0x31, offset, offset + 48);
    Savc.revealPuzzle(save, 2);
    Savc.revealPuzzle(save, 2);
    const reopened = await Savc.open(await Savc.pack(save));
    assert.deepEqual(Buffer.from(reopened.payload), expected);
    assert.equal(reopened.kingdoms[1].puzzle.revealed, true);
    assert.equal(reopened.kingdoms[0].puzzle.revealed, false);
    Savc.setSecondarySkill(reopened, 1, 14, 0);
    assert.equal(reopened.kingdoms[1].puzzle.revealed, true);
  }
});

test("SAVC kingdom resources round-trip without changing unrelated bytes", async () => {
  for (let version = 10025; version <= 10034; version += 1) {
    const save = await Savc.open(campaign(version).bytes);
    Savc.setSecondarySkill(save, 1, 14, 3);
    const green = save.kingdoms.find(kingdom => kingdom.color === 2);
    assert.deepEqual(green.resources, {
      Wood: 100, Mercury: 100, Ore: 100, Sulfur: 100, Crystal: 100, Gems: 100, Gold: 100
    });
    const expected = Buffer.from(save.payload);
    expected.writeUInt32BE(123456, green.resourceFields.Gold.offset);
    Savc.setKingdomResource(save, 2, "Gold", 123456);
    assert.equal(green.resources.Gold, 123456);
    assert.deepEqual(Buffer.from(save.payload), expected);
    const reopened = await Savc.open(await Savc.pack(save));
    assert.deepEqual(Buffer.from(reopened.payload), expected);
    assert.equal(reopened.kingdoms.find(kingdom => kingdom.color === 2).resources.Gold, 123456);
    assert.throws(() => Savc.setKingdomResource(save, 4, "Gold", 1), /active/);
    assert.throws(() => Savc.setKingdomResource(save, 2, "Mithril", 1), /resource/);
    assert.throws(() => Savc.setKingdomResource(save, 2, "Gold", -1), /field value/);
  }
});

test("SAVC accepts repeated unknown hero placeholders and preserves them during edits", async () => {
  for (const version of [10025, 10030, 10031, 10032, 10033, 10034]) {
    const fixture = campaign(version, [0, 1, 0, 2, 0]);
    const save = await Savc.open(fixture.bytes);
    assert.deepEqual(save.heroes.map(hero => [hero.index, hero.id]), [[1, 1], [3, 2]]);
    assert.equal(save.tailOffset, fixture.tailOffset);
    const offset = save.heroes[1].fields.attack.offset;
    Savc.writeValue(save, offset, 42, 99);
    const reopened = await Savc.open(await Savc.pack(save));
    assert.equal(reopened.heroes[1].attack, 42);
    const expected = Buffer.from(fixture.payload);
    expected.writeUInt32BE(42, offset);
    assert.deepEqual(Buffer.from(reopened.payload), expected);
  }
});

test("SAVC still rejects duplicate nonzero and out-of-range hero IDs", async () => {
  for (const heroIds of [[0, 1, 1], [0, -1], [0, 2]]) {
    await assert.rejects(Savc.open(campaign(10032, heroIds).bytes), /Invalid fheroes2 hero ID/);
  }
});

test("SAVC validates writes and malformed world data", async () => {
  const save = await Savc.open(campaign().bytes);
  for (const value of [-1, 1.5, NaN, Infinity, 0x100000000]) {
    assert.throws(() => Savc.writeValue(save, save.heroes[0].fields.attack.offset, value));
  }
  assert.throws(() => Savc.writeValue(save, save.payload.length, 1));
  save.payload[3] = 72;
  await assert.rejects(Savc.open(await Savc.pack(save)), /dimensions/);
});

test("SAVC adds and removes skills while preserving later records and campaign bytes", async () => {
  for (const version of [10025, 10030, 10031, 10032, 10033, 10034]) {
    const fixture = campaign(version, [0, 1, 0, 2, 0]);
    const save = await Savc.open(fixture.bytes);
    const originalHero = save.heroes[0];
    const offset = originalHero.secondaryOffset;
    const end = offset + 4 + originalHero.secondary.length * 8;
    Savc.setSecondarySkill(save, 1, 14, 3);
    const added = new Writer().u32(3).u32(1).u32(2).u32(8).u32(1).u32(14).u32(3).bytes();
    const expected = Buffer.concat([fixture.payload.subarray(0, offset), added, fixture.payload.subarray(end)]);
    assert.deepEqual(Buffer.from(save.payload), expected);
    assert.equal(save.tailOffset, fixture.tailOffset + 8);
    const laterHero = save.heroes[1];
    Savc.writeValue(save, laterHero.fields.attack.offset, 42, 99);
    expected.writeUInt32BE(42, laterHero.fields.attack.offset);
    assert.deepEqual(Buffer.from((await Savc.open(await Savc.pack(save))).payload), expected);
    Savc.setSecondarySkill(save, 1, 14, 0);
    const restored = Buffer.from(fixture.payload);
    restored.writeUInt32BE(42, save.heroes[1].fields.attack.offset);
    assert.deepEqual(Buffer.from(save.payload), restored);
    Savc.setSecondarySkill(save, 1, 1, 0);
    Savc.setSecondarySkill(save, 1, 8, 0);
    assert.equal(save.heroes[0].secondary.length, 0);
    Savc.setSecondarySkill(save, 1, 5, 1);
    const reopened = await Savc.open(await Savc.pack(save));
    assert.deepEqual(reopened.heroes[0].secondary.map(skill => [skill.id, skill.level]), [[5, 1]]);
    assert.equal(reopened.heroes[1].attack, 42);
  }
});

test("SAVC enforces eight active secondary skills without mutating rejected edits", async () => {
  const save = await Savc.open(campaign().bytes);
  for (let skillId = 2; skillId <= 7; skillId += 1) Savc.setSecondarySkill(save, 1, skillId, 3);
  assert.equal(save.heroes[0].secondary.length, 8);
  const before = save.payload.slice();
  assert.throws(() => Savc.setSecondarySkill(save, 1, 14, 1), /eight/);
  for (const [heroId, skillId, level] of [[0, 1, 1], [1, 0, 1], [1, 15, 1], [1, 1, 4], [1, 1, -1], [1, 1, 1.5]]) {
    assert.throws(() => Savc.setSecondarySkill(save, heroId, skillId, level), /Invalid/);
  }
  assert.deepEqual(save.payload, before);
  Savc.setSecondarySkill(save, 1, 1, 0);
  Savc.setSecondarySkill(save, 1, 14, 1);
  assert.equal(save.heroes[0].secondary.length, 8);
});

test("SAVC edits all artifact slots after skill resizing and preserves other metadata", async () => {
  for (const version of [10025, 10030, 10031, 10032, 10033, 10034]) {
    const save = await Savc.open(campaign(version, [0, 1, 0, 2, 0]).bytes);
    Savc.setSecondarySkill(save, 1, 14, 3);
    const expected = Buffer.from(save.payload);
    const offset = save.heroes[0].artifactsOffset + 4;
    for (let slot = 1; slot < 14; slot += 1) {
      Savc.setArtifact(save, 1, slot, slot);
      expected.writeInt32BE(slot, offset + slot * 8);
    }
    assert.deepEqual(Buffer.from(save.payload), expected);
    assert.equal(save.heroes[0].artifacts[0].metadata, 15);
    Savc.setArtifact(save, 1, 13, 87, 57);
    expected.writeInt32BE(87, offset + 13 * 8);
    expected.writeInt32BE(57, offset + 13 * 8 + 4);
    Savc.setArtifact(save, 1, 0, 0);
    expected.writeInt32BE(0, offset);
    expected.writeInt32BE(0, offset + 4);
    const reopened = await Savc.open(await Savc.pack(save));
    assert.deepEqual(Buffer.from(reopened.payload), expected);
    assert.deepEqual(reopened.heroes[0].artifacts[13], { id: 87, metadata: 57 });
    Savc.setArtifact(reopened, 1, 13, 103);
    assert.deepEqual(reopened.heroes[0].artifacts[13], { id: 103, metadata: 0 });
  }
});

test("SAVC validates artifact choices, spell scrolls, and duplicate spell books", async () => {
  const save = await Savc.open(campaign().bytes);
  const before = save.payload.slice();
  for (const [slot, artifactId, spellId] of [[-1, 1], [14, 1], [0, -1], [0, 104], [0, 83], [0, 86], [0, 1.5],
    [0, 87, 0], [0, 87, 66], [0, 87, 1.5], [0, 1, 1]]) {
    assert.throws(() => Savc.setArtifact(save, 1, slot, artifactId, spellId), /Invalid|Only/);
  }
  assert.deepEqual(save.payload, before);
  Savc.setArtifact(save, 1, 1, 82);
  const withBook = save.payload.slice();
  assert.throws(() => Savc.setArtifact(save, 1, 2, 82), /one spell book/);
  assert.deepEqual(save.payload, withBook);
  Savc.setArtifact(save, 1, 1, 0);
  Savc.setArtifact(save, 1, 2, 82);
  Savc.setArtifact(save, 1, 3, 87);
  assert.deepEqual(save.heroes[0].artifacts[3], { id: 87, metadata: 1 });
});