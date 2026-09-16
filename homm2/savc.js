(function (root) {
  "use strict";

  const MAX_SAVE_SIZE = 64 * 1024 * 1024;
  const ARTIFACT = { empty: 0, spellBook: 82, spellScroll: 87, maximum: 103 };

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
    reader.skip(4 + 3 + 4 + 1 + 4 + 4 + 1 + 4 + 12 + 1);
    if (version >= 10033) reader.string();
    if (!(reader.u32() & 0x02)) throw new Error("This fheroes2 save is not a campaign save.");
    if (width < 1 || width > 144 || width !== height) throw new Error("Unsupported fheroes2 map dimensions.");
    return { version, mapName, width, height, size: reader.offset };
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
    reader.skip(4);
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
    reader.skip(reader.count(65536) * 6);
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
    return { heroes, tailOffset: reader.offset };
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

  root.Savc = { ARTIFACT, Reader, unpack, pack, readHeader, open, writeValue, setSecondarySkill, setArtifact };
})(globalThis);