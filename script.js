/*************************************************
 * PLAYER STATE
 *************************************************/
let player = {
  health: 100,
  maxHealth: 100,
  skillLevel: 1,
  skillPoints: 0,
  morality: 0,
  faction: "Neutral",
  location: 0,
  inventory: [],
  skills: {},
  reputation: {
    Order: 0,
    Ashborn: 0,
    Wildfolk: 0
  },
  quests: {},
  flags: {}
};

/*************************************************
 * WORLD MAP (50 LOCATIONS)
 *************************************************/
const locations = [];
for (let i = 0; i < 50; i++) {
  locations.push({
    id: i,
    name: `Region ${i}`,
    desc: `A scarred land shaped by forgotten wars (${i}).`,
    npc: `npc${i * 2}`,
    boss: i % 10 === 0 ? `boss${i}` : null
  });
}

/*************************************************
 * NPCS — 100 UNIQUE PERSONALITIES
 *************************************************/
const personalityTypes = [
  "Bitter survivor","Hopeful idealist","Fanatical zealot","Broken scholar",
  "Greedy trader","Silent watcher","Cruel opportunist","Kind healer",
  "Traumatized soldier","Laughing nihilist"
];

const npcs = {};
for (let i = 0; i < 100; i++) {
  const type = personalityTypes[i % personalityTypes.length];

  npcs[`npc${i}`] = {
    name: `NPC ${i}`,
    personality: type,
    moralityBias: i % 2 === 0 ? 1 : -1,
    factionBias: i % 3 === 0 ? "Order" : i % 3 === 1 ? "Ashborn" : "Wildfolk",
    dialogue: [
      `[${type}] "This land remembers every sin."`,
      `[${type}] "You walk like someone who hasn’t chosen yet."`,
      `[${type}] "Whatever you do—own it."`
    ],
    givesQuest: i % 5 === 0,
    givesSkill: i % 7 === 0
  };
}

/*************************************************
 * QUEST CHAINS
 *************************************************/
const quests = {};
for (let i = 0; i < 15; i++) {
  quests[`quest${i}`] = {
    stage: 0,
    steps: [
      "Investigate the ruins.",
      "Choose who to help.",
      "Deal with the aftermath."
    ],
    completed: false
  };
}

/*************************************************
 * BOSSES
 *************************************************/
const bosses = {};
for (let i = 0; i < 5; i++) {
  bosses[`boss${i * 10}`] = {
    name: `Warden of Ash ${i}`,
    health: 80 + i * 30,
    attack: 12 + i * 6
  };
}

/*************************************************
 * SKILL TREE
 *************************************************/
const skillTree = {
  combat: {
    powerStrike: {
      name: "Power Strike",
      cost: 1,
      effect: () => player.flags.powerStrike = true
    },
    endurance: {
      name: "Endurance",
      cost: 1,
      effect: () => {
        player.maxHealth += 20;
        player.health += 20;
      }
    }
  },
  social: {
    silverTongue: {
      name: "Silver Tongue",
      cost: 1,
      effect: () => player.flags.silverTongue = true
    },
    intimidation: {
      name: "Intimidation",
      cost: 1,
      effect: () => player.flags.intimidation = true
    }
  },
  survival: {
    scavenger: {
      name: "Scavenger",
      cost: 1,
      effect: () => player.flags.scavenger = true
    },
    ironWill: {
      name: "Iron Will",
      cost: 1,
      effect: () => player.flags.ironWill = true
    }
  }
};

/*************************************************
 * UI RENDERING
 *************************************************/
function render() {
  document.getElementById("health").textContent = player.health;
  document.getElementById("skill").textContent = player.skillLevel;
  document.getElementById("morality").textContent = player.morality;
  document.getElementById("faction").textContent = player.faction;

  const loc = locations[player.location];
  document.getElementById("location-name").textContent = loc.name;
  document.getElementById("location-desc").textContent = loc.desc;

  renderMap();
  renderChoices();
}

/*************************************************
 * MAP
 *************************************************/
function renderMap() {
  const map = document.getElementById("map");
  map.innerHTML = "";
  locations.forEach(loc => {
    const tile = document.createElement("div");
    tile.className = "map-tile";
    tile.textContent = loc.id;
    tile.onclick = () => {
      player.location = loc.id;
      log(`You travel to ${loc.name}.`);
      render();
    };
    map.appendChild(tile);
  });
}

