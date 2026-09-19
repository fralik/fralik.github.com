(function () {
  "use strict";

  const PLAYER_COLORS = ["Blue", "Green", "Red", "Yellow", "Orange", "Purple"];
  const HERO_CLASSES = ["(none)", "Knight", "Barbarian", "Sorceress", "Warlock", "Wizard", "Necromancer"];
  const TOWN_FACTIONS = ["Knight", "Barbarian", "Sorceress", "Warlock", "Wizard", "Necromancer", "Random"];
  const SECONDARY_SKILLS = [
    "Pathfinding", "Archery", "Logistics", "Scouting", "Diplomacy", "Navigation", "Leadership",
    "Wisdom", "Mysticism", "Luck", "Ballistics", "Eagle Eye", "Necromancy", "Estates"
  ];
  const SECONDARY_SKILL_LEVELS = ["None", "Basic", "Advanced", "Expert"];
  const SAVC_SPELLS = [
    "Fireball", "Fireblast", "Lightning Bolt", "Chain Lightning", "Teleport", "Cure", "Mass Cure",
    "Resurrect", "True Resurrection", "Haste", "Mass Haste", "Slow", "Mass Slow", "Blind", "Bless",
    "Mass Bless", "Stoneskin", "Steelskin", "Curse", "Mass Curse", "Holy Word", "Holy Shout",
    "Anti-Magic", "Dispel Magic", "Mass Dispel", "Magic Arrow", "Berserker", "Armageddon",
    "Elemental Storm", "Meteor Shower", "Paralyze", "Hypnotize", "Cold Ray", "Cold Ring",
    "Disrupting Ray", "Death Ripple", "Death Wave", "Dragon Slayer", "Bloodlust", "Animate Dead",
    "Mirror Image", "Shield", "Mass Shield", "Summon Earth Elemental", "Summon Air Elemental",
    "Summon Fire Elemental", "Summon Water Elemental", "Earthquake", "View Mines", "View Resources",
    "View Artifacts", "View Towns", "View Heroes", "View All", "Identify Hero", "Summon Boat",
    "Dimension Door", "Town Gate", "Town Portal", "Visions", "Haunt", "Set Earth Guardian",
    "Set Air Guardian", "Set Fire Guardian", "Set Water Guardian"
  ];
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
    level: 0x33,
    attack: 0x35,
    defense: 0x36,
    spellPower: 0x37,
    knowledge: 0x38,
    secondarySkills: 0x6A,
    secondarySkillOrder: 0x78,
    secondarySkillCount: 0x86,
    secondarySkillSlots: 14,
    secondarySkillVisibleSlots: 8,
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
    mageGuildSpellCounts: 0x37,
    mageGuildLevels: 5,
    mageGuildSpellsPerLevel: 3,
    owner: -0x18,
    faction: -0x16,
    mapX: -0x15,
    mapY: -0x14,
    name: 0x3E,
    nameSize: 14,
    slotId: 0x4B,
    castleAbsentFlag: 0x20,
    castleFlag: 0x40,
    buildingBits: [0, 1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
  };

  const SAVC_TOWN = {
    castle: 0x00000800,
    thievesGuild: 0x00000001,
    tavern: 0x00000002,
    mageGuild: 0x0007C000,
    baseDwellings: 0x03F00000,
    upgrades: 0xFC000000,
    commonBuildings: [
      { mask: 0x00000004, label: "Shipyard", readOnly: true, reason: "Shipyard availability depends on adjacent water tiles." },
      { mask: 0x00000008, bit: 6 },
      { mask: 0x00000010, label: "Statue" },
      { mask: 0x00000020, bit: 0 },
      { mask: 0x00000040, bit: 1 },
      { mask: 0x00000080, bit: 2 },
      { mask: 0x00000100, bit: 3 },
      { mask: 0x00000200, bit: 4 },
      { mask: 0x00000400, bit: 5 },
      { mask: 0x00001000, bit: 7, readOnly: true, reason: "Captain state includes serialized captain data." },
      { mask: 0x00080000, label: "Town construction tent", readOnly: true, reason: "Castle and Tent state changes require adventure-map updates." }
    ]
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

  const GMC_MAP_VISIBILITY = {
    ...MAP_VISIBILITY,
    offset: 0x612F
  };

  const GMC_MAP_OBJECTS = {
    offset: 0x7670,
    width: 72,
    height: 72,
    tileStride: 12,
    spriteFields: [0, 4],
    townSpriteStart: 0x50,
    castleSpriteStart: 0x40,
    spriteCount: 0x10,
    castleFootprint: { left: 0, top: -2, right: 7, bottom: 2 }
  };

  const GXC_GATE_OBJECTS = {
    marker: 1234,
    markerSize: 12,
    validDimensions: [36, 72, 108, 144],
    tileStride: 12,
    objectSheet: 2,
    sprite: 3,
    objectType: 9,
    tentSheet: 0xFC,
    barrierSheet: 0xFD,
    barrierType: 0xF7,
    tentType: 0xF8,
    heroType: 0xAA,
    colors: ["", "Aqua", "Blue", "Brown", "Gold", "Green", "Orange", "Purple", "Red"],
    barrierSprites: [60, 66, 72, 78, 84, 90, 96, 102],
    tentSprites: [110, 114, 118, 122, 126, 130, 134, 138]
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

  const GXC_PLAYER_ROSTERS = {
    ...PLAYER_ROSTERS,
    tentVisitMasks: [0xC6, 0xC7]
  };

  const GMC_PLAYER_ROSTERS = {
    ...PLAYER_ROSTERS,
    firstHeroCount: 0x0409,
    preserveUnusedCurrent: true
  };

  const FORMAT_PROFILES = [
    {
      id: "gxc",
      label: "Gold/expansion save (.GXC)",
      extensions: ["gxc"],
      hero: { firstOffset: HERO.firstOffset, max: HERO.max, stride: HERO.stride, spellPoints: HERO.spellPoints },
      town: { firstOffset: TOWN.firstOffset, max: TOWN.max, stride: TOWN.stride, mageGuildSpellCounts: TOWN.mageGuildSpellCounts },
      resources: { offset: RESOURCES.offset, names: RESOURCES.names },
      mapVisibility: MAP_VISIBILITY,
      gateObjects: GXC_GATE_OBJECTS,
      playerRosters: GXC_PLAYER_ROSTERS,
      supports: {
        heroOwnership: true,
        heroRecordOwnershipFallback: true,
        mapVisibility: true,
        townBuildings: true,
        dwellingStock: true
      }
    },
    {
      id: "gmc",
      label: "Standard campaign save (.GMC)",
      extensions: ["gmc"],
      hero: { firstOffset: 0x08ED, max: 54, stride: 0xEC, spellPoints: 0xE2 },
      town: { firstOffset: 0x3AFA, max: 72, stride: TOWN.stride, mageGuildPrefixBit: 0, mageGuildSpellCounts: TOWN.mageGuildSpellCounts },
      resources: { offset: 0x0497, names: RESOURCES.names },
      mapVisibility: GMC_MAP_VISIBILITY,
      mapObjects: GMC_MAP_OBJECTS,
      playerRosters: GMC_PLAYER_ROSTERS,
      supports: {
        heroOwnership: true,
        heroRecordOwnershipFallback: false,
        mapVisibility: true,
        townBuildings: true,
        dwellingStock: true
      }
    }
  ];

  const state = {
    buffer: null,
    view: null,
    fileName: "",
    formatProfile: null,
    savc: null,
    revision: 0,
    dirty: false,
    heroes: [],
    towns: [],
    gates: [],
    playerHeroRosters: [],
    playerRosterBlocks: [],
    revealOnOwnerChange: true,
    resources: {},
    activeTab: "heroes",
    filters: {
      heroes: { classValue: "", ownerValue: "" },
      towns: { classValue: "", ownerValue: "" },
      gates: { classValue: "", ownerValue: "" }
    },
    selectedType: "heroes",
    selectedIndex: null
  };

  const ui = {
    fileInput: document.getElementById("fileInput"),
    fileStatus: document.getElementById("fileStatus"),
    downloadButton: document.getElementById("downloadButton"),
    closeButton: document.getElementById("closeButton"),
    resourcePlayerField: document.getElementById("resourcePlayerField"),
    resourcePlayer: document.getElementById("resourcePlayer"),
    resourcesGrid: document.getElementById("resourcesGrid"),
    puzzlePanel: document.getElementById("puzzlePanel"),
    puzzlePlayer: document.getElementById("puzzlePlayer"),
    puzzleStatus: document.getElementById("puzzleStatus"),
    revealPuzzleButton: document.getElementById("revealPuzzleButton"),
    filtersPanel: document.getElementById("filtersPanel"),
    nameFilter: document.getElementById("nameFilter"),
    classFilter: document.getElementById("classFilter"),
    ownerFilter: document.getElementById("ownerFilter"),
    heroesTab: document.getElementById("heroesTab"),
    townsTab: document.getElementById("townsTab"),
    gatesTab: document.getElementById("gatesTab"),
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
    ui.resourcePlayer.addEventListener("change", renderResources);
    ui.puzzlePlayer.addEventListener("change", renderPuzzlePanel);
    ui.revealPuzzleButton.addEventListener("click", () => {
      try {
        Savc.revealPuzzle(state.savc, Number(ui.puzzlePlayer.value));
        markDirty();
        renderPuzzlePanel();
      } catch (error) {
        window.alert(error.message);
      }
    });
    ui.nameFilter.addEventListener("input", renderRecordList);
    ui.classFilter.addEventListener("change", () => {
      activeFilters().classValue = ui.classFilter.value;
      renderRecordList();
    });
    ui.ownerFilter.addEventListener("change", () => {
      activeFilters().ownerValue = ui.ownerFilter.value;
      renderRecordList();
    });
    ui.heroesTab.addEventListener("click", () => setActiveTab("heroes"));
    ui.townsTab.addEventListener("click", () => setActiveTab("towns"));
    ui.gatesTab.addEventListener("click", () => setActiveTab("gates"));
  }

  function populateFilters() {
    updateFilterOptions();
  }

  async function handleFileOpen(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (state.dirty && !window.confirm("Discard unsaved changes?")) {
      event.target.value = "";
      return;
    }
    ui.fileInput.disabled = true;
    ui.closeButton.disabled = true;
    ui.downloadButton.disabled = true;
    ui.editor.inert = true;
    ui.resourcesGrid.inert = true;
    ui.puzzlePanel.inert = true;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      if (/\.savc$/i.test(file.name) || (bytes[0] === 0xFF && bytes[1] === 0x03)) {
        const save = await Savc.open(bytes);
        openSavc(save, file.name);
      } else {
        openBuffer(bytes, file.name);
      }
    } catch (error) {
      if (state.buffer) window.alert(`Could not open save: ${error.message}`);
      else showEmpty(`Could not open save: ${error.message}`, true);
    } finally {
      event.target.value = "";
      ui.fileInput.disabled = false;
      ui.closeButton.disabled = !state.buffer;
      ui.downloadButton.disabled = !state.buffer;
      ui.editor.inert = false;
      ui.resourcesGrid.inert = false;
      ui.puzzlePanel.inert = false;
    }
  }

  function openBuffer(buffer, fileName) {
    const profile = detectFormat(buffer, fileName);
    state.savc = null;
    state.buffer = buffer;
    state.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    state.fileName = fileName;
    state.formatProfile = profile;
    state.heroes = findHeroes();
    state.towns = findTowns();
    readPlayerRosters();
    applyHeroOwnership();
    state.gates = findGates();
    state.resources = readResources();
    state.dirty = false;
    state.activeTab = "heroes";
    state.selectedType = "heroes";
    state.selectedIndex = state.heroes.length ? 0 : null;
    if (!state.formatProfile.supports.heroOwnership) state.filters.heroes.ownerValue = "";
    setEnabled(true);
    renderAll();
  }

  function openSavc(save, fileName) {
    state.savc = save;
    ui.puzzlePlayer.value = "";
    state.buffer = save.payload;
    state.view = new DataView(save.payload.buffer, save.payload.byteOffset, save.payload.byteLength);
    state.fileName = fileName;
    state.formatProfile = {
      id: "savc",
      label: `fheroes2 campaign (.savc, version ${save.version})`,
      town: {},
      supports: { heroOwnership: false, heroOwnerFilter: true, townBuildings: true, dwellingStock: true },
      resources: { names: Savc.RESOURCE_NAMES, savc: true }
    };
    state.heroes = save.heroes;
    state.towns = save.towns.map(town => prepareSavcTown(town));
    state.gates = [];
    state.playerHeroRosters = [];
    state.playerRosterBlocks = [];
    ui.resourcePlayer.value = "";
    state.resources = {};
    state.dirty = false;
    state.activeTab = "heroes";
    state.selectedType = "heroes";
    state.selectedIndex = state.heroes.length ? state.heroes[0].index : null;
    setEnabled(true);
    renderAll();
  }

  function closeFile() {
    if (state.dirty && !window.confirm("Discard unsaved changes?")) return;
    state.buffer = null;
    state.view = null;
    state.fileName = "";
    state.formatProfile = null;
    state.savc = null;
    state.dirty = false;
    state.heroes = [];
    state.towns = [];
    state.gates = [];
    state.playerHeroRosters = [];
    state.playerRosterBlocks = [];
    state.resources = {};
    state.selectedIndex = null;
    setEnabled(false);
    renderPuzzlePanel();
    ui.resourcePlayerField.hidden = true;
    ui.resourcesGrid.closest("section").hidden = false;
    ui.townsTab.disabled = false;
    ui.resourcesGrid.className = "resource-grid muted";
    ui.resourcesGrid.textContent = "Open a save to edit resources.";
    ui.recordList.innerHTML = "";
    ui.recordCount.textContent = "0 records";
    showEmpty("No Save Loaded");
    updateFileStatus();
  }

  function detectFormat(buffer, fileName) {
    const scored = FORMAT_PROFILES.map(profile => ({ profile, score: scoreFormat(profile, buffer, fileName) }))
      .sort((left, right) => right.score - left.score);
    const best = scored[0];
    if (!best || best.score <= 0) throw new Error("Unsupported save format or unrecognized hero table.");
    return best.profile;
  }

  function scoreFormat(profile, buffer, fileName) {
    let score = 0;
    const extension = (fileName.match(/\.([^.]+)$/) || [])[1];
    if (extension && profile.extensions.includes(extension.toLowerCase())) score += 20;

    const heroLayout = profile.hero;
    let heroesFound = 0;
    for (let index = 0; index < Math.min(heroLayout.max, 12); index += 1) {
      const offset = heroLayout.firstOffset + index * heroLayout.stride;
      if (offset + heroLayout.stride <= buffer.length && looksLikeHeroBuffer(buffer, offset)) heroesFound += 1;
    }
    score += heroesFound * 3;

    const townLayout = profile.town;
    if (townLayout && townLayout.firstOffset + townLayout.stride <= buffer.length && looksLikeTownBuffer(buffer, townLayout.firstOffset)) score += 3;
    return score;
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
    renderPuzzlePanel();
    renderRecordList();
    renderSelectedEditor();
    updateFileStatus();
  }

  function renderPuzzlePanel() {
    ui.puzzlePanel.hidden = !state.savc;
    if (!state.savc) return;
    const selected = ui.puzzlePlayer.value;
    const kingdoms = state.savc.kingdoms.filter(kingdom => kingdom.active);
    setOptions(ui.puzzlePlayer, kingdoms.map(kingdom => ({
      value: String(kingdom.color), label: playerColor(Math.log2(kingdom.color))
    })));
    if (kingdoms.some(kingdom => String(kingdom.color) === selected)) ui.puzzlePlayer.value = selected;
    const kingdom = kingdoms.find(record => record.color === Number(ui.puzzlePlayer.value));
    ui.puzzlePlayer.disabled = !kingdom;
    ui.revealPuzzleButton.disabled = !kingdom || kingdom.puzzle.revealed;
    ui.puzzleStatus.textContent = !kingdom ? "No active players" : kingdom.puzzle.revealed ? "Puzzle map fully revealed" : "Puzzle map not fully revealed";
  }

  function renderTabs() {
    const heroesActive = state.activeTab === "heroes";
    const townsActive = state.activeTab === "towns";
    const gatesActive = state.activeTab === "gates";
    updateFilterOptions();
    ui.heroesTab.classList.toggle("active", heroesActive);
    ui.townsTab.classList.toggle("active", townsActive);
    ui.gatesTab.classList.toggle("active", gatesActive);
    ui.heroesTab.setAttribute("aria-selected", String(heroesActive));
    ui.townsTab.setAttribute("aria-selected", String(townsActive));
    ui.gatesTab.setAttribute("aria-selected", String(gatesActive));
    ui.gatesTab.disabled = !state.buffer || !state.formatProfile.gateObjects;
    ui.townsTab.disabled = false;
    ui.filtersPanel.hidden = gatesActive;
    ui.nameFilter.disabled = !state.buffer || gatesActive;
    ui.classFilter.disabled = !state.buffer || gatesActive;
    ui.ownerFilter.disabled = !state.buffer || gatesActive || (heroesActive && (!state.formatProfile || (!state.formatProfile.supports.heroOwnership && !state.formatProfile.supports.heroOwnerFilter)));
  }

  function updateFilterOptions() {
    if (state.activeTab === "gates") return;
    const filters = activeFilters();
    if (state.activeTab === "towns") {
      setOptions(ui.classFilter, [{ value: "", label: "All town classes" }].concat(
        TOWN_FACTIONS.map((label, index) => ({ value: String(index), label }))
      ));
      setOptions(ui.ownerFilter, townOwnerFilterOptions());
    } else {
      setOptions(ui.classFilter, [{ value: "", label: "All hero classes" }].concat(
        HERO_CLASSES.slice(1).map((label, index) => ({ value: String(index + 1), label }))
      ));
      setOptions(ui.ownerFilter, heroOwnerFilterOptions());
    }
    setFilterSelectValue(ui.classFilter, filters, "classValue");
    setFilterSelectValue(ui.ownerFilter, filters, "ownerValue");
  }

  function setFilterSelectValue(select, filters, property) {
    const hasOption = Array.from(select.options).some(option => option.value === filters[property]);
    select.value = hasOption ? filters[property] : "";
    filters[property] = select.value;
  }

  function renderResources() {
    if (!state.buffer) return;
    const resources = state.formatProfile.resources;
    ui.resourcesGrid.closest("section").hidden = !resources;
    if (!resources) return;
    ui.resourcePlayerField.hidden = !resources.savc;
    ui.resourcesGrid.className = "resource-grid";
    ui.resourcesGrid.innerHTML = "";
    let values = state.resources;
    let writeResource = (name, value) => {
      state.resources[name] = value;
      writeResources();
    };
    if (resources.savc) {
      const selected = ui.resourcePlayer.value;
      const kingdoms = state.savc.kingdoms.filter(kingdom => kingdom.active);
      setOptions(ui.resourcePlayer, kingdoms.map(kingdom => ({
        value: String(kingdom.color), label: playerColor(Math.log2(kingdom.color))
      })));
      if (kingdoms.some(kingdom => String(kingdom.color) === selected)) ui.resourcePlayer.value = selected;
      const kingdom = kingdoms.find(record => record.color === Number(ui.resourcePlayer.value));
      ui.resourcePlayer.disabled = !kingdom;
      if (!kingdom) {
        ui.resourcesGrid.className = "resource-grid muted";
        ui.resourcesGrid.textContent = "No active players.";
        return;
      }
      values = kingdom.resources;
      writeResource = (name, value) => Savc.setKingdomResource(state.savc, kingdom.color, name, value);
    }
    for (const name of resources.names) {
      const label = document.createElement("label");
      label.className = "resource-field";
      label.append(span(name));
      const input = numberInput(0, 0xFFFFFFFF, values[name], value => {
        writeResource(name, value);
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
    const collection = activeCollection();
    const collectionLabel = state.activeTab === "gates" ? "gate colors" : state.activeTab;
    ui.recordCount.textContent = `${records.length} / ${collection.length} ${collectionLabel}`;
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
      const meta = document.createElement("div");
      meta.className = "record-meta";
      meta.textContent = state.activeTab === "gates"
        ? gateVisitSummary(record)
        : state.activeTab === "heroes"
        ? `${heroClass(record.implicitClass)} | ${heroOwner(record)} | XP ${formatNumber(record.experience)}`
        : `${townFaction(record.factionId)} | ${townOwner(record)} | slot ${record.slotId}`;
      button.append(name);
      if (state.activeTab !== "gates") {
        const offset = document.createElement("div");
        offset.className = "record-offset";
        offset.textContent = hex(record.fileOffset, 4);
        button.append(offset);
      }
      button.append(meta);
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
    if (state.activeTab === "gates") return state.gates;
    const text = ui.nameFilter.value.trim().toLowerCase();
    const filters = activeFilters();
    if (state.activeTab === "towns") {
      const cls = filters.classValue;
      const owner = filters.ownerValue;
      return state.towns.filter(town => {
        if (text && !town.name.toLowerCase().includes(text)) return false;
        if (cls && town.factionId !== Number(cls)) return false;
        if (owner === "owned" && town.ownerPlayerId == null) return false;
        if (owner === "unowned" && town.ownerPlayerId != null) return false;
        if (owner !== "" && owner !== "owned" && owner !== "unowned" && town.ownerPlayerId !== Number(owner)) return false;
        return true;
      });
    }
    const cls = filters.classValue;
    const owner = filters.ownerValue;
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
    if (tab === "gates" && (!state.formatProfile || !state.formatProfile.gateObjects)) return;
    syncFilterValues();
    state.activeTab = tab;
    state.selectedType = tab;
    const collection = activeCollection();
    state.selectedIndex = collection.length ? collection[0].index : null;
    renderTabs();
    renderRecordList();
    renderSelectedEditor();
  }

  function activeFilters() {
    return state.filters[state.activeTab] || state.filters.heroes;
  }

  function activeCollection() {
    if (state.activeTab === "gates") return state.gates;
    return state.activeTab === "heroes" ? state.heroes : state.towns;
  }

  function syncFilterValues() {
    const filters = activeFilters();
    filters.classValue = ui.classFilter.value;
    filters.ownerValue = ui.ownerFilter.value;
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
    if (state.selectedType === "gates") {
      const gate = state.gates.find(item => item.index === state.selectedIndex);
      gate ? renderGateEditor(gate) : showEmpty("Select a gate or tent to inspect.");
    } else if (state.selectedType === "towns") {
      const town = state.towns.find(item => item.index === state.selectedIndex);
      town ? renderTownEditor(town) : showEmpty("Select a town to edit.");
    } else {
      const hero = state.heroes.find(item => item.index === state.selectedIndex);
      hero ? renderHeroEditor(hero) : showEmpty("Select a hero to edit.");
    }
  }

  function renderHeroEditor(hero) {
    if (state.savc) {
      renderSavcHeroEditor(hero);
      return;
    }
    ui.editor.className = "editor";
    ui.editor.innerHTML = "";
    const layout = div("editor-layout");
    const supports = state.formatProfile.supports;
    const header = div("editor-header");
    const titleBlock = document.createElement("div");
    titleBlock.append(heading(hero.name || "(unnamed)", 2), paragraph(`${heroClass(hero.implicitClass)} | ${heroOwner(hero)} | ${hex(hero.fileOffset, 4)}`));
    header.append(titleBlock);
    layout.append(header);

    const identityFields = [
      textField("Name", hero.name, 13, value => updateHero(hero, "name", asciiText(value, 13))),
      supports.heroOwnership
        ? selectField("Owner", heroOwnerSelectValue(hero), heroOwnerOptions(), value => setHeroOwner(hero, value))
        : readonlyField("Owner", heroOwner(hero)),
      numericField("Portrait ID", hero.portraitId, 0, 255, value => updateHero(hero, "portraitId", value)),
      readonlyField("Class", heroClass(hero.implicitClass)),
      numericField("Level", hero.level, 0, 255, value => updateHero(hero, "level", value)),
      numericField("Experience", hero.experience, 0, 0xFFFFFFFF, value => updateHero(hero, "experience", value))
    ];

    if (supports.mapVisibility) {
      identityFields.splice(2, 0,
        checkField("Reveal area when owner changes", state.revealOnOwnerChange, checked => {
          state.revealOnOwnerChange = checked;
        }),
        actionField("Visibility", "Reveal for owner", () => revealHeroAreaForCurrentOwner(hero))
      );
    }

    layout.append(section("Identity", div("section-grid", ...identityFields)));

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

    const secondarySkillFields = SECONDARY_SKILLS.map((skillName, skillIndex) =>
      selectField(skillName, String(hero.secondarySkills[skillIndex] || 0), secondarySkillLevelOptions(), value => {
        hero.secondarySkills[skillIndex] = Number(value);
        writeHero(hero);
        markDirty();
        renderHeroEditor(hero);
      })
    );
    layout.append(section("Secondary Skills", div("section-grid wide-grid", ...secondarySkillFields)));

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
      readonlyField("Format", state.formatProfile.label),
      readonlyField("Record Index", String(hero.index))
    )));

    layout.append(hexSection("Raw Bytes", state.buffer.slice(hero.fileOffset, hero.fileOffset + state.formatProfile.hero.stride)));
    ui.editor.append(layout);
  }

  function renderSavcHeroEditor(hero) {
    ui.editor.className = "editor";
    ui.editor.innerHTML = "";
    const layout = div("editor-layout");
    layout.append(div("editor-header", div("",
      heading(hero.name || "(unnamed)", 2),
      paragraph(`${heroClass(hero.implicitClass)} | ${heroOwner(hero)}`)
    )));
    layout.append(section("Identity", div("section-grid",
      readonlyField("Name", hero.name),
      readonlyField("Owner", heroOwner(hero)),
      readonlyField("Class", heroClass(hero.implicitClass)),
      readonlyField("Portrait ID", hero.portraitId),
      readonlyField("Position", `${hero.positionX}, ${hero.positionY}`)
    )));
    const labels = {
      attack: "Attack", defense: "Defense", knowledge: "Knowledge", spellPower: "Spell Power",
      spellPoints: "Spell Points", movePoints: "Current Movement", experience: "Experience"
    };
    layout.append(section("Hero Stats", div("section-grid wide-grid",
      ...Object.entries(hero.fields).map(([property, descriptor]) =>
        numericField(labels[property], hero[property], 0, descriptor.max, value => {
          Savc.writeValue(state.savc, descriptor.offset, value, descriptor.max);
          hero[property] = value;
          markDirty();
          renderRecordList();
        })
      ),
      actionField("Movement", "Refill current day", () => {
        Savc.refillMovement(state.savc, hero.id);
        markDirty();
        renderSavcHeroEditor(hero);
        renderRecordList();
      })
    )));
    const skills = hero.secondary.filter(skill => skill.id > 0 && skill.level > 0);
    layout.append(section("Secondary Skills", div("section-grid wide-grid", ...SECONDARY_SKILLS.map((name, index) => {
      const skill = skills.find(entry => entry.id === index + 1);
      const control = selectField(name, String(skill ? skill.level : 0), secondarySkillLevelOptions(), value => {
        editSavcCollection(() => Savc.setSecondarySkill(state.savc, hero.id, index + 1, Number(value)));
      });
      if (!skill && skills.length >= 8) {
        control.querySelector("select").disabled = true;
        control.title = "A hero can have at most eight secondary skills.";
      }
      return control;
    }))));
    const armyGrid = div("army-grid");
    armyGrid.append(labelText("Slot"), labelText("Creature"), labelText("Count"));
    const creatures = [{ value: "0", label: "(empty)" }].concat(
      CREATURES.map((name, index) => ({ value: String(index + 1), label: `${index + 1}  ${name}` }))
    );
    const writeTroop = troop => {
      Savc.writeValue(state.savc, troop.typeOffset, troop.type, 66);
      Savc.writeValue(state.savc, troop.countOffset, troop.count);
      markDirty();
    };
    hero.army.forEach((troop, slot) => {
      armyGrid.append(div("slot-label", `#${slot + 1}`));
      armyGrid.append(selectField("", String(troop.type), creatures, value => {
        troop.type = Number(value);
        troop.count = troop.type ? Math.max(1, troop.count) : 0;
        writeTroop(troop);
        renderSavcHeroEditor(hero);
      }, true));
      armyGrid.append(numericField("", troop.count, 0, 0xFFFFFFFF, value => {
        troop.count = value;
        if (!value) troop.type = 0;
        writeTroop(troop);
        renderSavcHeroEditor(hero);
      }, true, troop.type === 0));
    });
    layout.append(section("Army", armyGrid));
    const artifactGrid = div("artifact-grid");
    const artifactChoices = [{ value: "0", label: "(empty)" }].concat(
      ARTIFACTS.map((name, index) => ({ value: String(index + 1), label: `${index + 1}  ${name}` }))
        .filter(option => Number(option.value) < 83 || Number(option.value) > 86)
    );
    for (let slot = 0; slot < 14; slot += 1) {
      const artifact = hero.artifacts[slot] || { id: 0, metadata: 0 };
      const choices = artifactChoices.slice();
      if (!choices.some(option => Number(option.value) === artifact.id)) {
        choices.push({ value: String(artifact.id), label: `${artifact.id}  Unknown (preserved)` });
      }
      const control = selectField(`Artifact #${slot + 1}`, String(artifact.id), choices, value => {
        editSavcCollection(() => Savc.setArtifact(state.savc, hero.id, slot, Number(value)));
      });
      const hasOtherBook = hero.artifacts.some((entry, index) => index !== slot && entry.id === Savc.ARTIFACT.spellBook);
      control.querySelector(`option[value="${Savc.ARTIFACT.spellBook}"]`).disabled = hasOtherBook;
      const slotFields = div("artifact-slot", control);
      if (artifact.id === Savc.ARTIFACT.spellScroll) {
        const spells = SAVC_SPELLS.map((name, index) => ({ value: String(index + 1), label: name }));
        if (!spells.some(spell => Number(spell.value) === artifact.metadata)) {
          spells.push({ value: String(artifact.metadata), label: `Unknown #${artifact.metadata} (preserved)` });
        }
        slotFields.append(selectField(`Scroll Spell #${slot + 1}`, String(artifact.metadata), spells, value => {
          editSavcCollection(() => Savc.setArtifact(state.savc, hero.id, slot, artifact.id, Number(value)));
        }));
      }
      artifactGrid.append(slotFields);
    }
    layout.append(section("Artifacts", artifactGrid));
    layout.append(section("Details", div("section-grid",
      readonlyField("Format", state.formatProfile.label),
      readonlyField("Map", state.savc.mapName),
      readonlyField("Hero ID", hero.id)
    )));
    ui.editor.append(layout);
  }

  function editSavcCollection(edit) {
    try {
      edit();
      state.buffer = state.savc.payload;
      state.view = new DataView(state.buffer.buffer, state.buffer.byteOffset, state.buffer.byteLength);
      state.heroes = state.savc.heroes;
      markDirty();
      renderPuzzlePanel();
      renderRecordList();
    } catch (error) {
      window.alert(error.message);
    }
    renderSelectedEditor();
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

    if (!state.formatProfile.supports.townBuildings || !state.formatProfile.supports.dwellingStock) {
      layout.append(hexSection("Raw Bytes", state.buffer.slice(town.fileOffset, town.fileOffset + state.formatProfile.town.stride)));
      ui.editor.append(layout);
      return;
    }

    const buildingGrid = div("building-grid");
    buildingGrid.append(checkField("Castle", town.hasCastle, checked => {
      setTownCastle(town, checked);
      writeTown(town);
      markDirty();
      renderTownEditor(town);
    }, town.isSavc, town.isSavc ? "Castle and Tent state changes require adventure-map updates." : ""));
    buildingGrid.append(checkField("Faction info building", town.hasThievesGuild, checked => {
      if (town.isSavc) editSavcTownBuildings(town, setMask(town.buildFlags, SAVC_TOWN.thievesGuild, checked));
      else {
        town.buildFlagsPrefix = setBit(town.buildFlagsPrefix, 1, checked);
        writeTown(town);
        markDirty();
        renderTownEditor(town);
      }
    }, town.isSavc && !town.hasCastle, town.isSavc && !town.hasCastle ? "Buildings cannot be changed until the town has a Castle." : ""));
    const savcRules = town.isSavc ? Savc.getTownBuildingRules(state.savc, town) : null;
    if (!town.isSavc || savcRules.tavern) {
      buildingGrid.append(checkField("Tavern", town.hasTavern, checked => {
        if (town.isSavc) editSavcTownBuildings(town, setMask(town.buildFlags, SAVC_TOWN.tavern, checked));
        else {
          town.buildFlagsPrefix = setBit(town.buildFlagsPrefix, 2, checked);
          writeTown(town);
          markDirty();
          renderTownEditor(town);
        }
      }, town.isSavc && !town.hasCastle, town.isSavc && !town.hasCastle ? "Buildings cannot be changed until the town has a Castle." : ""));
    }
    const mageGuildField = numericField("Mage Guild Level", town.mageGuildLevel, 0, 5, value => {
      town.mageGuildLevel = value;
      if (town.isSavc) {
        const mageGuild = value === 0 ? 0 : ((1 << value) - 1) << 14;
        editSavcTownBuildings(town, ((town.buildFlags & ~SAVC_TOWN.mageGuild) | mageGuild) >>> 0);
      } else {
        town.buildFlags = ((town.buildFlags & 0x00FFFFFF) | ((value & 0xFF) << 24)) >>> 0;
        writeTown(town);
        markDirty();
        renderTownEditor(town);
      }
    });
    if (town.isSavc && !town.hasCastle) {
      mageGuildField.querySelector("input").disabled = true;
      mageGuildField.title = "Buildings cannot be changed until the town has a Castle.";
    }
    buildingGrid.append(mageGuildField);
    const buildingOptions = town.isSavc
      ? savcTownBuildingOptions(town, savcRules)
      : TOWN.buildingBits.map(bit => ({ mask: 1 << bit, bit }));
    for (const option of buildingOptions) {
      const label = option.label || townBuildingName(option.bit, town.factionId);
      const disabled = option.readOnly || (town.isSavc && !town.hasCastle);
      buildingGrid.append(checkField(label, (town.buildFlags & option.mask) !== 0, checked => {
        if (town.isSavc) editSavcTownBuildings(town, updateSavcDwellingDependency(town.buildFlags, option, checked));
        else {
          town.buildFlags = setMask(town.buildFlags, option.mask, checked);
          town.mageGuildLevel = town.buildFlags >>> 24;
          writeTown(town);
          markDirty();
          renderTownEditor(town);
        }
      }, disabled, disabled ? option.reason || "Buildings cannot be changed until the town has a Castle." : ""));
    }
    const buildSection = section("Buildings", buildingGrid);
    buildSection.append(div("raw-line", formatTownBuildFlags(town)));
    layout.append(buildSection);

    const stockGrid = div("stock-grid");
    for (let slot = 0; slot < 6; slot += 1) {
      stockGrid.append(stockField(townDwellingStockName(town.factionId, slot, town.buildFlags, town.isSavc), getAvailableDwellingStock(town, slot), value => {
        setAvailableDwellingStock(town, slot, value);
        writeTown(town);
        markDirty();
      }, town.isSavc ? 0xFFFFFFFF : 0xFFFF));
    }
    layout.append(section("Dwelling Stock", stockGrid));

    const byteLength = town.byteLength || state.formatProfile.town.stride;
    layout.append(hexSection("Raw Bytes", state.buffer.slice(town.fileOffset, town.fileOffset + byteLength)));
    ui.editor.append(layout);
  }

  function renderGateEditor(gate) {
    ui.editor.className = "editor";
    ui.editor.innerHTML = "";
    const layout = div("editor-layout");
    const header = div("editor-header");
    const titleBlock = document.createElement("div");
    titleBlock.append(heading(gate.name, 2));
    header.append(titleBlock);
    layout.append(header);

    const playerList = div("gate-player-list");
    for (const player of state.playerRosterBlocks) {
      const defeated = playerIsDefeated(player);
      const masksAgree = player.tentVisitMasks.length === 2
        && player.tentVisitMasks[0] === player.tentVisitMasks[1];
      const row = document.createElement("label");
      row.className = "gate-player-row";
      row.classList.toggle("defeated", defeated);
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = masksAgree && playerHasVisitedGate(player, gate);
      checkbox.indeterminate = !masksAgree;
      checkbox.disabled = defeated || !masksAgree;
      checkbox.addEventListener("change", () => setGateVisitState(gate, player, checkbox.checked));
      const details = document.createElement("span");
      details.className = "gate-player-details";
      details.append(document.createElement("strong"), document.createElement("small"));
      details.querySelector("strong").textContent = playerColor(player.playerId);
      details.querySelector("small").textContent = defeated ? "Defeated" : playerAssetSummary(player);
      row.append(checkbox, details);
      playerList.append(row);
    }
    layout.append(section("Players", playerList));
    ui.editor.append(layout);
  }

  function findGates() {
    const gateObjects = state.formatProfile.gateObjects;
    if (!gateObjects) return [];
    const map = findGxcMap(gateObjects);
    if (!map) return [];
    const gatesByColor = new Map();
    for (let tileIndex = 0; tileIndex < map.width * map.height; tileIndex += 1) {
      const fileOffset = map.offset + tileIndex * gateObjects.tileStride;
      const objectSheet = state.buffer[fileOffset + gateObjects.objectSheet];
      const sprite = state.buffer[fileOffset + gateObjects.sprite];
      const objectType = state.buffer[fileOffset + gateObjects.objectType];
      const isBarrier = objectSheet === gateObjects.barrierSheet
        && gateObjects.barrierSprites.includes(sprite)
        && objectType === gateObjects.barrierType;
      const isTent = objectSheet === gateObjects.tentSheet
        && gateObjects.tentSprites.includes(sprite)
        && (objectType === gateObjects.tentType || objectType === gateObjects.heroType);
      const kind = isBarrier ? "Barrier" : isTent ? "Traveller's Tent" : "";
      if (!kind) continue;
      const spriteList = isBarrier ? gateObjects.barrierSprites : gateObjects.tentSprites;
      const colorIndex = spriteList.indexOf(sprite) + 1;
      if (colorIndex === 0) continue;
      const color = gateObjects.colors[colorIndex];
      let gate = gatesByColor.get(color);
      if (!gate) {
        gate = { index: gatesByColor.size, name: `${color} Gate Access`, color, colorIndex, barrierCount: 0, tentCount: 0 };
        gatesByColor.set(color, gate);
      }
      if (isBarrier) gate.barrierCount += 1;
      if (isTent) gate.tentCount += 1;
    }
    return Array.from(gatesByColor.values());
  }

  function playerHasVisitedGate(player, gate) {
    const colorMask = 1 << (gate.colorIndex - 1);
    return player.tentVisitMasks.length === 2
      && player.tentVisitMasks[0] === player.tentVisitMasks[1]
      && (player.tentVisitMasks[0] & colorMask) !== 0;
  }

  function playerIsDefeated(player) {
    return player.heroIndexes.length === 0
      && !state.towns.some(town => town.ownerPlayerId === player.playerId);
  }

  function playerAssetSummary(player) {
    const townCount = state.towns.filter(town => town.ownerPlayerId === player.playerId).length;
    const heroLabel = `${player.heroIndexes.length} ${player.heroIndexes.length === 1 ? "hero" : "heroes"}`;
    const townLabel = `${townCount} ${townCount === 1 ? "town" : "towns"}`;
    return `${heroLabel}, ${townLabel}`;
  }

  function gateVisitSummary(gate) {
    const players = state.playerRosterBlocks.filter(player => !playerIsDefeated(player));
    const visited = players.filter(player => playerHasVisitedGate(player, gate)).length;
    return `${visited} of ${players.length} players visited`;
  }

  function setGateVisitState(gate, player, visited) {
    const playerRosters = state.formatProfile.playerRosters;
    if (!player || !playerRosters || playerIsDefeated(player) || player.tentVisitMasks.length !== 2) return;
    const colorMask = 1 << (gate.colorIndex - 1);
    for (let index = 0; index < playerRosters.tentVisitMasks.length; index += 1) {
      const maskOffset = playerRosters.tentVisitMasks[index];
      const value = visited
        ? player.tentVisitMasks[index] | colorMask
        : player.tentVisitMasks[index] & ~colorMask;
      player.tentVisitMasks[index] = value;
      state.buffer[player.offset + maskOffset] = value;
    }
    markDirty();
    renderRecordList();
    renderGateEditor(gate);
  }

  function findGxcMap(gateObjects) {
    for (let offset = 0; offset <= state.buffer.length - gateObjects.markerSize; offset += 1) {
      if (readU32(offset) !== gateObjects.marker) continue;
      const width = readU32(offset + 4);
      const height = readU32(offset + 8);
      const mapEnd = offset + gateObjects.markerSize + width * height * gateObjects.tileStride;
      if (width === height && gateObjects.validDimensions.includes(width) && mapEnd <= state.buffer.length) {
        return { offset: offset + gateObjects.markerSize, width, height };
      }
    }
    return null;
  }

  function findHeroes() {
    const heroes = [];
    const heroLayout = state.formatProfile.hero;
    for (let index = 0; index < heroLayout.max; index += 1) {
      const offset = heroLayout.firstOffset + index * heroLayout.stride;
      if (offset + heroLayout.stride > state.buffer.length) break;
      if (looksLikeHero(offset)) heroes.push(readHero(offset, index));
    }
    return heroes;
  }

  function looksLikeHero(offset) {
    return looksLikeHeroBuffer(state.buffer, offset);
  }

  function looksLikeHeroBuffer(buffer, offset) {
    let nameLength = 0;
    for (; nameLength < HERO.nameSize; nameLength += 1) {
      const byte = buffer[offset + nameLength];
      if (byte === 0) break;
      if (byte < 0x20 || byte > 0x7E) return false;
    }
    if (nameLength === 0 || nameLength >= HERO.nameSize) return false;
    if (buffer[offset + HERO.portrait] > 127) return false;
    const sentinel = readU16Buffer(buffer, offset + HERO.sentinel);
    if (sentinel !== 0xFEFF && sentinel !== 0xFFFF) return false;
    return true;
  }

  function readHero(offset, index) {
    const hero = {
      fileOffset: offset,
      index,
      name: readAscii(offset + HERO.name, HERO.nameSize),
      portraitId: state.buffer[offset + HERO.portrait],
      experience: readU32(offset + HERO.experience),
      level: state.buffer[offset + HERO.level],
      implicitClass: Math.floor(index / 9) + 1,
      positionX: readI32(offset + HERO.positionX),
      positionY: readI32(offset + HERO.positionY),
      attack: state.buffer[offset + HERO.attack],
      defense: state.buffer[offset + HERO.defense],
      spellPower: state.buffer[offset + HERO.spellPower],
      knowledge: state.buffer[offset + HERO.knowledge],
      spellPoints: readU16(offset + heroFieldOffset("spellPoints")),
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
      secondarySkills: [],
      secondarySkillOrder: [],
      secondarySkillCount: 0,
      armyTypes: [],
      armyCounts: [],
      artifacts: []
    };
    hero.hasRecruitedSentinel = hero.sentinel === 0xFEFF;
    hero.isRecruited = hero.hasRecruitedSentinel;
    hero.isOnMap = hero.hasRecruitedSentinel || hero.positionX !== 0 || hero.positionY !== 0;
    hero.ownerPlayerId = usesHeroRecordOwnershipFallback() && hero.hasRecruitedSentinel && hero.playerId < 6 ? hero.playerId : null;
    hero.ownerSource = hero.ownerPlayerId == null ? "" : "Hero record sentinel";
    for (let slot = 0; slot < HERO.secondarySkillSlots; slot += 1) {
      hero.secondarySkills.push(state.buffer[offset + heroFieldOffset("secondarySkills") + slot]);
      hero.secondarySkillOrder.push(state.buffer[offset + heroFieldOffset("secondarySkillOrder") + slot]);
    }
    hero.secondarySkillCount = readU16(offset + heroFieldOffset("secondarySkillCount"));
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
    normalizeSecondarySkillOrder(hero);
    writeAscii(offset + HERO.name, HERO.nameSize, hero.name, 13);
    state.buffer[offset + HERO.portrait] = clamp(hero.portraitId, 0, 255);
    writeU32(offset + HERO.experience, hero.experience);
    writeU16(offset + heroFieldOffset("spellPoints"), hero.spellPoints);
    writeU32(offset + HERO.movePoints, hero.movePoints);
    writeU32(offset + HERO.moveBonus, hero.moveBonus);
    state.buffer[offset + HERO.level] = clamp(hero.level, 0, 255);
    state.buffer[offset + HERO.attack] = clamp(hero.attack, 0, 255);
    state.buffer[offset + HERO.defense] = clamp(hero.defense, 0, 255);
    state.buffer[offset + HERO.spellPower] = clamp(hero.spellPower, 0, 255);
    state.buffer[offset + HERO.knowledge] = clamp(hero.knowledge, 0, 255);
    for (let slot = 0; slot < HERO.secondarySkillSlots; slot += 1) {
      state.buffer[offset + heroFieldOffset("secondarySkills") + slot] = clamp(hero.secondarySkills[slot], 0, SECONDARY_SKILL_LEVELS.length - 1);
      state.buffer[offset + heroFieldOffset("secondarySkillOrder") + slot] = clamp(hero.secondarySkillOrder[slot], 0, HERO.secondarySkillVisibleSlots);
    }
    writeU16(offset + heroFieldOffset("secondarySkillCount"), hero.secondarySkillCount);
    for (let slot = 0; slot < 5; slot += 1) {
      state.buffer[hero.armyOffset + slot] = clamp(hero.armyTypes[slot], 0, 255);
      writeU16(hero.armyOffset + 5 + slot * 2, hero.armyCounts[slot]);
    }
    for (let slot = 0; slot < HERO.artifactSlots; slot += 1) {
      state.buffer[offset + HERO.artifacts + slot] = clamp(hero.artifacts[slot], 0, 255);
    }
  }

  function heroFieldOffset(field) {
    const layout = state.formatProfile && state.formatProfile.hero;
    return layout && layout[field] != null ? layout[field] : HERO[field];
  }

  function usesHeroRecordOwnershipFallback() {
    return Boolean(state.formatProfile && state.formatProfile.supports.heroRecordOwnershipFallback);
  }

  function normalizeSecondarySkillOrder(hero) {
    const orderedSkills = [];
    const unorderedSkills = [];
    const usedOrders = new Set();
    for (let skillIndex = 0; skillIndex < HERO.secondarySkillSlots; skillIndex += 1) {
      const level = clamp(hero.secondarySkills[skillIndex] || 0, 0, SECONDARY_SKILL_LEVELS.length - 1);
      hero.secondarySkills[skillIndex] = level;
      if (level === 0) continue;
      const order = clamp(hero.secondarySkillOrder[skillIndex] || 0, 0, HERO.secondarySkillVisibleSlots);
      if (order > 0 && !usedOrders.has(order)) {
        orderedSkills.push({ skillIndex, order });
        usedOrders.add(order);
      } else {
        unorderedSkills.push(skillIndex);
      }
    }

    orderedSkills.sort((left, right) => left.order - right.order || left.skillIndex - right.skillIndex);
    const visibleSkills = orderedSkills.map(item => item.skillIndex).concat(unorderedSkills).slice(0, HERO.secondarySkillVisibleSlots);
    hero.secondarySkillOrder = Array(HERO.secondarySkillSlots).fill(0);
    visibleSkills.forEach((skillIndex, position) => {
      hero.secondarySkillOrder[skillIndex] = position + 1;
    });
    hero.secondarySkillCount = visibleSkills.length;
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
    const townLayout = state.formatProfile.town;
    if (!townLayout) return towns;
    for (let index = 0; index < townLayout.max; index += 1) {
      const offset = townLayout.firstOffset + index * townLayout.stride;
      if (offset + townLayout.stride > state.buffer.length) break;
      if (looksLikeTown(offset)) towns.push(readTown(offset, index));
      else if (towns.length > 0) break;
    }
    return towns;
  }

  function looksLikeTown(offset) {
    return looksLikeTownBuffer(state.buffer, offset);
  }

  function looksLikeTownBuffer(buffer, offset) {
    const nameStart = offset + TOWN.name;
    let nameLength = 0;
    for (; nameLength < TOWN.nameSize; nameLength += 1) {
      const byte = buffer[nameStart + nameLength];
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
      mapX: readTownMapCoordinate(offset + TOWN.mapX),
      mapY: readTownMapCoordinate(offset + TOWN.mapY),
      visitingHeroIndex: state.buffer[offset + TOWN.visitingHero],
      buildFlagsPrefix: offset > 0 ? state.buffer[offset - 1] : 0,
      buildFlags: readU32(offset + TOWN.buildFlags),
      dwellingStock: [],
      upgradedDwellingStock: []
    };
    town.hasThievesGuild = (town.buildFlagsPrefix & 0x02) !== 0;
    town.hasTavern = (town.buildFlagsPrefix & 0x04) !== 0;
    town.hasCastle = (town.buildFlagsPrefix & TOWN.castleFlag) !== 0;
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

  function readTownMapCoordinate(offset) {
    if (offset < 0 || offset >= state.buffer.length) return null;
    const coordinate = state.buffer[offset];
    return coordinate === 0xFF ? null : coordinate;
  }

  function writeTown(town) {
    if (town.isSavc) {
      Savc.setTownBuildings(state.savc, town.index, town.buildFlags);
      town.dwellingStock.forEach((count, slot) => Savc.setTownDwelling(state.savc, town.index, slot, count));
      town.hasThievesGuild = (town.buildFlags & SAVC_TOWN.thievesGuild) !== 0;
      town.hasTavern = (town.buildFlags & SAVC_TOWN.tavern) !== 0;
      town.hasCastle = (town.buildFlags & SAVC_TOWN.castle) !== 0;
      town.mageGuildLevel = savcMageGuildLevel(town.buildFlags);
      return;
    }
    const offset = town.fileOffset;
    const mageGuildPrefixBit = state.formatProfile.town && state.formatProfile.town.mageGuildPrefixBit;
    if (mageGuildPrefixBit != null) {
      town.buildFlagsPrefix = setBit(town.buildFlagsPrefix, mageGuildPrefixBit, town.mageGuildLevel > 0);
    }
    writeTownMageGuildSpellCounts(town);
    if (offset > 0) state.buffer[offset - 1] = town.buildFlagsPrefix;
    writeU32(offset + TOWN.buildFlags, town.buildFlags);
    for (let slot = 0; slot < 6; slot += 1) writeU16(offset + TOWN.dwellingStock + slot * 2, town.dwellingStock[slot] || 0);
    for (let slot = 0; slot < 5; slot += 1) writeU16(offset + TOWN.upgradedDwellingStock + slot * 2, town.upgradedDwellingStock[slot] || 0);
    town.hasThievesGuild = (town.buildFlagsPrefix & 0x02) !== 0;
    town.hasTavern = (town.buildFlagsPrefix & 0x04) !== 0;
    town.hasCastle = (town.buildFlagsPrefix & TOWN.castleFlag) !== 0;
    town.mageGuildLevel = town.buildFlags >>> 24;
  }

  function setTownCastle(town, enabled) {
    if (town.isSavc) {
      town.buildFlags = setMask(town.buildFlags, SAVC_TOWN.castle, enabled);
      town.hasCastle = enabled;
      return;
    }
    town.buildFlagsPrefix = enabled
      ? (town.buildFlagsPrefix | TOWN.castleFlag) & ~TOWN.castleAbsentFlag
      : (town.buildFlagsPrefix | TOWN.castleAbsentFlag) & ~TOWN.castleFlag;
    town.hasCastle = enabled;
    syncTownCastleMapObject(town, enabled);
  }

  function syncTownCastleMapObject(town, enabled) {
    const mapObjects = state.formatProfile && state.formatProfile.mapObjects;
    if (!mapObjects || !hasValidTownMapPosition(town, mapObjects)) return;

    const footprint = mapObjects.castleFootprint;
    const sourceStart = enabled ? mapObjects.townSpriteStart : mapObjects.castleSpriteStart;
    const targetStart = enabled ? mapObjects.castleSpriteStart : mapObjects.townSpriteStart;
    const sourceEnd = sourceStart + mapObjects.spriteCount;
    const startY = Math.max(0, town.mapY + footprint.top);
    const endY = Math.min(mapObjects.height - 1, town.mapY + footprint.bottom);
    const startX = Math.max(0, town.mapX + footprint.left);
    const endX = Math.min(mapObjects.width - 1, town.mapX + footprint.right);

    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        const tileOffset = mapObjects.offset + (y * mapObjects.width + x) * mapObjects.tileStride;
        for (const field of mapObjects.spriteFields) {
          const spriteOffset = tileOffset + field;
          const sprite = state.buffer[spriteOffset];
          if (sprite >= sourceStart && sprite < sourceEnd) {
            state.buffer[spriteOffset] = targetStart + (sprite - sourceStart);
          }
        }
      }
    }
  }

  function hasValidTownMapPosition(town, mapObjects) {
    const mapEnd = mapObjects.offset + mapObjects.width * mapObjects.height * mapObjects.tileStride;
    return state.buffer.length >= mapEnd
      && town.mapX != null
      && town.mapY != null
      && town.mapX >= 0
      && town.mapX < mapObjects.width
      && town.mapY >= 0
      && town.mapY < mapObjects.height;
  }

  function writeTownMageGuildSpellCounts(town) {
    const spellCountsOffset = state.formatProfile.town && state.formatProfile.town.mageGuildSpellCounts;
    if (spellCountsOffset == null) return;
    const level = clamp(town.mageGuildLevel, 0, TOWN.mageGuildLevels);
    for (let index = 0; index < TOWN.mageGuildLevels; index += 1) {
      state.buffer[town.fileOffset + spellCountsOffset + index] = index < level ? TOWN.mageGuildSpellsPerLevel : 0;
    }
  }

  function readPlayerRosters() {
    state.playerHeroRosters = [];
    state.playerRosterBlocks = [];
    const playerRosters = state.formatProfile.playerRosters;
    if (!playerRosters) return;
    const heroLayout = state.formatProfile.hero;
    for (let playerId = 0; playerId < PLAYER_COLORS.length; playerId += 1) {
      const offset = playerRosters.firstHeroCount + playerId * playerRosters.stride;
      const rosterStart = offset + playerRosters.heroRoster;
      if (state.buffer.length <= rosterStart + playerRosters.heroRosterSlots) break;

      const currentHero = state.buffer[offset + playerRosters.currentHero];
      const heroCount = clamp(state.buffer[offset + playerRosters.heroCount], 0, playerRosters.heroRosterSlots);
      const seen = new Set();
      const heroIndexes = [];
      for (let slot = 0; slot < heroCount; slot += 1) {
        const heroIndex = state.buffer[rosterStart + slot];
        if (heroIndex >= heroLayout.max || seen.has(heroIndex)) continue;
        seen.add(heroIndex);
        heroIndexes.push(heroIndex);
        state.playerHeroRosters.push({
          index: heroIndex,
          playerId,
          slot: heroIndexes.length - 1,
          isSelected: currentHero === heroIndex
        });
      }
      const tentVisitMasks = (playerRosters.tentVisitMasks || []).map(maskOffset => state.buffer[offset + maskOffset]);
      state.playerRosterBlocks.push({ playerId, offset, currentHero, heroIndexes, tentVisitMasks, hadHeroes: heroIndexes.length > 0 });
    }
  }

  function writePlayerRosters() {
    const playerRosters = state.formatProfile.playerRosters;
    if (!playerRosters) return;
    const heroLayout = state.formatProfile.hero;
    for (const block of state.playerRosterBlocks) {
      const rosterStart = block.offset + playerRosters.heroRoster;
      const heroIndexes = block.heroIndexes.slice(0, playerRosters.heroRosterSlots);
      let selectedHero = block.currentHero;
      if (selectedHero < heroLayout.max && !heroIndexes.includes(selectedHero)) {
        selectedHero = heroIndexes.length || !playerRosters.preserveUnusedCurrent || block.hadHeroes
          ? (heroIndexes[0] == null ? playerRosters.emptyHero : heroIndexes[0])
          : block.currentHero;
      }

      state.buffer[block.offset + playerRosters.heroCount] = heroIndexes.length;
      state.buffer[block.offset + playerRosters.currentHero] = selectedHero;
      for (let slot = 0; slot < playerRosters.heroRosterSlots; slot += 1) {
        state.buffer[rosterStart + slot] = heroIndexes[slot] == null ? playerRosters.emptyHero : heroIndexes[slot];
      }
      block.currentHero = selectedHero;
      block.heroIndexes = heroIndexes;
      block.hadHeroes = heroIndexes.length > 0;
    }
  }

  function setHeroOwner(hero, value) {
    if (!state.formatProfile.supports.heroOwnership) {
      window.alert("Hero ownership editing is not mapped for this save format yet.");
      renderHeroEditor(hero);
      return;
    }
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
    const playerRosters = state.formatProfile.playerRosters;
    if (targetBlock && !targetBlock.heroIndexes.includes(hero.index) && targetBlock.heroIndexes.length >= playerRosters.heroRosterSlots) {
      window.alert(`${playerColor(targetPlayerId)} already has ${playerRosters.heroRosterSlots} heroes.`);
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
    const mapVisibility = state.formatProfile.mapVisibility;
    if (!mapVisibility) {
      if (showAlerts) window.alert("Map visibility editing is not mapped for this save format yet.");
      return false;
    }
    if (!hasValidMapPosition(hero)) {
      if (showAlerts) window.alert(`${hero.name} does not have a map position to reveal.`);
      return false;
    }
    const end = mapVisibility.offset + mapVisibility.width * mapVisibility.height;
    if (state.buffer.length < end) {
      if (showAlerts) window.alert("This save is too small for the known visibility grid.");
      return false;
    }

    const mask = 1 << playerId;
    const radius = mapVisibility.heroRadius;
    for (let y = Math.max(0, hero.positionY - radius); y <= Math.min(mapVisibility.height - 1, hero.positionY + radius); y += 1) {
      for (let x = Math.max(0, hero.positionX - radius); x <= Math.min(mapVisibility.width - 1, hero.positionX + radius); x += 1) {
        const dx = x - hero.positionX;
        const dy = y - hero.positionY;
        if (dx * dx + dy * dy > radius * radius) continue;
        state.buffer[mapVisibility.offset + y * mapVisibility.width + x] |= mask;
      }
    }
    return true;
  }

  function hasValidMapPosition(hero) {
    const mapVisibility = state.formatProfile.mapVisibility;
    if (!mapVisibility) return false;
    return hero.positionX >= 0 && hero.positionX < mapVisibility.width
      && hero.positionY >= 0 && hero.positionY < mapVisibility.height
      && (hero.positionX !== 0 || hero.positionY !== 0 || hero.isOnMap);
  }

  function playerRosterBlock(playerId) {
    return state.playerRosterBlocks.find(block => block.playerId === playerId) || null;
  }

  function applyHeroOwnership() {
    const heroLayout = state.formatProfile.hero;
    const rosterByHero = new Map(state.playerHeroRosters.map(entry => [entry.index, entry]));
    const townByHero = new Map(state.towns
      .filter(town => town.visitingHeroIndex < heroLayout.max)
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
      } else if (usesHeroRecordOwnershipFallback() && hero.hasRecruitedSentinel && hero.playerId < PLAYER_COLORS.length) {
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
    const resourcesProfile = state.formatProfile.resources;
    if (state.buffer.length < resourcesProfile.offset + resourcesProfile.names.length * 4) {
      throw new Error("Buffer too small for resources record.");
    }
    const resources = {};
    for (let index = 0; index < resourcesProfile.names.length; index += 1) {
      resources[resourcesProfile.names[index]] = readU32(resourcesProfile.offset + index * 4);
    }
    return resources;
  }

  function writeResources() {
    const resourcesProfile = state.formatProfile.resources;
    for (let index = 0; index < resourcesProfile.names.length; index += 1) {
      writeU32(resourcesProfile.offset + index * 4, state.resources[resourcesProfile.names[index]] || 0);
    }
  }

  async function downloadEditedSave() {
    if (!state.buffer) return;
    const buffer = state.buffer;
    const fileName = state.fileName;
    const revision = state.revision;
    ui.downloadButton.disabled = true;
    try {
      const bytes = state.savc
        ? await Savc.pack({ prefix: state.savc.prefix, payload: buffer.slice() })
        : buffer;
      const blob = new Blob([bytes], { type: "application/octet-stream" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = editedFileName(fileName || "save.GXC");
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      if (state.buffer === buffer && state.revision === revision) state.dirty = false;
      updateFileStatus();
    } catch (error) {
      window.alert(`Could not export save: ${error.message}`);
    } finally {
      ui.downloadButton.disabled = !state.buffer;
    }
  }

  function editedFileName(name) {
    const match = name.match(/^(.*?)(\.[^.]+)?$/);
    return `${match[1] || "save"}.edited${match[2] || ".GXC"}`;
  }

  function markDirty() {
    state.dirty = true;
    state.revision += 1;
    updateFileStatus();
  }

  function updateFileStatus() {
    if (!state.buffer) {
      ui.fileStatus.textContent = "No save loaded";
      document.title = "HoMM2 Save Editor";
      return;
    }
    const dirty = state.dirty ? " | modified" : "";
    ui.fileStatus.textContent = `${state.fileName} | ${state.formatProfile.label} | ${formatNumber(state.buffer.length)} bytes | ${state.heroes.length} heroes | ${state.towns.length} towns${dirty}`;
    document.title = `${state.dirty ? "* " : ""}${state.fileName} - HoMM2 Save Editor`;
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
  function readU16Buffer(buffer, offset) { return buffer[offset] | (buffer[offset + 1] << 8); }

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
    if (usesHeroRecordOwnershipFallback() && hero.hasRecruitedSentinel) return `Unknown #${hero.playerId}`;
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

  function heroOwnerFilterOptions() {
    return [
      { value: "", label: "All heroes" },
      { value: "recruited", label: "All owned (by any player)" },
      { value: "available", label: "Available" },
      ...PLAYER_COLORS.map((label, index) => ({ value: String(index), label: `${label} owned` }))
    ];
  }

  function townOwner(town) {
    return town.ownerPlayerId == null ? "Unowned" : playerColor(town.ownerPlayerId);
  }

  function townOwnerFilterOptions() {
    return [
      { value: "", label: "All towns" },
      { value: "owned", label: "All owned (by any player)" },
      { value: "unowned", label: "Unowned" },
      ...PLAYER_COLORS.map((label, index) => ({ value: String(index), label: `${label} owned` }))
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

  function secondarySkillLevelOptions() {
    return SECONDARY_SKILL_LEVELS.map((label, index) => ({ value: String(index), label }));
  }

  function townBuildingName(bit, factionId) {
    return factionTownBuildingName(bit, factionId) || ({
      0: "Left Turret", 1: "Right Turret", 2: "Marketplace", 3: "Race growth building", 4: "Moat", 5: "Race special building", 6: "Well", 7: "Captain's Quarters",
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

  function townDwellingStockName(factionId, slotIndex, buildFlags, isSavc = false) {
    const upgraded = isDwellingUpgraded({ buildFlags, isSavc }, slotIndex);
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
    if (town.isSavc) return town.dwellingStock[slotIndex] || 0;
    if (slotIndex <= 0) return town.dwellingStock[slotIndex] || 0;
    return isDwellingUpgraded(town, slotIndex) ? town.upgradedDwellingStock[slotIndex - 1] || 0 : town.dwellingStock[slotIndex] || 0;
  }

  function setAvailableDwellingStock(town, slotIndex, value) {
    if (town.isSavc) {
      town.dwellingStock[slotIndex] = value;
      return;
    }
    if (slotIndex <= 0 || !isDwellingUpgraded(town, slotIndex)) town.dwellingStock[slotIndex] = value;
    else town.upgradedDwellingStock[slotIndex - 1] = value;
  }

  function isDwellingUpgraded(town, slotIndex) {
    if (town.isSavc) return slotIndex > 0 && slotIndex < 6 && (town.buildFlags & (0x04000000 << (slotIndex - 1))) !== 0;
    return slotIndex > 0 && slotIndex < 6 && (town.buildFlags & (1 << (16 + slotIndex))) !== 0;
  }

  function formatTownBuildFlags(town) {
    if (town.isSavc) return `Constructed buildings: ${hex(town.buildFlags, 8)}`;
    const combined = (BigInt(town.buildFlags) << 8n) | BigInt(town.buildFlagsPrefix);
    return `Raw value: prefix ${hex(town.buildFlagsPrefix, 2)}, +0x00 u32 ${hex(town.buildFlags, 8)}, combined 0x${combined.toString(16).toUpperCase().padStart(10, "0")}`;
  }

  function setBit(value, bit, enabled) {
    const mask = 1 << bit;
    return enabled ? (value | mask) : (value & ~mask);
  }

  function setMask(value, mask, enabled) {
    return (enabled ? value | mask : value & ~mask) >>> 0;
  }

  function savcTownBuildingOptions(town, rules) {
    const options = SAVC_TOWN.commonBuildings.slice();
    if (rules.shrine) options.push({ mask: 0x00002000, label: "Shrine" });
    for (let level = 1; level <= 6; level += 1) {
      options.push({ mask: 0x00100000 << (level - 1), bit: 10 + level, dwellingLevel: level });
    }
    for (let level = 2; level <= 6; level += 1) {
      const mask = (0x04000000 << (level - 2)) >>> 0;
      if ((rules.allowedUpgrades & mask) !== 0) options.push({ mask, bit: 15 + level, upgradeLevel: level });
    }
    if ((rules.allowedUpgrades & 0x80000000) !== 0) {
      options.push({ mask: 0x80000000, label: town.factionId === 3 ? "Black Tower" : "Second Upgrade Dwelling 6", upgradeLevel: 7 });
    }
    return options;
  }

  function updateSavcDwellingDependency(buildFlags, option, enabled) {
    let next = setMask(buildFlags, option.mask, enabled);
    if (option.dwellingLevel && !enabled && option.dwellingLevel > 1) {
      next = setMask(next, 0x04000000 << (option.dwellingLevel - 2), false);
      if (option.dwellingLevel === 6) next = setMask(next, 0x80000000, false);
    }
    if (option.upgradeLevel && enabled) {
      const dwellingLevel = Math.min(option.upgradeLevel, 6);
      next = setMask(next, 0x00100000 << (dwellingLevel - 1), true);
      if (option.upgradeLevel === 7) next = setMask(next, 0x40000000, true);
    }
    if (option.upgradeLevel === 6 && !enabled) next = setMask(next, 0x80000000, false);
    return next;
  }

  function editSavcTownBuildings(town, buildFlags) {
    try {
      Savc.setTownBuildings(state.savc, town.index, buildFlags);
      town.buildFlags = buildFlags >>> 0;
      town.hasThievesGuild = (town.buildFlags & SAVC_TOWN.thievesGuild) !== 0;
      town.hasTavern = (town.buildFlags & SAVC_TOWN.tavern) !== 0;
      town.mageGuildLevel = savcMageGuildLevel(town.buildFlags);
      markDirty();
    } catch (error) {
      window.alert(error.message);
    }
    renderTownEditor(town);
  }

  function savcMageGuildLevel(buildFlags) {
    for (let level = 5; level > 0; level -= 1) {
      if ((buildFlags & (0x00004000 << (level - 1))) !== 0) return level;
    }
    return 0;
  }

  function prepareSavcTown(town) {
    town.isSavc = true;
    town.slotId = town.index;
    town.buildFlagsPrefix = 0;
    town.upgradedDwellingStock = [];
    town.hasThievesGuild = (town.buildFlags & SAVC_TOWN.thievesGuild) !== 0;
    town.hasTavern = (town.buildFlags & SAVC_TOWN.tavern) !== 0;
    town.hasCastle = (town.buildFlags & SAVC_TOWN.castle) !== 0;
    town.mageGuildLevel = savcMageGuildLevel(town.buildFlags);
    return town;
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

  function checkField(label, checked, onChange, disabled = false, title = "") {
    const wrapper = document.createElement("label");
    wrapper.className = "checkbox-label";
    wrapper.classList.toggle("disabled", disabled);
    wrapper.title = title;
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    input.disabled = disabled;
    input.addEventListener("change", () => onChange(input.checked));
    const text = document.createElement("strong");
    text.textContent = label;
    wrapper.append(input, text);
    return wrapper;
  }

  function stockField(label, value, onChange, maximum = 0xFFFF) {
    const wrapper = document.createElement("label");
    wrapper.className = "stock-row";
    wrapper.append(span(label));
    wrapper.append(numberInput(0, maximum, value, onChange));
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