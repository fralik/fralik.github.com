(function (root) {
  "use strict";

  const MAX_SAVE_SIZE = 64 * 1024 * 1024;
  const ARTIFACT = { empty: 0, spellBook: 82, spellScroll: 87, maximum: 103 };
  const RESOURCE_NAMES = ["Wood", "Mercury", "Ore", "Sulfur", "Crystal", "Gems", "Gold"];
  const TOWN_BUILDING = {
    thievesGuild: 0x00000001, tavern: 0x00000002, shipyard: 0x00000004, well: 0x00000008,
    statue: 0x00000010, leftTurret: 0x00000020, rightTurret: 0x00000040, marketplace: 0x00000080,
    growth: 0x00000100, moat: 0x00000200, special: 0x00000400, castle: 0x00000800,
    captain: 0x00001000, shrine: 0x00002000, mageGuild: 0x0007C000, tent: 0x00080000,
    dwelling1: 0x00100000, dwelling2: 0x00200000, dwelling3: 0x00400000,
    dwelling4: 0x00800000, dwelling5: 0x01000000, dwelling6: 0x02000000,
    upgrade2: 0x04000000, upgrade3: 0x08000000, upgrade4: 0x10000000,
    upgrade5: 0x20000000, upgrade6: 0x40000000, upgrade7: 0x80000000
  };
  const TOWN_UPGRADES = [
    TOWN_BUILDING.upgrade2 | TOWN_BUILDING.upgrade3 | TOWN_BUILDING.upgrade4 | TOWN_BUILDING.upgrade5 | TOWN_BUILDING.upgrade6,
    TOWN_BUILDING.upgrade2 | TOWN_BUILDING.upgrade4 | TOWN_BUILDING.upgrade5,
    TOWN_BUILDING.upgrade2 | TOWN_BUILDING.upgrade3 | TOWN_BUILDING.upgrade4,
    TOWN_BUILDING.upgrade4 | TOWN_BUILDING.upgrade6 | TOWN_BUILDING.upgrade7,
    TOWN_BUILDING.upgrade3 | TOWN_BUILDING.upgrade5 | TOWN_BUILDING.upgrade6,
    TOWN_BUILDING.upgrade2 | TOWN_BUILDING.upgrade3 | TOWN_BUILDING.upgrade4 | TOWN_BUILDING.upgrade5,
    0xFC000000
  ].map(value => value >>> 0);
  const CREATURE_MOVEMENT = [
    0, 1000, 1000, 1200, 1200, 1300, 1200, 1300, 1400, 1500, 1300, 1400,
    1200, 1000, 1100, 1400, 1000, 1200, 1200, 1300, 1300,
    1200, 1000, 1200, 1200, 1400, 1300, 1400, 1300, 1500,
    1200, 1400, 1200, 1200, 1400, 1000, 1200, 1300, 1400,
    1100, 1400, 1000, 1100, 1200, 1300, 1400, 1200, 1400,
    1200, 1000, 1200, 1200, 1300, 1200, 1300, 1300, 1400, 1200,
    1300, 1400, 1300, 1400, 1200, 1100, 1400, 1300, 1200
  ];

  function getMaxMovePoints(hero, lighthouseCount = 0) {
    const onWater = (hero.modes & 1) !== 0;
    const skillId = onWater ? 6 : 3;
    const level = hero.secondary.find(skill => skill.id === skillId)?.level || 0;
    const troops = hero.army.filter(troop => troop.type > 0 && troop.count > 0);
    const base = onWater ? 1500 : troops.length ? Math.min(...troops.map(troop => CREATURE_MOVEMENT[troop.type])) : 0;
    let movement = onWater ? Math.floor(base * (3 + level) / 3) : base + Math.floor(base * level / 10);
    const bonuses = onWater ? { 40: 500, 41: 1000 } : { 34: 600, 35: 300, 40: 500 };
    for (const artifactId of new Set(hero.artifacts.map(artifact => artifact.id))) {
      movement += bonuses[artifactId] || 0;
    }
    if (onWater) movement += 500 * lighthouseCount;
    else if (hero.visitedObjects.some(object => object.type === 145)) movement += 400;
    return movement;
  }

  class Reader {
    constructor(bytes) {
      this.bytes = bytes;
      this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      this.offset = 0;
    }

    skip(size) {
      if (!Number.isSafeInteger(size) || size < 0 || this.offset + size > this.bytes.length) {
        throw new Error("Truncated or invalid fheroes2 save.");
      }
      const offset = this.offset;
      this.offset += size;
      return offset;
    }

    u8() { return this.view.getUint8(this.skip(1)); }
    u16() { return this.view.getUint16(this.skip(2)); }
    i16() { return this.view.getInt16(this.skip(2)); }
    u32() { return this.view.getUint32(this.skip(4)); }
    i32() { return this.view.getInt32(this.skip(4)); }

    string() {
      const length = this.u32();
      const offset = this.skip(length);
      return new TextDecoder("windows-1252").decode(this.bytes.subarray(offset, offset + length));
    }

    puzzle() {
      const offset = this.offset + 4;
      const pieces = this.string();
      if (!/^[01]{48}$/.test(pieces)) throw new Error("Invalid fheroes2 puzzle map.");
      const tiles = new Set();
      for (let zone = 0; zone < 4; zone += 1) {
        const size = this.u8();
        if (size > 48) throw new Error("Invalid fheroes2 puzzle zone.");
        for (let piece = 0; piece < size; piece += 1) {
          const tile = this.u8();
          if (tile >= 48 || tiles.has(tile)) throw new Error("Invalid fheroes2 puzzle tile.");
          tiles.add(tile);
        }
      }
      if (tiles.size !== 48) throw new Error("Incomplete fheroes2 puzzle zones.");
      return { offset, revealed: pieces === "1".repeat(48) };
    }

    count(maximum) {
      const count = this.u32();
      if (count > maximum) throw new Error("Invalid fheroes2 collection size.");
      return count;
    }
  }

  async function transform(bytes, compress, limit) {
    const Stream = compress ? root.CompressionStream : root.DecompressionStream;
    if (!Stream) throw new Error("This browser does not support fheroes2 save compression. Use a current browser.");
    const reader = new Blob([bytes]).stream().pipeThrough(new Stream("deflate")).getReader();
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.length;
        if (size > limit) throw new Error("Invalid or oversized fheroes2 payload.");
        chunks.push(chunk.value);
      }
    } finally {
      await reader.cancel();
    }
    const result = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }

  async function unpack(bytes, headerSize) {
    const reader = new Reader(bytes);
    reader.skip(headerSize);
    const rawSize = reader.u32();
    const zipSize = reader.u32();
    const compressionVersion = reader.u16();
    reader.skip(2);
    if (rawSize < 2 || rawSize > MAX_SAVE_SIZE || !zipSize || compressionVersion !== 0 || reader.offset + zipSize !== bytes.length) {
      throw new Error("Invalid fheroes2 compression header.");
    }
    const payload = await transform(bytes.subarray(reader.offset), false, rawSize);
    if (payload.length !== rawSize || payload[payload.length - 2] !== 0xFF || payload[payload.length - 1] !== 0x03) {
      throw new Error("Invalid fheroes2 payload length or end marker.");
    }
    return { prefix: bytes.slice(0, headerSize + 12), payload };
  }

  async function pack(save) {
    const compressed = await transform(save.payload, true, MAX_SAVE_SIZE);
    const bytes = new Uint8Array(save.prefix.length + compressed.length);
    bytes.set(save.prefix);
    const view = new DataView(bytes.buffer);
    view.setUint32(save.prefix.length - 12, save.payload.length);
    view.setUint32(save.prefix.length - 8, compressed.length);
    bytes.set(compressed, save.prefix.length);
    return bytes;
  }

  function readHeader(bytes) {
    const reader = new Reader(bytes);
    if (reader.u16() !== 0xFF03) throw new Error("Not an fheroes2 save file.");
    const versionText = reader.string();
    const version = reader.u16();
    if (versionText !== String(version) || version < 10025 || version > 10034) {
      throw new Error(`Unsupported fheroes2 save version ${version}. Supported versions: 10025-10034.`);
    }
    reader.skip(2);
    reader.string();
    const mapName = reader.string();
    reader.string();
    const width = reader.u16();
    const height = reader.u16();
    reader.skip(1);
    if (reader.u8() !== 6) throw new Error("Invalid fheroes2 player count.");
    reader.skip(12);
    reader.skip(4 + 3 + 4 + 1 + 4 + 4 + 1);
    const mapVersion = reader.i32();
    if (mapVersion < 0 || mapVersion > 2) throw new Error("Invalid fheroes2 map version.");
    reader.skip(12 + 1);
    if (version >= 10033) reader.string();
    if (!(reader.u32() & 0x02)) throw new Error("This fheroes2 save is not a campaign save.");
    if (width < 1 || width > 144 || width !== height) throw new Error("Unsupported fheroes2 map dimensions.");
    return { version, mapVersion, mapName, width, height, size: reader.offset };
  }

  function readColor(reader, version) {
    const color = version < 10031 ? reader.u32() : reader.u8();
    if (![0, 1, 2, 4, 8, 16, 32, 64].includes(color)) throw new Error("Invalid fheroes2 player color.");
    return color;
  }

  function readArmy(reader, version) {
    if (reader.count(5) !== 5) throw new Error("Invalid fheroes2 army size.");
    const army = [];
    for (let slot = 0; slot < 5; slot += 1) {
      const typeOffset = reader.offset;
      const type = reader.i32();
      const countOffset = reader.offset;
      const count = reader.u32();
      if (type < 0 || type > 66) throw new Error("Unsupported fheroes2 creature ID.");
      army.push({ type, count, typeOffset, countOffset });
    }
    reader.skip(1);
    readColor(reader, version);
    return army;
  }

  function readHero(reader, version, index) {
    const hero = { index, fileOffset: reader.offset, fields: {}, secondary: [], artifacts: [] };
    for (const property of ["attack", "defense", "knowledge", "spellPower"]) {
      hero.fields[property] = { offset: reader.offset, max: 99 };
      hero[property] = reader.i32();
    }
    hero.positionX = reader.i16();
    hero.positionY = reader.i16();
    hero.modes = reader.u32();
    for (const property of ["spellPoints", "movePoints"]) {
      hero.fields[property] = { offset: reader.offset, max: 0xFFFFFFFF };
      hero[property] = reader.u32();
    }
    reader.skip(reader.count(256) * 4);
    hero.artifactsOffset = reader.offset;
    const artifactCount = reader.count(14);
    for (let slot = 0; slot < artifactCount; slot += 1) {
      hero.artifacts.push({ id: reader.i32(), metadata: reader.i32() });
    }
    hero.name = reader.string();
    const color = readColor(reader, version);
    hero.ownerPlayerId = color > 0 && color < 64 ? Math.log2(color) : null;
    hero.isRecruited = hero.ownerPlayerId !== null;
    hero.fields.experience = { offset: reader.offset, max: 0xFFFFFFFF };
    hero.experience = reader.u32();
    hero.secondaryOffset = reader.offset;
    const skillCount = reader.count(8);
    for (let slot = 0; slot < skillCount; slot += 1) {
      const id = reader.i32();
      const offset = reader.offset;
      const level = reader.i32();
      if (id < 0 || id > 14 || level < 0 || level > 3) throw new Error("Invalid fheroes2 secondary skill.");
      hero.secondary.push({ id, level, offset });
    }
    hero.army = readArmy(reader, version);
    hero.id = reader.i32();
    hero.portraitId = reader.i32();
    const race = reader.i32();
    hero.implicitClass = [1, 2, 4, 8, 16, 32].indexOf(race) + 1;
    reader.skip(2 + 1);
    reader.skip(reader.count(144 * 144) * 12);
    reader.skip(8 + 8 + 4);
    const visitedCount = reader.count(65536);
    hero.visitedObjects = [];
    for (let visit = 0; visit < visitedCount; visit += 1) {
      hero.visitedObjects.push({ index: reader.i32(), type: reader.u16() });
    }
    reader.skip(4);
    hero.byteLength = reader.offset - hero.fileOffset;
    return hero;
  }

  function readWorld(save, header) {
    const reader = new Reader(save.payload);
    const width = reader.u32();
    const height = reader.u32();
    if (width !== header.width || height !== header.height || reader.count(144 * 144) !== width * height) {
      throw new Error("Invalid fheroes2 world dimensions or tile count.");
    }
    for (let tile = 0; tile < width * height; tile += 1) {
      if (reader.u32() !== tile) throw new Error("Invalid fheroes2 map tile index.");
      reader.skip(2 + 1 + 2 + 7 + 2 + 1);
      if (reader.count(3) !== 3) throw new Error("Invalid fheroes2 map metadata.");
      reader.skip(12 + 1 + 1);
      reader.skip(reader.count(65536) * 7);
      reader.skip(reader.count(65536) * 7);
      reader.skip(1);
    }
    const heroCount = reader.count(256);
    if (!heroCount) throw new Error("The fheroes2 hero table is empty.");
    const heroes = [];
    const ids = new Set();
    for (let index = 0; index < heroCount; index += 1) {
      const hero = readHero(reader, header.version, index);
      if (hero.id === 0) continue;
      if (hero.id < 0 || hero.id >= heroCount || ids.has(hero.id)) {
        throw new Error(`Invalid fheroes2 hero ID ${hero.id} at record ${index} (${hero.name}); table size ${heroCount}, offset ${hero.fileOffset}.`);
      }
      ids.add(hero.id);
      heroes.push(hero);
    }
    const tailOffset = reader.offset;
    const { towns, kingdoms } = readKingdoms(reader, header.version);
    const capturedObjects = readCapturedObjects(reader, header.version, width * height);
    return { heroes, towns, tailOffset, kingdoms, capturedObjects };
  }

  function readCapturedObjects(reader, version, tileCount) {
    const rumorCount = reader.count(65536);
    for (let rumor = 0; rumor < rumorCount; rumor += 1) reader.string();
    const eventCount = reader.count(65536);
    for (let event = 0; event < eventCount; event += 1) {
      reader.skip(28 + 1 + 8 + (version < 10031 ? 4 : 1));
      reader.string();
      reader.string();
    }
    const capturedCount = reader.count(tileCount);
    const capturedObjects = [];
    const indices = new Set();
    for (let object = 0; object < capturedCount; object += 1) {
      const index = reader.i32();
      if (index < 0 || index >= tileCount || indices.has(index)) throw new Error("Invalid fheroes2 captured object index.");
      indices.add(index);
      const type = reader.u16();
      const color = readColor(reader, version);
      reader.skip(8);
      capturedObjects.push({ index, type, color });
    }
    return capturedObjects;
  }

  function refillMovement(save, heroId) {
    const hero = save.heroes.find(record => record.id === heroId);
    if (!hero) throw new Error("Invalid fheroes2 hero.");
    const color = hero.ownerPlayerId === null ? 0 : 1 << hero.ownerPlayerId;
    const lighthouseCount = save.capturedObjects.filter(object => object.type === 149 && object.color === color).length;
    const movement = getMaxMovePoints(hero, lighthouseCount);
    writeValue(save, hero.fields.movePoints.offset, movement);
    hero.movePoints = movement;
    return movement;
  }

  function readKingdoms(reader, version) {
    const castleCount = reader.count(72);
    const towns = [];
    for (let castle = 0; castle < castleCount; castle += 1) {
      const town = { index: castle, fileOffset: reader.offset, dwellingStock: [], fields: {} };
      town.mapX = reader.i16();
      town.mapY = reader.i16();
      town.modes = reader.u32();
      const race = reader.i32();
      town.factionId = [1, 2, 4, 8, 16, 32, 64].indexOf(race);
      if (town.factionId < 0) throw new Error("Invalid fheroes2 castle race.");
      town.fields.buildings = { offset: reader.offset };
      town.buildFlags = reader.u32();
      reader.skip(4);
      reader.skip(16 + 4 + 4 + 4 + 4);
      reader.skip(reader.count(256) * 4);
      reader.skip(reader.count(14) * 8);
      const color = readColor(reader, version);
      town.ownerPlayerId = color > 0 && color < 64 ? Math.log2(color) : null;
      town.name = reader.string();
      reader.skip(reader.count(256) * 4);
      reader.skip(reader.count(256) * 4);
      if (reader.count(6) !== 6) throw new Error("Invalid fheroes2 dwelling count.");
      for (let dwelling = 0; dwelling < 6; dwelling += 1) {
        const offset = reader.offset;
        town.dwellingStock.push(reader.u32());
        town.fields[`dwelling${dwelling}`] = { offset };
      }
      readArmy(reader, version);
      town.byteLength = reader.offset - town.fileOffset;
      towns.push(town);
    }
    if (reader.count(7) !== 7) throw new Error("Invalid fheroes2 kingdom count.");
    const kingdoms = [];
    const colors = new Set();
    for (let index = 0; index < 7; index += 1) {
      reader.skip(4);
      const color = readColor(reader, version);
      if (color !== 0 && (color === 64 || colors.has(color))) throw new Error("Invalid fheroes2 kingdom color.");
      colors.add(color);
      const resources = {};
      const resourceFields = {};
      for (const name of RESOURCE_NAMES) {
        resourceFields[name] = { offset: reader.offset };
        resources[name] = reader.u32();
      }
      reader.skip(4);
      const towns = reader.count(72);
      reader.skip(towns * 4);
      const heroes = reader.count(256);
      reader.skip(heroes * 4 + 16);
      reader.skip(reader.count(65536) * 6);
      const puzzle = reader.puzzle();
      reader.skip(12);
      if (version >= 10034) reader.skip(reader.count(144 * 144) * 4);
      kingdoms.push({ color, active: color !== 0 && towns + heroes > 0, resources, resourceFields, puzzle });
    }
    return { towns, kingdoms };
  }

  function setTownBuildings(save, townIndex, buildings) {
    const town = save.towns.find(record => record.index === townIndex);
    if (!town) throw new Error("Invalid fheroes2 town.");
    const error = getTownBuildingError(save, town, buildings);
    if (error) throw new Error(error);
    const normalizedBuildings = buildings >>> 0;
    writeValue(save, town.fields.buildings.offset, normalizedBuildings);
    town.buildFlags = normalizedBuildings;
  }

  function getTownBuildingRules(save, town) {
    if (!town || town.factionId < 0 || town.factionId >= TOWN_UPGRADES.length) throw new Error("Invalid fheroes2 town faction.");
    return {
      allowedUpgrades: TOWN_UPGRADES[town.factionId],
      tavern: town.factionId !== 5,
      shrine: town.factionId === 5 && save.mapVersion !== 0
    };
  }

  function getTownBuildingError(save, town, buildings) {
    if (!Number.isInteger(buildings) || buildings < -0x80000000 || buildings > 0xFFFFFFFF) return "Invalid fheroes2 town buildings.";
    buildings >>>= 0;
    const rules = getTownBuildingRules(save, town);
    const upgrades = buildings & 0xFC000000;
    if ((upgrades & ~rules.allowedUpgrades) !== 0) return "This faction does not support one or more selected dwelling upgrades.";
    if (!rules.tavern && (buildings & TOWN_BUILDING.tavern) !== 0) return "Necromancer towns cannot have a Tavern.";
    if (!rules.shrine && (buildings & TOWN_BUILDING.shrine) !== 0) return "This map and faction cannot have a Shrine.";
    const hasCastle = (buildings & TOWN_BUILDING.castle) !== 0;
    const hasTent = (buildings & TOWN_BUILDING.tent) !== 0;
    if (hasCastle === hasTent) return "A town must have either a Castle or a construction Tent.";
    if ((buildings & (TOWN_BUILDING.leftTurret | TOWN_BUILDING.rightTurret | TOWN_BUILDING.moat)) !== 0
      && (buildings & TOWN_BUILDING.castle) === 0) return "Castle defenses require a Castle.";

    const immutable = TOWN_BUILDING.castle | TOWN_BUILDING.tent | TOWN_BUILDING.shipyard | TOWN_BUILDING.captain;
    if (((buildings ^ town.buildFlags) & immutable) !== 0) return "Castle, Tent, Shipyard, and Captain state cannot be changed safely by this editor.";
    if ((buildings & TOWN_BUILDING.castle) === 0 && buildings !== (town.buildFlags >>> 0)) {
      return "Buildings cannot be changed until the town has a Castle.";
    }

    const mageGuild = buildings & TOWN_BUILDING.mageGuild;
    const mageLevel = mageGuild === 0 ? 0 : 32 - Math.clz32(mageGuild) - 14;
    const expectedMageGuild = mageLevel === 0 ? 0 : ((1 << mageLevel) - 1) << 14;
    if (mageGuild !== expectedMageGuild) return "Mage Guild levels must be cumulative.";

    for (let level = 2; level <= 6; level += 1) {
      const upgrade = TOWN_BUILDING[`upgrade${level}`];
      if ((buildings & upgrade) !== 0 && (buildings & TOWN_BUILDING[`dwelling${level}`]) === 0) {
        return `Dwelling ${level} must be built before its upgrade.`;
      }
    }
    if ((buildings & TOWN_BUILDING.upgrade7) !== 0
      && (buildings & (TOWN_BUILDING.dwelling6 | TOWN_BUILDING.upgrade6)) !== (TOWN_BUILDING.dwelling6 | TOWN_BUILDING.upgrade6)) {
      return "Black Tower requires both lower level-6 dwellings.";
    }
    return "";
  }

  function setTownDwelling(save, townIndex, slot, count) {
    const town = save.towns.find(record => record.index === townIndex);
    if (!town || !Number.isInteger(slot) || slot < 0 || slot >= 6) throw new Error("Invalid fheroes2 town dwelling.");
    writeValue(save, town.fields[`dwelling${slot}`].offset, count);
    town.dwellingStock[slot] = count;
  }

  function setKingdomResource(save, color, name, value) {
    const kingdom = save.kingdoms.find(record => record.color === color && record.active);
    if (!kingdom) throw new Error("Select an active fheroes2 player.");
    if (!RESOURCE_NAMES.includes(name)) throw new Error("Invalid fheroes2 resource.");
    writeValue(save, kingdom.resourceFields[name].offset, value);
    kingdom.resources[name] = value;
  }

  function revealPuzzle(save, color) {
    const kingdom = save.kingdoms.find(record => record.color === color && record.active);
    if (!kingdom) throw new Error("Select an active fheroes2 player.");
    const reader = new Reader(save.payload);
    reader.skip(kingdom.puzzle.offset - 4);
    reader.puzzle();
    save.payload.fill(0x31, kingdom.puzzle.offset, kingdom.puzzle.offset + 48);
    kingdom.puzzle.revealed = true;
  }

  async function open(bytes) {
    const header = readHeader(bytes);
    const save = await unpack(bytes, header.size);
    const world = readWorld(save, header);
    return { ...save, ...header, ...world };
  }

  function writeValue(save, offset, value, maximum = 0xFFFFFFFF) {
    if (!Number.isInteger(value) || value < 0 || value > maximum) throw new Error("Invalid fheroes2 field value.");
    if (!Number.isInteger(offset) || offset < 0 || offset + 4 > save.payload.length) throw new Error("Invalid fheroes2 field offset.");
    new DataView(save.payload.buffer, save.payload.byteOffset, save.payload.byteLength).setUint32(offset, value);
  }

  function replaceCollection(save, offset, oldCount, entries) {
    const replacement = new Uint8Array(4 + entries.length * 8);
    const view = new DataView(replacement.buffer);
    view.setUint32(0, entries.length);
    entries.forEach(([first, second], index) => {
      view.setInt32(4 + index * 8, first);
      view.setInt32(8 + index * 8, second);
    });
    const end = offset + 4 + oldCount * 8;
    const payload = new Uint8Array(save.payload.length + replacement.length - (end - offset));
    payload.set(save.payload.subarray(0, offset));
    payload.set(replacement, offset);
    payload.set(save.payload.subarray(end), offset + replacement.length);
    const world = readWorld({ payload }, save);
    Object.assign(save, { payload }, world);
  }

  function setSecondarySkill(save, heroId, skillId, level) {
    const hero = save.heroes.find(record => record.id === heroId);
    if (!hero || !Number.isInteger(skillId) || skillId < 1 || skillId > 14 || !Number.isInteger(level) || level < 0 || level > 3) {
      throw new Error("Invalid fheroes2 secondary skill.");
    }
    const entries = hero.secondary.filter(skill => skill.id > 0 && skill.level > 0)
      .map(skill => [skill.id, skill.level]);
    const index = entries.findIndex(([id]) => id === skillId);
    if (index >= 0) {
      if (level === 0) entries.splice(index, 1);
      else entries[index][1] = level;
    } else if (level > 0) {
      entries.push([skillId, level]);
    }
    if (entries.length > 8) throw new Error("A hero can have at most eight secondary skills.");
    replaceCollection(save, hero.secondaryOffset, hero.secondary.length, entries);
  }

  function setArtifact(save, heroId, slot, artifactId, spellId) {
    const hero = save.heroes.find(record => record.id === heroId);
    if (!hero || !Number.isInteger(slot) || slot < 0 || slot >= 14 || !Number.isInteger(artifactId)
      || artifactId < 0 || artifactId > ARTIFACT.maximum || (artifactId >= 83 && artifactId <= 86)) {
      throw new Error("Invalid fheroes2 artifact or slot.");
    }
    if (artifactId === ARTIFACT.spellBook && hero.artifacts.some((artifact, index) => index !== slot && artifact.id === ARTIFACT.spellBook)) {
      throw new Error("A hero can have only one spell book.");
    }
    const current = hero.artifacts[slot];
    let metadata = current && current.id === artifactId ? current.metadata : 0;
    if (artifactId === ARTIFACT.spellScroll) {
      if (spellId !== undefined) metadata = spellId;
      else if (!current || current.id !== artifactId) metadata = 1;
      if (!Number.isInteger(metadata) || metadata < 1 || metadata > 65) throw new Error("Invalid spell scroll spell.");
    } else if (spellId !== undefined) {
      throw new Error("Only spell scrolls have a spell selection.");
    }
    const entries = Array.from({ length: 14 }, (_, index) => {
      const artifact = hero.artifacts[index];
      return artifact ? [artifact.id, artifact.metadata] : [0, 0];
    });
    entries[slot] = [artifactId, metadata];
    replaceCollection(save, hero.artifactsOffset, hero.artifacts.length, entries);
  }

  root.Savc = {
    ARTIFACT, RESOURCE_NAMES, TOWN_BUILDING, Reader, unpack, pack, readHeader, open, writeValue, setSecondarySkill, setArtifact,
    getTownBuildingRules, getTownBuildingError, setTownBuildings, setTownDwelling, setKingdomResource, revealPuzzle, getMaxMovePoints, refillMovement
  };
})(globalThis);