/*************************************************
 * CHOICES
 *************************************************/
function renderChoices() {
  const div = document.getElementById("choices");
  div.innerHTML = "";

  const loc = locations[player.location];

  addChoice("Explore", explore);

  if (loc.npc) addChoice("Talk to NPC", () => talkNPC(loc.npc));
  if (loc.boss) addChoice("Fight Boss", () => fightBoss(loc.boss));

  addChoice("Make Moral Choice", moralChoice);
}

/*************************************************
 * NPC INTERACTION
 *************************************************/
function talkNPC(id) {
  const npc = npcs[id];
  npc.dialogue.forEach(d => log(`${npc.name}: ${d}`));

  player.morality += npc.moralityBias;
  player.reputation[npc.factionBias]++;

  if (npc.givesQuest) {
    const q = Object.keys(quests).find(q => !player.quests[q]);
    if (q) {
      player.quests[q] = 0;
      log("📜 Quest started.");
    }
  }

  if (npc.givesSkill) {
    player.skillPoints++;
    log("⭐ You gained a skill point.");
  }

  updateFaction();
  render();
}

/*************************************************
 * SKILLS
 *************************************************/
function learnSkill(branch, skill) {
  const s = skillTree[branch][skill];
  if (player.skillPoints < s.cost || player.skills[skill]) return;

  player.skillPoints -= s.cost;
  player.skills[skill] = true;
  s.effect();
  log(`🧠 Learned ${s.name}`);
}

/*************************************************
 * MORALITY & FACTIONS
 *************************************************/
function moralChoice() {
  const shift = Math.random() > 0.5 ? 1 : -1;
  player.morality += shift;
  log("⚖️ A choice is made.");
  updateFaction();
  render();
}

function updateFaction() {
  if (player.morality >= 8) player.faction = "Order";
  else if (player.morality <= -8) player.faction = "Ashborn";
  else if (player.reputation.Wildfolk >= 5) player.faction = "Wildfolk";
  else player.faction = "Neutral";
}

/*************************************************
 * COMBAT
 *************************************************/
function fightBoss(id) {
  const boss = bosses[id];
  log(`🔥 You face ${boss.name}`);

  while (boss.health > 0 && player.health > 0) {
    boss.health -= 10 + (player.flags.powerStrike ? 5 : 0);
    player.health -= boss.attack;
  }

  if (player.health > 0) {
    log(`🏆 ${boss.name} defeated.`);
    player.skillLevel++;
    checkEnding();
  } else {
    log("☠️ You have fallen.");
  }

  render();
}

/*************************************************
 * EXPLORATION
 *************************************************/
function explore() {
  log("You search the area...");
  if (player.flags.scavenger && Math.random() > 0.5) {
    player.inventory.push("Relic");
    log("You found a relic.");
  }
}

/*************************************************
 * ENDINGS
 *************************************************/
function checkEnding() {
  if (player.skillLevel < 5) return;

  let ending = "";

  if (player.faction === "Order" && player.morality > 10)
    ending = "The Beacon Ending — Order rises, freedom fades.";
  else if (player.faction === "Ashborn" && player.morality < -10)
    ending = "The Ashen King Ending — You rule through fear.";
  else if (player.faction === "Wildfolk")
    ending = "The Verdant Ending — Nature consumes the ruins.";
  else
    ending = "The Drifter Ending — You leave the world unchanged.";

  document.getElementById("choices").innerHTML = "";
  log("🏁 ENDING REACHED");
  log(ending);
}

/*************************************************
 * SAVE SLOTS
 *************************************************/
function saveGame(slot) {
  localStorage.setItem(`ashenSave${slot}`, JSON.stringify(player));
  log(`💾 Saved to slot ${slot}`);
}

function loadGame(slot) {
  const data = localStorage.getItem(`ashenSave${slot}`);
  if (!data) return;
  player = JSON.parse(data);
  log(`📂 Loaded slot ${slot}`);
  render();
}

/*************************************************
 * LOG
 *************************************************/
function log(text) {
  const out = document.getElementById("output");
  out.innerHTML += `<p>${text}</p>`;
  out.scrollTop = out.scrollHeight;
}

/*************************************************
 * START GAME
 *************************************************/
render();
