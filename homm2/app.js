(function () {
  "use strict";

  const PLAYER_COLORS = ["Blue", "Green", "Red", "Yellow", "Orange", "Purple"];
  const HERO_CLASSES = ["(none)", "Knight", "Barbarian", "Sorceress", "Warlock", "Wizard", "Necromancer"];
  const TOWN_FACTIONS = ["Knight", "Barbarian", "Sorceress", "Warlock", "Wizard", "Necromancer", "Random"];
  const CREATURES = [
    "Peasant", "Archer", "Ranger", "Pikeman", "Veteran Pikeman", "Swordsman", "Master Swordsman",
    "Cavalry", "Champion", "Paladin", "Crusader", "Goblin", "Orc", "Orc Chief", "Wolf", "Ogre",
    "Ogre Lord", "Troll", "War Troll", "Cyclops", "Sprite", "Dwarf", "Battle Dwarf", "Elf",
    "Grand Elf", "Druid", "Greater Druid", "Unicorn", "Phoenix", "Centaur", "Gargoyle", "Griffin",
    "Minotaur", "Minotaur King", "Hydra", "Green Dragon", "Red Dragon", "Black Dragon", "Halfling",
    "Boar", "Iron Golem", "Steel Golem", "Roc", "Mage", "Archmage", "Giant", "Titan", "Skeleton",
    "Zombie", "Mutant Zombie", "Mummy", "Royal Mummy", "Vampire", "Vampire Lord", "Lich", "Power Lich",
    "Bone Dragon", "Rogue", "Nomad", "Ghost", "Genie", "Medusa", "Earth Elemental", "Air Elemental",
    "Fire Elemental", "Water Elemental"
  ];
  const ARTIFACTS = [
    "Ultimate Book of Knowledge", "Ultimate Sword of Dominion", "Ultimate Cloak of Protection", "Ultimate Wand of Magic",
    "Ultimate Shield", "Ultimate Staff", "Ultimate Crown", "Golden Goose", "Arcane Necklace of Magic",
    "Caster's Bracelet of Magic", "Mage's Ring of Power", "Witch's Broach of Magic", "Medal of Valor",
    "Medal of Courage", "Medal of Honor", "Medal of Distinction", "Fizbin of Misfortune", "Thunder Mace of Dominion",
    "Armored Gauntlets of Protection", "Defender Helm of Protection", "Giant Flail of Dominion", "Ballista of Quickness",
    "Stealth Shield of Protection", "Dragon Sword of Dominion", "Power Axe of Dominion", "Divine Breastplate of Protection",
    "Minor Scroll of Knowledge", "Major Scroll of Knowledge", "Superior Scroll of Knowledge", "Foremost Scroll of Knowledge",
    "Endless Sack of Gold", "Endless Bag of Gold", "Endless Purse of Gold", "Nomad Boots of Mobility",
    "Traveler's Boots of Mobility", "Rabbit Foot", "Golden Horseshoe", "Gambler's Lucky Coin", "Four-Leaf Clover",
    "True Compass of Mobility", "Sailor's Astrolabe of Mobility", "Evil Eye", "Enchanted Hourglass", "Gold Watch",
    "Skullcap", "Ice Cloak", "Fire Cloak", "Lightning Helm", "Evercold Icicle", "Everhot Lava Rock", "Lightning Rod",
    "Snake Ring", "Ankh", "Book of Elements", "Elemental Ring", "Holy Pendant", "Pendant of Free Will",
    "Pendant of Life", "Serenity Pendant", "Seeing-Eye Pendant", "Kinetic Pendant", "Pendant of Death", "Wand of Negation",
    "Golden Bow", "Telescope", "Statesman's Quill", "Wizard's Hat", "Power Ring", "Ammo Cart", "Tax Lien",
    "Hideous Mask", "Endless Pouch of Sulfur", "Endless Vial of Mercury", "Endless Pouch of Gems", "Endless Cord of Wood",
    "Endless Cart of Ore", "Endless Pouch of Crystal", "Spiked Helm", "Spiked Shield", "White Pearl", "Black Pearl",
    "Spell Book", "Any Ultimate Artifact (editor placeholder)", "Unused Artifact 84", "Unused Artifact 85", "Unused Artifact 86",
    "Spell Scroll", "Arm of the Martyr", "Breastplate of Anduran", "Broach of Shielding", "Battle Garb of Anduran",
    "Crystal Ball", "Heart of Fire", "Heart of Ice", "Helmet of Anduran", "Holy Hammer", "Legendary Scepter",
    "Masthead", "Sphere of Negation", "Staff of Wizardry", "Sword Breaker", "Sword of Anduran", "Spade of Necromancy"
  ];

  const HERO = {
    firstOffset: 0x7FA,
    max: 73,
    stride: 0xFA,
    name: 0x00,
    nameSize: 14,
    portrait: 0x0E,
    positionX: 0x0F,
    positionY: 0x13,
    sentinel: 0x1F,
    playerId: 0x21,
    movePoints: 0x27,
    moveBonus: 0x2B,
    experience: 0x2F,
    heroClass: 0x33,
    attack: 0x35,
    defense: 0x36,
    spellPower: 0x37,
    knowledge: 0x38,
    armyTypes: 0x5B,
    armyCounts: 0x60,
    artifacts: 0xCB,
    artifactSlots: 14,
    spellPoints: 0xF0
  };

  const TOWN = {
    firstOffset: 0x3CFB,
    max: 72,
    stride: 0x64,
    visitingHero: -0x02,
    buildFlags: 0x00,
    dwellingStock: 0x05,
    upgradedDwellingStock: 0x11,
    owner: -0x18,
    faction: -0x16,
    name: 0x3E,
    nameSize: 14,
    slotId: 0x4B,
    buildingBits: [0, 1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
  };

  const RESOURCES = {
    offset: 0x03A4,
    names: ["Wood", "Mercury", "Ore", "Sulfur", "Crystal", "Gems", "Gold"]
  };

  const MAP_VISIBILITY = {
    offset: 0x664C,
    width: 72,
    height: 72,
    heroRadius: 5
  };

  const PLAYER_ROSTERS = {
    firstHeroCount: 0x0316,
    stride: 0xCF,
    heroCount: 0x00,
    currentHero: 0x01,
    heroRoster: 0x03,
    heroRosterSlots: 7,
    emptyHero: 0xFF
  };

  const state = {
    buffer: null,
    view: null,
    fileName: "",
    dirty: false,
    heroes: [],
    towns: [],
    playerHeroRosters: [],
    playerRosterBlocks: [],
    revealOnOwnerChange: true,
    resources: {},
    activeTab: "heroes",
    selectedType: "heroes",
    selectedIndex: null
  };

  const ui = {
    fileInput: document.getElementById("fileInput"),
    fileStatus: document.getElementById("fileStatus"),
    downloadButton: document.getElementById("downloadButton"),
    closeButton: document.getElementById("closeButton"),
    resourcesGrid: document.getElementById("resourcesGrid"),
    nameFilter: document.getElementById("nameFilter"),
    classFilter: document.getElementById("classFilter"),
    ownerFilter: document.getElementById("ownerFilter"),
    heroesTab: document.getElementById("heroesTab"),
    townsTab: document.getElementById("townsTab"),
    recordCount: document.getElementById("recordCount"),
    recordList: document.getElementById("recordList"),
    editor: document.getElementById("editor")
  };

  initialize();

  function initialize() {
    populateFilters();
    ui.fileInput.addEventListener("change", handleFileOpen);
    ui.downloadButton.addEventListener("click", downloadEditedSave);
    ui.closeButton.addEventListener("click", closeFile);
    ui.nameFilter.addEventListener("input", renderRecordList);
    ui.classFilter.addEventListener("change", renderRecordList);
    ui.ownerFilter.addEventListener("change", renderRecordList);
    ui.heroesTab.addEventListener("click", () => setActiveTab("heroes"));
    ui.townsTab.addEventListener("click", () => setActiveTab("towns"));
  }

  function populateFilters() {
    setOptions(ui.classFilter, [{ value: "", label: "All classes" }].concat(
      HERO_CLASSES.slice(1).map((label, index) => ({ value: String(index + 1), label }))
    ));
    setOptions(ui.ownerFilter, [
      { value: "", label: "All heroes" },
      { value: "recruited", label: "All owned" },
      { value: "available", label: "Available" },
      ...PLAYER_COLORS.map((label, index) => ({ value: String(index), label: `${label} owned` }))
    ]);
  }

  async function handleFileOpen(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      openBuffer(new Uint8Array(arrayBuffer), file.name);
    } catch (error) {
      showEmpty(`Could not open save: ${error.message}`, true);
    } finally {
      event.target.value = "";
    }
  }

  function openBuffer(buffer, fileName) {
    state.buffer = buffer;
    state.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    state.fileName = fileName;
    state.heroes = findHeroes();
    state.towns = findTowns();
    readPlayerRosters();
    applyHeroOwnership();
    state.resources = readResources();
    state.dirty = false;
    state.activeTab = "heroes";
    state.selectedType = "heroes";
    state.selectedIndex = state.heroes.length ? 0 : null;
    setEnabled(true);
    renderAll();
  }

  function closeFile() {
    if (state.dirty && !window.confirm("Discard unsaved changes?")) return;
    state.buffer = null;
    state.view = null;
    state.fileName = "";
    state.dirty = false;
    state.heroes = [];
    state.towns = [];
    state.playerHeroRosters = [];
    state.playerRosterBlocks = [];
    state.resources = {};
    state.selectedIndex = null;
    setEnabled(false);
    ui.resourcesGrid.className = "resource-grid muted";
    ui.resourcesGrid.textContent = "Open a save to edit resources.";
    ui.recordList.innerHTML = "";
    ui.recordCount.textContent = "0 records";
    showEmpty("No Save Loaded");
    updateFileStatus();
  }

  function setEnabled(enabled) {
    ui.downloadButton.disabled = !enabled;
    ui.closeButton.disabled = !enabled;
    ui.nameFilter.disabled = !enabled;
    ui.classFilter.disabled = !enabled;
    ui.ownerFilter.disabled = !enabled;
  }

  function renderAll() {
    renderTabs();
    renderResources();
    renderRecordList();
    renderSelectedEditor();
    updateFileStatus();
  }

  function renderTabs() {
    const heroesActive = state.activeTab === "heroes";
    ui.heroesTab.classList.toggle("active", heroesActive);
    ui.townsTab.classList.toggle("active", !heroesActive);
    ui.heroesTab.setAttribute("aria-selected", String(heroesActive));
    ui.townsTab.setAttribute("aria-selected", String(!heroesActive));
    ui.classFilter.disabled = !state.buffer || !heroesActive;
    ui.ownerFilter.disabled = !state.buffer || !heroesActive;
  }

  function renderResources() {
    if (!state.buffer) return;
    ui.resourcesGrid.className = "resource-grid";
    ui.resourcesGrid.innerHTML = "";
    for (const name of RESOURCES.names) {
      const label = document.createElement("label");
      label.className = "resource-field";
      label.append(span(name));
      const input = numberInput(0, 0xFFFFFFFF, state.resources[name], value => {
        state.resources[name] = value;
        writeResources();
        markDirty();
      });
      label.append(input);
      ui.resourcesGrid.append(label);
    }
  }

  function renderRecordList() {
    if (!state.buffer) return;
    const records = filteredRecords();
    ui.recordList.innerHTML = "";
    ui.recordCount.textContent = `${records.length} / ${state.activeTab === "heroes" ? state.heroes.length : state.towns.length} ${state.activeTab}`;
    for (const record of records) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "record-item";
      button.setAttribute("role", "option");
      const selected = state.selectedType === state.activeTab && state.selectedIndex === record.index;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-selected", String(selected));
      button.addEventListener("click", () => selectRecord(state.activeTab, record.index));
      const name = document.createElement("div");
      name.className = "record-name";
      name.textContent = record.name || "(unnamed)";
      const offset = document.createElement("div");
      offset.className = "record-offset";
      offset.textContent = hex(record.fileOffset, 4);
      const meta = document.createElement("div");
      meta.className = "record-meta";
      meta.textContent = state.activeTab === "heroes"
        ? `${heroClass(record.implicitClass)} | ${heroOwner(record)} | XP ${formatNumber(record.experience)}`
        : `${townFaction(record.factionId)} | slot ${record.slotId}`;
      button.append(name, offset, meta);
      ui.recordList.append(button);
    }
    if (records.length === 0) {
      const empty = document.createElement("div");
      empty.className = "record-meta";
      empty.style.padding = "14px 12px";
      empty.textContent = "No records match the current filters.";
      ui.recordList.append(empty);
    }
  }

  function filteredRecords() {
    const text = ui.nameFilter.value.trim().toLowerCase();
    if (state.activeTab === "towns") {
      return state.towns.filter(town => !text || town.name.toLowerCase().includes(text));
    }
    const cls = ui.classFilter.value;
    const owner = ui.ownerFilter.value;
    return state.heroes.filter(hero => {
      if (text && !hero.name.toLowerCase().includes(text)) return false;
      if (cls && hero.implicitClass !== Number(cls)) return false;
      if (owner === "recruited" && !hero.isRecruited) return false;
      if (owner === "available" && hero.isRecruited) return false;
      if (owner !== "" && owner !== "recruited" && owner !== "available" && hero.ownerPlayerId !== Number(owner)) return false;
      return true;
    });
  }

  function setActiveTab(tab) {
    state.activeTab = tab;
    state.selectedType = tab;
    const collection = tab === "heroes" ? state.heroes : state.towns;
    state.selectedIndex = collection.length ? collection[0].index : null;
    renderTabs();
    renderRecordList();
    renderSelectedEditor();
  }

  function selectRecord(type, index) {
    state.selectedType = type;
    state.selectedIndex = index;
    renderRecordList();
    renderSelectedEditor();
    bringEditorIntoView();
  }

  function bringEditorIntoView() {
    const rect = ui.editor.getBoundingClientRect();
    const header = document.querySelector(".app-header");
    const topLimit = header ? header.getBoundingClientRect().bottom + 12 : 24;
    if (rect.top < topLimit || rect.top > window.innerHeight - 180) {
      ui.editor.scrollIntoView({ block: "start" });
    }
  }

  function renderSelectedEditor() {
    if (!state.buffer) return;
    if (state.selectedIndex == null) {
      showEmpty("Select a record to edit.");
      return;
    }
    if (state.selectedType === "towns") {
      const town = state.towns.find(item => item.index === state.selectedIndex);
      town ? renderTownEditor(town) : showEmpty("Select a town to edit.");
    } else {
      const hero = state.heroes.find(item => item.index === state.selectedIndex);
      hero ? renderHeroEditor(hero) : showEmpty("Select a hero to edit.");
    }
  }

  function renderHeroEditor(hero) {
    ui.editor.className = "editor";
    ui.editor.innerHTML = "";
    const layout = div("editor-layout");
    const header = div("editor-header");
    const titleBlock = document.createElement("div");
    titleBlock.append(heading(hero.name || "(unnamed)", 2), paragraph(`${heroClass(hero.implicitClass)} | ${heroOwner(hero)} | ${hex(hero.fileOffset, 4)}`));
    header.append(titleBlock);
    layout.append(header);

    layout.append(section("Identity", div("section-grid",
      textField("Name", hero.name, 13, value => updateHero(hero, "name", asciiText(value, 13))),
      selectField("Owner", heroOwnerSelectValue(hero), heroOwnerOptions(), value => setHeroOwner(hero, value)),
      checkField("Reveal area when owner changes", state.revealOnOwnerChange, checked => {
        state.revealOnOwnerChange = checked;
      }),
      actionField("Visibility", "Reveal for owner", () => revealHeroAreaForCurrentOwner(hero)),
      numericField("Portrait ID", hero.portraitId, 0, 255, value => updateHero(hero, "portraitId", value)),
      selectField("Class", String(hero.implicitClass), HERO_CLASSES.map((label, index) => ({ value: String(index), label })), value => updateHero(hero, "heroClass", Number(value))),
      numericField("Experience", hero.experience, 0, 0xFFFFFFFF, value => updateHero(hero, "experience", value))
    )));

    layout.append(section("Primary Skills", div("section-grid wide-grid",
      numericField("Attack", hero.attack, 0, 99, value => updateHero(hero, "attack", value)),
      numericField("Defense", hero.defense, 0, 99, value => updateHero(hero, "defense", value)),
      numericField("Spell Power", hero.spellPower, 0, 99, value => updateHero(hero, "spellPower", value)),
      numericField("Knowledge", hero.knowledge, 0, 99, value => updateHero(hero, "knowledge", value)),
      numericField("Spell Points", hero.spellPoints, 0, 0xFFFF, value => updateHero(hero, "spellPoints", value)),
      numericField("Today Max", hero.movePoints, 0, 0xFFFFFFFF, value => updateHero(hero, "movePoints", value)),
      numericField("Today Left", hero.moveBonus, 0, 0xFFFFFFFF, value => updateHero(hero, "moveBonus", value)),
      actionField("Movement", "Refill current day", () => {
        hero.moveBonus = hero.movePoints;
        writeHero(hero);
        markDirty();
        renderHeroEditor(hero);
        renderRecordList();
      })
    )));

    const armyGrid = div("army-grid");
    armyGrid.append(labelText("Slot"), labelText("Creature"), labelText("Count"));
    for (let slot = 0; slot < 5; slot += 1) {
      armyGrid.append(div("slot-label", `#${slot + 1}`));
      armyGrid.append(selectField("", String(hero.armyTypes[slot]), creatureOptions(), value => {
        hero.armyTypes[slot] = Number(value);
        writeHero(hero);
        markDirty();
        renderHeroEditor(hero);
      }, true));
      armyGrid.append(numericField("", hero.armyCounts[slot], 0, 0xFFFF, value => {
        hero.armyCounts[slot] = value;
        writeHero(hero);
        markDirty();
      }, true, hero.armyTypes[slot] === 0xFF));
    }
    layout.append(section("Army", armyGrid));

    const artifactGrid = div("artifact-grid");
    for (let slot = 0; slot < HERO.artifactSlots; slot += 1) {
      artifactGrid.append(selectField(`#${slot + 1}`, String(hero.artifacts[slot]), artifactOptions(), value => {
        hero.artifacts[slot] = Number(value);
        writeHero(hero);
        markDirty();
      }));
    }
    layout.append(section("Artifacts", artifactGrid));

    layout.append(section("Details", div("section-grid",
      readonlyField("Owner Source", heroOwnerSource(hero)),
      readonlyField("Roster Slot", hero.rosterSlot == null ? "(none)" : `#${hero.rosterSlot + 1}`),
      readonlyField("Selected Hero", hero.isSelectedHero ? "Yes" : "No"),
      readonlyField("Position", `${hero.positionX}, ${hero.positionY}`),
      readonlyField("Town Slot", hero.townName || "(none)"),
      readonlyField("Town Owner", hero.townOwnerPlayerId == null ? "(none)" : playerColor(hero.townOwnerPlayerId)),
      readonlyField("Record Index", String(hero.index))
    )));

    layout.append(hexSection("Raw Bytes", state.buffer.slice(hero.fileOffset, hero.fileOffset + HERO.stride)));
    ui.editor.append(layout);
  }

  function renderTownEditor(town) {
    ui.editor.className = "editor";
    ui.editor.innerHTML = "";
    const layout = div("editor-layout");
    const header = div("editor-header");
    const titleBlock = document.createElement("div");
    titleBlock.append(heading(town.name || "(unnamed)", 2), paragraph(`${townFaction(town.factionId)} | slot ${town.slotId} | ${hex(town.fileOffset, 4)}`));
    header.append(titleBlock);
    layout.append(header);

    layout.append(section("Town", div("section-grid",
      readonlyField("Name", town.name || "(unnamed)"),
      readonlyField("Slot ID", `${town.slotId} (${hex(town.slotId, 2)})`),
      readonlyField("Owner", town.ownerPlayerId == null ? "(none)" : playerColor(town.ownerPlayerId)),
      readonlyField("Faction", `${townFaction(town.factionId)} (${hex(town.factionId, 2)})`),
      readonlyField("Index", String(town.index)),
      readonlyField("Offset", hex(town.fileOffset, 4))
    )));

    const buildingGrid = div("building-grid");
    buildingGrid.append(checkField("Faction info building", town.hasThievesGuild, checked => {
      town.buildFlagsPrefix = setBit(town.buildFlagsPrefix, 1, checked);
      writeTown(town);
      markDirty();
      renderTownEditor(town);
    }));
    buildingGrid.append(checkField("Tavern", town.hasTavern, checked => {
      town.buildFlagsPrefix = setBit(town.buildFlagsPrefix, 2, checked);
      writeTown(town);
      markDirty();
      renderTownEditor(town);
    }));
    buildingGrid.append(numericField("Mage Guild Level", town.mageGuildLevel, 0, 5, value => {
      town.mageGuildLevel = value;
      town.buildFlags = ((town.buildFlags & 0x00FFFFFF) | ((value & 0xFF) << 24)) >>> 0;
      writeTown(town);
      markDirty();
      renderTownEditor(town);
    }));
    for (const bit of TOWN.buildingBits) {
      const mask = 1 << bit;
      buildingGrid.append(checkField(townBuildingName(bit, town.factionId), (town.buildFlags & mask) !== 0, checked => {
        town.buildFlags = checked ? (town.buildFlags | mask) >>> 0 : (town.buildFlags & ~mask) >>> 0;
        town.mageGuildLevel = town.buildFlags >>> 24;
        writeTown(town);
        markDirty();
        renderTownEditor(town);
      }));
    }
    const buildSection = section("Buildings", buildingGrid);
    buildSection.append(div("raw-line", formatTownBuildFlags(town)));
    layout.append(buildSection);

    const stockGrid = div("stock-grid");
    for (let slot = 0; slot < 6; slot += 1) {
      stockGrid.append(stockField(townDwellingStockName(town.factionId, slot, town.buildFlags), getAvailableDwellingStock(town, slot), value => {
        setAvailableDwellingStock(town, slot, value);
        writeTown(town);
        markDirty();
      }));
    }
    layout.append(section("Dwelling Stock", stockGrid));

    layout.append(hexSection("Raw Bytes", state.buffer.slice(town.fileOffset, town.fileOffset + TOWN.stride)));
    ui.editor.append(layout);
  }

  function findHeroes() {
    const heroes = [];
    for (let index = 0; index < HERO.max; index += 1) {
      const offset = HERO.firstOffset + index * HERO.stride;
      if (offset + HERO.stride > state.buffer.length) break;
      if (looksLikeHero(offset)) heroes.push(readHero(offset, index));
    }
    return heroes;
  }

  function looksLikeHero(offset) {
    let nameLength = 0;
    for (; nameLength < HERO.nameSize; nameLength += 1) {
      const byte = state.buffer[offset + nameLength];
      if (byte === 0) break;
      if (byte < 0x20 || byte > 0x7E) return false;
    }
    if (nameLength === 0 || nameLength >= HERO.nameSize) return false;
    if (state.buffer[offset + HERO.portrait] > 127) return false;
    const sentinel = readU16(offset + HERO.sentinel);
    if (sentinel !== 0xFEFF && sentinel !== 0xFFFF) return false;
    return state.buffer[offset + HERO.heroClass] <= 15;
  }

  function readHero(offset, index) {
    const hero = {
      fileOffset: offset,
      index,
      name: readAscii(offset + HERO.name, HERO.nameSize),
      portraitId: state.buffer[offset + HERO.portrait],
      experience: readU32(offset + HERO.experience),
      heroClass: state.buffer[offset + HERO.heroClass],
      implicitClass: Math.floor(index / 9) + 1,
      positionX: readI32(offset + HERO.positionX),
      positionY: readI32(offset + HERO.positionY),
      attack: state.buffer[offset + HERO.attack],
      defense: state.buffer[offset + HERO.defense],
      spellPower: state.buffer[offset + HERO.spellPower],
      knowledge: state.buffer[offset + HERO.knowledge],
      spellPoints: readU16(offset + HERO.spellPoints),
      movePoints: readU32(offset + HERO.movePoints),
      moveBonus: readU32(offset + HERO.moveBonus),
      sentinel: readU16(offset + HERO.sentinel),
      playerId: state.buffer[offset + HERO.playerId],
      hasRecruitedSentinel: false,
      isRosterHero: false,
      isSelectedHero: false,
      ownerSource: "",
      rosterSlot: null,
      townName: "",
      townOwnerPlayerId: null,
      armyOffset: offset + HERO.armyTypes,
      armyTypes: [],
      armyCounts: [],
      artifacts: []
    };
    hero.hasRecruitedSentinel = hero.sentinel === 0xFEFF;
    hero.isRecruited = hero.hasRecruitedSentinel;
    hero.isOnMap = hero.hasRecruitedSentinel || hero.positionX !== 0 || hero.positionY !== 0;
    hero.ownerPlayerId = hero.hasRecruitedSentinel && hero.playerId < 6 ? hero.playerId : null;
    hero.ownerSource = hero.ownerPlayerId == null ? "" : "Hero record sentinel";
    for (let slot = 0; slot < 5; slot += 1) {
      hero.armyTypes.push(state.buffer[offset + HERO.armyTypes + slot]);
      hero.armyCounts.push(readU16(offset + HERO.armyCounts + slot * 2));
    }
    for (let slot = 0; slot < HERO.artifactSlots; slot += 1) {
      hero.artifacts.push(state.buffer[offset + HERO.artifacts + slot]);
    }
    return hero;
  }

  function writeHero(hero) {
    const offset = hero.fileOffset;
    writeAscii(offset + HERO.name, HERO.nameSize, hero.name, 13);
    state.buffer[offset + HERO.portrait] = clamp(hero.portraitId, 0, 255);
    writeU32(offset + HERO.experience, hero.experience);
    writeU16(offset + HERO.spellPoints, hero.spellPoints);
    writeU32(offset + HERO.movePoints, hero.movePoints);
    writeU32(offset + HERO.moveBonus, hero.moveBonus);
    state.buffer[offset + HERO.heroClass] = clamp(hero.heroClass, 0, 255);
    state.buffer[offset + HERO.attack] = clamp(hero.attack, 0, 255);
    state.buffer[offset + HERO.defense] = clamp(hero.defense, 0, 255);
    state.buffer[offset + HERO.spellPower] = clamp(hero.spellPower, 0, 255);
    state.buffer[offset + HERO.knowledge] = clamp(hero.knowledge, 0, 255);
    for (let slot = 0; slot < 5; slot += 1) {
      state.buffer[hero.armyOffset + slot] = clamp(hero.armyTypes[slot], 0, 255);
      writeU16(hero.armyOffset + 5 + slot * 2, hero.armyCounts[slot]);
    }
    for (let slot = 0; slot < HERO.artifactSlots; slot += 1) {
      state.buffer[offset + HERO.artifacts + slot] = clamp(hero.artifacts[slot], 0, 255);
    }
  }

  function updateHero(hero, property, value) {
    hero[property] = value;
    writeHero(hero);
    markDirty();
    renderRecordList();
    updateFileStatus();
  }

  function findTowns() {
    const towns = [];
    for (let index = 0; index < TOWN.max; index += 1) {
      const offset = TOWN.firstOffset + index * TOWN.stride;
      if (offset + TOWN.stride > state.buffer.length) break;
      if (looksLikeTown(offset)) towns.push(readTown(offset, index));
      else if (towns.length > 0) break;
    }
    return towns;
  }

  function looksLikeTown(offset) {
    const nameStart = offset + TOWN.name;
    let nameLength = 0;
    for (; nameLength < TOWN.nameSize; nameLength += 1) {
      const byte = state.buffer[nameStart + nameLength];
      if (byte === 0) break;
      if (byte < 0x20 || byte > 0x7E) return false;
    }
    return nameLength > 0 && nameLength < TOWN.nameSize;
  }

  function readTown(offset, index) {
    const town = {
      fileOffset: offset,
      index,
      name: readAscii(offset + TOWN.name, TOWN.nameSize),
      slotId: state.buffer[offset + TOWN.slotId],
      ownerPlayerId: readTownOwner(offset),
      factionId: offset + TOWN.faction >= 0 ? state.buffer[offset + TOWN.faction] : 0xFF,
      visitingHeroIndex: state.buffer[offset + TOWN.visitingHero],
      buildFlagsPrefix: offset > 0 ? state.buffer[offset - 1] : 0,
      buildFlags: readU32(offset + TOWN.buildFlags),
      dwellingStock: [],
      upgradedDwellingStock: []
    };
    town.hasThievesGuild = (town.buildFlagsPrefix & 0x02) !== 0;
    town.hasTavern = (town.buildFlagsPrefix & 0x04) !== 0;
    town.mageGuildLevel = town.buildFlags >>> 24;
    for (let slot = 0; slot < 6; slot += 1) town.dwellingStock.push(readU16(offset + TOWN.dwellingStock + slot * 2));
    for (let slot = 0; slot < 5; slot += 1) town.upgradedDwellingStock.push(readU16(offset + TOWN.upgradedDwellingStock + slot * 2));
    return town;
  }

  function readTownOwner(offset) {
    const ownerOffset = offset + TOWN.owner;
    if (ownerOffset < 0 || ownerOffset >= state.buffer.length) return null;
    const owner = state.buffer[ownerOffset];
    return owner < PLAYER_COLORS.length ? owner : null;
  }

  function writeTown(town) {
    const offset = town.fileOffset;
    if (offset > 0) state.buffer[offset - 1] = town.buildFlagsPrefix;
    writeU32(offset + TOWN.buildFlags, town.buildFlags);
    for (let slot = 0; slot < 6; slot += 1) writeU16(offset + TOWN.dwellingStock + slot * 2, town.dwellingStock[slot] || 0);
    for (let slot = 0; slot < 5; slot += 1) writeU16(offset + TOWN.upgradedDwellingStock + slot * 2, town.upgradedDwellingStock[slot] || 0);
    town.hasThievesGuild = (town.buildFlagsPrefix & 0x02) !== 0;
    town.hasTavern = (town.buildFlagsPrefix & 0x04) !== 0;
    town.mageGuildLevel = town.buildFlags >>> 24;
  }

  function readPlayerRosters() {
    state.playerHeroRosters = [];
    state.playerRosterBlocks = [];
    for (let playerId = 0; playerId < PLAYER_COLORS.length; playerId += 1) {
      const offset = PLAYER_ROSTERS.firstHeroCount + playerId * PLAYER_ROSTERS.stride;
      const rosterStart = offset + PLAYER_ROSTERS.heroRoster;
      if (state.buffer.length <= rosterStart + PLAYER_ROSTERS.heroRosterSlots) break;

      const currentHero = state.buffer[offset + PLAYER_ROSTERS.currentHero];
      const heroCount = clamp(state.buffer[offset + PLAYER_ROSTERS.heroCount], 0, PLAYER_ROSTERS.heroRosterSlots);
      const seen = new Set();
      const heroIndexes = [];
      for (let slot = 0; slot < heroCount; slot += 1) {
        const heroIndex = state.buffer[rosterStart + slot];
        if (heroIndex >= HERO.max || seen.has(heroIndex)) continue;
        seen.add(heroIndex);
        heroIndexes.push(heroIndex);
        state.playerHeroRosters.push({
          index: heroIndex,
          playerId,
          slot: heroIndexes.length - 1,
          isSelected: currentHero === heroIndex
        });
      }
      state.playerRosterBlocks.push({ playerId, offset, currentHero, heroIndexes });
    }
  }

  function writePlayerRosters() {
    for (const block of state.playerRosterBlocks) {
      const rosterStart = block.offset + PLAYER_ROSTERS.heroRoster;
      const heroIndexes = block.heroIndexes.slice(0, PLAYER_ROSTERS.heroRosterSlots);
      let selectedHero = block.currentHero;
      if (selectedHero < HERO.max && !heroIndexes.includes(selectedHero)) {
        selectedHero = heroIndexes.length ? heroIndexes[0] : PLAYER_ROSTERS.emptyHero;
      }

      state.buffer[block.offset + PLAYER_ROSTERS.heroCount] = heroIndexes.length;
      state.buffer[block.offset + PLAYER_ROSTERS.currentHero] = selectedHero;
      for (let slot = 0; slot < PLAYER_ROSTERS.heroRosterSlots; slot += 1) {
        state.buffer[rosterStart + slot] = heroIndexes[slot] == null ? PLAYER_ROSTERS.emptyHero : heroIndexes[slot];
      }
      block.currentHero = selectedHero;
      block.heroIndexes = heroIndexes;
    }
  }

  function setHeroOwner(hero, value) {
    const targetPlayerId = value === "" ? null : Number(value);
    const currentOwner = hero.ownerPlayerId == null ? null : hero.ownerPlayerId;
    if (targetPlayerId === currentOwner) return;

    if (hero.townName && (hero.townOwnerPlayerId == null || targetPlayerId !== hero.townOwnerPlayerId)) {
      const townOwner = hero.townOwnerPlayerId == null ? "unknown" : playerColor(hero.townOwnerPlayerId);
      window.alert(`${hero.name} is currently in ${hero.townName}. Assign this hero to the town owner (${townOwner}) or remove the hero from the town first.`);
      renderHeroEditor(hero);
      return;
    }

    const targetBlock = targetPlayerId == null ? null : playerRosterBlock(targetPlayerId);
    if (targetBlock && !targetBlock.heroIndexes.includes(hero.index) && targetBlock.heroIndexes.length >= PLAYER_ROSTERS.heroRosterSlots) {
      window.alert(`${playerColor(targetPlayerId)} already has ${PLAYER_ROSTERS.heroRosterSlots} heroes.`);
      renderHeroEditor(hero);
      return;
    }

    for (const block of state.playerRosterBlocks) {
      block.heroIndexes = block.heroIndexes.filter(index => index !== hero.index);
    }

    if (targetBlock && !targetBlock.heroIndexes.includes(hero.index)) {
      targetBlock.heroIndexes.push(hero.index);
    }

    writePlayerRosters();
    readPlayerRosters();
    applyHeroOwnership();

    const updatedHero = state.heroes.find(item => item.index === hero.index) || hero;
    if (targetPlayerId != null && state.revealOnOwnerChange) {
      revealHeroArea(updatedHero, targetPlayerId, false);
    }
    markDirty();
    renderRecordList();
    renderHeroEditor(updatedHero);
  }

  function revealHeroAreaForCurrentOwner(hero) {
    if (hero.ownerPlayerId == null) {
      window.alert(`${hero.name} is not assigned to a player.`);
      return;
    }
    if (!revealHeroArea(hero, hero.ownerPlayerId, true)) return;
    markDirty();
    renderHeroEditor(hero);
  }

  function revealHeroArea(hero, playerId, showAlerts) {
    if (!hasValidMapPosition(hero)) {
      if (showAlerts) window.alert(`${hero.name} does not have a map position to reveal.`);
      return false;
    }
    const end = MAP_VISIBILITY.offset + MAP_VISIBILITY.width * MAP_VISIBILITY.height;
    if (state.buffer.length < end) {
      if (showAlerts) window.alert("This save is too small for the known visibility grid.");
      return false;
    }

    const mask = 1 << playerId;
    const radius = MAP_VISIBILITY.heroRadius;
    for (let y = Math.max(0, hero.positionY - radius); y <= Math.min(MAP_VISIBILITY.height - 1, hero.positionY + radius); y += 1) {
      for (let x = Math.max(0, hero.positionX - radius); x <= Math.min(MAP_VISIBILITY.width - 1, hero.positionX + radius); x += 1) {
        const dx = x - hero.positionX;
        const dy = y - hero.positionY;
        if (dx * dx + dy * dy > radius * radius) continue;
        state.buffer[MAP_VISIBILITY.offset + y * MAP_VISIBILITY.width + x] |= mask;
      }
    }
    return true;
  }

  function hasValidMapPosition(hero) {
    return hero.positionX >= 0 && hero.positionX < MAP_VISIBILITY.width
      && hero.positionY >= 0 && hero.positionY < MAP_VISIBILITY.height
      && (hero.positionX !== 0 || hero.positionY !== 0 || hero.isOnMap);
  }

  function playerRosterBlock(playerId) {
    return state.playerRosterBlocks.find(block => block.playerId === playerId) || null;
  }

  function applyHeroOwnership() {
    const rosterByHero = new Map(state.playerHeroRosters.map(entry => [entry.index, entry]));
    const townByHero = new Map(state.towns
      .filter(town => town.visitingHeroIndex < HERO.max)
      .map(town => [town.visitingHeroIndex, town]));

    for (const hero of state.heroes) {
      const rosterEntry = rosterByHero.get(hero.index);
      const town = townByHero.get(hero.index);
      hero.isRosterHero = Boolean(rosterEntry);
      hero.rosterSlot = rosterEntry ? rosterEntry.slot : null;
      hero.isSelectedHero = rosterEntry ? rosterEntry.isSelected : false;
      hero.townName = town ? town.name : "";
      hero.townOwnerPlayerId = town ? town.ownerPlayerId : null;
      if (rosterEntry) {
        hero.ownerPlayerId = rosterEntry.playerId;
        hero.ownerSource = "Player roster";
      } else if (hero.hasRecruitedSentinel && hero.playerId < PLAYER_COLORS.length) {
        hero.ownerPlayerId = hero.playerId;
        hero.ownerSource = "Hero record sentinel";
      } else {
        hero.ownerPlayerId = null;
        hero.ownerSource = "";
      }
      hero.isRecruited = hero.ownerPlayerId != null;
    }
  }

  function readResources() {
    if (state.buffer.length < RESOURCES.offset + RESOURCES.names.length * 4) {
      throw new Error("Buffer too small for resources record.");
    }
    const resources = {};
    for (let index = 0; index < RESOURCES.names.length; index += 1) {
      resources[RESOURCES.names[index]] = readU32(RESOURCES.offset + index * 4);
    }
    return resources;
  }

  function writeResources() {
    for (let index = 0; index < RESOURCES.names.length; index += 1) {
      writeU32(RESOURCES.offset + index * 4, state.resources[RESOURCES.names[index]] || 0);
    }
  }

  function downloadEditedSave() {
    if (!state.buffer) return;
    const blob = new Blob([state.buffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = editedFileName(state.fileName || "save.GXC");
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    state.dirty = false;
    updateFileStatus();
  }

  function editedFileName(name) {
    const match = name.match(/^(.*?)(\.[^.]+)?$/);
    return `${match[1] || "save"}.edited${match[2] || ".GXC"}`;
  }

  function markDirty() {
    state.dirty = true;
    updateFileStatus();
  }

  function updateFileStatus() {
    if (!state.buffer) {
      ui.fileStatus.textContent = "No save loaded";
      document.title = "HoMM2 GXC Save Editor";
      return;
    }
    const dirty = state.dirty ? " | modified" : "";
    ui.fileStatus.textContent = `${state.fileName} | ${formatNumber(state.buffer.length)} bytes | ${state.heroes.length} heroes | ${state.towns.length} towns${dirty}`;
    document.title = `${state.dirty ? "* " : ""}${state.fileName} - HoMM2 GXC Save Editor`;
  }

  function showEmpty(message, isError) {
    ui.editor.className = "editor empty-state";
    ui.editor.innerHTML = "";
    const block = document.createElement("div");
    const title = heading(message, 2);
    if (isError) title.className = "danger";
    block.append(title);
    ui.editor.append(block);
  }

  function readU16(offset) { return state.view.getUint16(offset, true); }
  function readU32(offset) { return state.view.getUint32(offset, true); }
  function readI32(offset) { return state.view.getInt32(offset, true); }
  function writeU16(offset, value) { state.view.setUint16(offset, clamp(value, 0, 0xFFFF), true); }
  function writeU32(offset, value) { state.view.setUint32(offset, clamp(value, 0, 0xFFFFFFFF), true); }

  function readAscii(offset, length) {
    let text = "";
    for (let index = 0; index < length; index += 1) {
      const byte = state.buffer[offset + index];
      if (byte === 0) break;
      text += String.fromCharCode(byte);
    }
    return text;
  }

  function writeAscii(offset, slotSize, value, maxLength) {
    state.buffer.fill(0, offset, offset + slotSize);
    const text = asciiText(value, maxLength);
    for (let index = 0; index < text.length; index += 1) {
      state.buffer[offset + index] = text.charCodeAt(index);
    }
  }

  function asciiText(value, maxLength) {
    return Array.from(String(value || "")).slice(0, maxLength).map(char => {
      const code = char.charCodeAt(0);
      return code >= 0x20 && code <= 0x7E ? char : "?";
    }).join("");
  }

  function heroOwner(hero) {
    if (hero.ownerPlayerId != null) return playerColor(hero.ownerPlayerId);
    if (hero.hasRecruitedSentinel) return `Unknown #${hero.playerId}`;
    return hero.isOnMap ? "On map (neutral)" : "In recruitment pool";
  }

  function heroOwnerSelectValue(hero) {
    return hero.ownerPlayerId == null ? "" : String(hero.ownerPlayerId);
  }

  function heroOwnerOptions() {
    return [
      { value: "", label: "Unowned / available" },
      ...PLAYER_COLORS.map((label, index) => ({ value: String(index), label }))
    ];
  }

  function heroOwnerSource(hero) {
    if (hero.ownerSource) return hero.ownerSource;
    if (hero.townName) return `Town slot: ${hero.townName}`;
    return hero.isOnMap ? "Map placement only" : "Recruitment pool";
  }

  function playerColor(id) { return id < PLAYER_COLORS.length ? PLAYER_COLORS[id] : `Unknown #${id}`; }
  function heroClass(id) { return id < HERO_CLASSES.length ? HERO_CLASSES[id] : `Unknown #${id}`; }
  function townFaction(id) { return id < TOWN_FACTIONS.length ? TOWN_FACTIONS[id] : `Unknown #${id}`; }

  function creatureOptions() {
    const options = [{ value: "255", label: "(empty)" }];
    for (let id = 0; id < CREATURES.length; id += 1) options.push({ value: String(id), label: `${id}  ${CREATURES[id]}` });
    for (let id = CREATURES.length; id < 0xFF; id += 1) options.push({ value: String(id), label: `${id}  Unknown` });
    return options;
  }

  function artifactOptions() {
    const options = [{ value: "255", label: "(empty)" }];
    for (let id = 0; id < ARTIFACTS.length; id += 1) options.push({ value: String(id), label: `${id}  ${ARTIFACTS[id]}` });
    for (let id = ARTIFACTS.length; id < 0xFF; id += 1) options.push({ value: String(id), label: `${id}  Unknown` });
    return options;
  }

  function townBuildingName(bit, factionId) {
    return factionTownBuildingName(bit, factionId) || ({
      0: "Left Turret", 1: "Right Turret", 2: "Marketplace", 3: "Race growth building", 4: "Moat", 5: "Race special building",
      11: "Dwelling 1", 12: "Dwelling 2", 13: "Dwelling 3", 14: "Dwelling 4", 15: "Dwelling 5", 16: "Dwelling 6",
      17: "Upgraded Dwelling 2", 18: "Upgraded Dwelling 3", 19: "Upgraded Dwelling 4", 20: "Upgraded Dwelling 5", 21: "Upgraded Dwelling 6"
    }[bit] || `Unknown (bit ${bit})`);
  }

  function factionTownBuildingName(bit, factionId) {
    const names = {
      0: { 3: "Farm", 5: "Fortifications", 11: "Thatched Hut", 12: "Archery Range", 13: "Blacksmith", 14: "Armory", 15: "Jousting Arena", 16: "Cathedral", 17: "Upg. Archery Range", 18: "Upg. Blacksmith", 19: "Upg. Armory", 20: "Upg. Jousting Arena", 21: "Upg. Cathedral" },
      1: { 3: "Garbage Heap", 5: "Coliseum", 11: "Hut", 12: "Stick Hut", 13: "Den", 14: "Adobe", 15: "Bridge", 16: "Pyramid", 17: "Upg. Stick Hut", 19: "Upg. Adobe", 20: "Upg. Bridge" },
      2: { 3: "Crystal Garden", 5: "Rainbow", 11: "Treehouse", 12: "Cottage", 13: "Archery Range", 14: "Stonehenge", 15: "Fenced Meadow", 16: "Red Tower", 17: "Upg. Cottage", 18: "Upg. Archery Range", 19: "Upg. Stonehenge" },
      3: { 3: "Waterfall", 5: "Dungeon", 11: "Cave", 12: "Crypt", 13: "Nest", 14: "Maze", 15: "Swamp", 16: "Green Tower", 19: "Upg. Maze", 21: "Red Tower" },
      4: { 3: "Orchard", 5: "Library", 11: "Habitat", 12: "Pen", 13: "Foundry", 14: "Cliff Nest", 15: "Ivory Tower", 16: "Cloud Castle", 18: "Upg. Foundry", 20: "Upg. Ivory Tower", 21: "Upg. Cloud Castle" },
      5: { 3: "Skull Pile", 5: "Storm", 11: "Excavation", 12: "Graveyard", 13: "Pyramid", 14: "Mansion", 15: "Mausoleum", 16: "Laboratory", 17: "Upg. Graveyard", 18: "Upg. Pyramid", 19: "Upg. Mansion", 20: "Upg. Mausoleum" }
    };
    return names[factionId] && names[factionId][bit];
  }

  function townDwellingStockName(factionId, slotIndex, buildFlags) {
    const upgraded = slotIndex > 0 && (buildFlags & (1 << (16 + slotIndex))) !== 0;
    const bit = slotIndex === 0 ? 11 : upgraded ? 16 + slotIndex : 11 + slotIndex;
    const buildingName = townBuildingName(bit, factionId);
    const creatureName = townDwellingCreatureName(factionId, slotIndex, upgraded);
    return creatureName ? `${buildingName} (${creatureName})` : buildingName;
  }

  function townDwellingCreatureName(factionId, slotIndex, upgraded) {
    const ids = {
      0: [0, upgraded ? 2 : 1, upgraded ? 4 : 3, upgraded ? 6 : 5, upgraded ? 8 : 7, upgraded ? 10 : 9],
      1: [11, upgraded ? 13 : 12, 14, upgraded ? 16 : 15, upgraded ? 18 : 17, 19],
      2: [20, upgraded ? 22 : 21, upgraded ? 24 : 23, upgraded ? 26 : 25, 27, 28],
      3: [29, 30, 31, upgraded ? 33 : 32, 34, upgraded ? 36 : 35],
      4: [38, 39, upgraded ? 41 : 40, 42, upgraded ? 44 : 43, upgraded ? 46 : 45],
      5: [47, upgraded ? 49 : 48, upgraded ? 51 : 50, upgraded ? 53 : 52, upgraded ? 55 : 54, 56]
    };
    const id = ids[factionId] && ids[factionId][slotIndex];
    return id != null && id >= 0 && id < CREATURES.length ? CREATURES[id] : "";
  }

  function getAvailableDwellingStock(town, slotIndex) {
    if (slotIndex <= 0) return town.dwellingStock[slotIndex] || 0;
    return isDwellingUpgraded(town, slotIndex) ? town.upgradedDwellingStock[slotIndex - 1] || 0 : town.dwellingStock[slotIndex] || 0;
  }

  function setAvailableDwellingStock(town, slotIndex, value) {
    if (slotIndex <= 0 || !isDwellingUpgraded(town, slotIndex)) town.dwellingStock[slotIndex] = value;
    else town.upgradedDwellingStock[slotIndex - 1] = value;
  }

  function isDwellingUpgraded(town, slotIndex) {
    return slotIndex > 0 && slotIndex < 6 && (town.buildFlags & (1 << (16 + slotIndex))) !== 0;
  }

  function formatTownBuildFlags(town) {
    const combined = (BigInt(town.buildFlags) << 8n) | BigInt(town.buildFlagsPrefix);
    return `Raw value: prefix ${hex(town.buildFlagsPrefix, 2)}, +0x00 u32 ${hex(town.buildFlags, 8)}, combined 0x${combined.toString(16).toUpperCase().padStart(10, "0")}`;
  }

  function setBit(value, bit, enabled) {
    const mask = 1 << bit;
    return enabled ? (value | mask) : (value & ~mask);
  }

  function section(title, content) {
    const element = document.createElement("section");
    element.className = "editor-section";
    element.append(heading(title, 2), content);
    return element;
  }

  function hexSection(title, bytes) {
    const content = document.createElement("pre");
    content.className = "hex-view";
    content.textContent = formatHex(bytes);
    return section(title, content);
  }

  function textField(label, value, maxLength, onChange) {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = maxLength;
    input.value = value;
    input.addEventListener("input", () => onChange(input.value));
    return field(label, input);
  }

  function numericField(label, value, min, max, onChange, compact, disabled) {
    const input = numberInput(min, max, value, onChange);
    input.disabled = Boolean(disabled);
    return compact ? input : field(label, input);
  }

  function numberInput(min, max, value, onChange) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = String(min);
    input.max = String(max);
    input.step = "1";
    input.value = String(value || 0);
    input.addEventListener("change", () => {
      const next = clamp(Number(input.value), min, max);
      input.value = String(next);
      onChange(next);
    });
    return input;
  }

  function selectField(label, value, options, onChange, compact) {
    const select = document.createElement("select");
    setOptions(select, options);
    select.value = value;
    select.addEventListener("change", () => onChange(select.value));
    return compact ? select : field(label, select);
  }

  function actionField(label, text, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.addEventListener("click", onClick);
    return field(label, button);
  }

  function readonlyField(label, value) {
    const output = document.createElement("input");
    output.value = value;
    output.readOnly = true;
    return field(label, output);
  }

  function checkField(label, checked, onChange) {
    const wrapper = document.createElement("label");
    wrapper.className = "checkbox-label";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    input.addEventListener("change", () => onChange(input.checked));
    const text = document.createElement("strong");
    text.textContent = label;
    wrapper.append(input, text);
    return wrapper;
  }

  function stockField(label, value, onChange) {
    const wrapper = document.createElement("label");
    wrapper.className = "stock-row";
    wrapper.append(span(label));
    wrapper.append(numberInput(0, 0xFFFF, value, onChange));
    return wrapper;
  }

  function field(label, input) {
    const wrapper = document.createElement("label");
    wrapper.className = "field";
    wrapper.append(span(label), input);
    return wrapper;
  }

  function setOptions(select, options) {
    select.innerHTML = "";
    for (const option of options) {
      const element = document.createElement("option");
      element.value = option.value;
      element.textContent = option.label;
      select.append(element);
    }
  }

  function div(className) {
    const element = document.createElement("div");
    element.className = className;
    for (let index = 1; index < arguments.length; index += 1) {
      const child = arguments[index];
      if (child == null) continue;
      if (child instanceof Node) element.append(child);
      else element.append(document.createTextNode(String(child)));
    }
    return element;
  }

  function span(text) {
    const element = document.createElement("span");
    element.textContent = text;
    return element;
  }

  function labelText(text) {
    const element = div("grid-label", text);
    return element;
  }

  function heading(text, level) {
    const element = document.createElement(`h${level}`);
    element.textContent = text;
    return element;
  }

  function paragraph(text) {
    const element = document.createElement("p");
    element.textContent = text;
    return element;
  }

  function clamp(value, min, max) {
    const number = Number.isFinite(value) ? Math.trunc(value) : min;
    return Math.min(max, Math.max(min, number));
  }

  function hex(value, width) {
    return `0x${Number(value >>> 0).toString(16).toUpperCase().padStart(width, "0")}`;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat().format(value);
  }

  function formatHex(bytes) {
    const lines = [];
    for (let offset = 0; offset < bytes.length; offset += 16) {
      const end = Math.min(offset + 16, bytes.length);
      const hexBytes = [];
      const ascii = [];
      for (let index = offset; index < end; index += 1) {
        const byte = bytes[index];
        hexBytes.push(byte.toString(16).toUpperCase().padStart(2, "0"));
        ascii.push(byte >= 0x20 && byte < 0x7F ? String.fromCharCode(byte) : ".");
      }
      while (hexBytes.length < 16) hexBytes.push("  ");
      lines.push(`+0x${offset.toString(16).toUpperCase().padStart(3, "0")}  ${hexBytes.join(" ")}  ${ascii.join("")}`);
    }
    return lines.join("\n");
  }
})();