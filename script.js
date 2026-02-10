/* ======================
   CORE CONFIG
====================== */
const TILE = 32;
const GRID = 20;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = GRID * TILE;
canvas.height = GRID * TILE;

/* ======================
   GAME STATE
====================== */
let floor = 1;
let dungeon = [];
let visible = [];
let entities = [];
let projectiles = [];
let log = [];

const player = {
  x: 10, y: 10,
  hp: 100, maxHp: 100,
  mana: 40, maxMana: 40,
  atk: 5,
  ranged: 3,
  magic: 4,
  light: 6,
  skills: {
    melee: 1,
    ranged: 1,
    magic: 1
  }
};

/* ======================
   MAP GENERATION
====================== */
function generateFloor() {
  dungeon = Array.from({ length: GRID }, () =>
    Array(GRID).fill(1)
  );

  for (let r = 0; r < 9; r++) {
    let w = rand(4, 7);
    let h = rand(4, 7);
    let x = rand(1, GRID - w - 1);
    let y = rand(1, GRID - h - 1);

    for (let i = x; i < x + w; i++)
      for (let j = y; j < y + h; j++)
        dungeon[j][i] = 0;
  }

  visible = Array.from({ length: GRID }, () =>
    Array(GRID).fill(false)
  );

  spawnEnemies();
}

/* ======================
   ENEMIES
====================== */
function spawnEnemies() {
  entities = [];

  for (let i = 0; i < 10 + floor; i++) {
    entities.push({
      x: rand(1, GRID - 2),
      y: rand(1, GRID - 2),
      hp: 20 + floor * 4,
      type: "enemy"
    });
  }

  if (floor % 3 === 0) {
    entities.push({
      x: GRID / 2,
      y: GRID / 2,
      hp: 150,
      type: "boss"
    });
  }
}

/* ======================
   INPUT
====================== */
window.addEventListener("keydown", e => {
  const dir = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0]
  }[e.key];

  if (dir) movePlayer(dir[0], dir[1]);
  if (e.key === " ") castSpell();
});

/* ======================
   PLAYER ACTIONS
====================== */
function movePlayer(dx, dy) {
  let nx = player.x + dx;
  let ny = player.y + dy;

  if (dungeon[ny]?.[nx] === 0) {
    player.x = nx;
    player.y = ny;
    updateVisibility();
    enemyTurn();
  }
}

function castSpell() {
  if (player.mana < 5) return;
  player.mana -= 5;

  projectiles.push({
    x: player.x,
    y: player.y,
    dx: 1,
    dy: 0,
    dmg: player.magic * 3
  });

  addLog("✨ Spell cast!");
}

/* ======================
   AI
====================== */
function enemyTurn() {
  for (let e of entities) {
    let dx = Math.sign(player.x - e.x);
    let dy = Math.sign(player.y - e.y);

    if (Math.abs(dx) + Math.abs(dy) <= 1) {
      player.hp -= 5;
      addLog("💥 You are hit!");
    } else {
      e.x += dx;
      e.y += dy;
    }
  }
}

/* ======================
   VISIBILITY & LIGHT
====================== */
function updateVisibility() {
  for (let y = 0; y < GRID; y++)
    for (let x = 0; x < GRID; x++)
      visible[y][x] =
        Math.hypot(player.x - x, player.y - y) <= player.light;
}

/* ======================
   RENDERING
====================== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (!visible[y][x]) {
        ctx.fillStyle = "#000";
      } else {
        ctx.fillStyle = dungeon[y][x] ? "#222" : "#444";
      }
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
  }

  // Player
  ctx.fillStyle = "#0f0";
  ctx.fillRect(player.x * TILE, player.y * TILE, TILE, TILE);

  // Enemies
  for (let e of entities) {
    if (visible[e.y]?.[e.x]) {
      ctx.fillStyle = e.type === "boss" ? "#f00" : "#f80";
      ctx.fillRect(e.x * TILE, e.y * TILE, TILE, TILE);
    }
  }

  drawUI();
}

/* ======================
   UI
====================== */
function drawUI() {
  document.getElementById("stats").innerHTML =
    `❤️ ${player.hp}/${player.maxHp}
     🔮 ${player.mana}/${player.maxMana}
     🧬 Floor ${floor}`;

  document.getElementById("log").innerHTML =
    log.slice(-3).join("<br>");
}

/* ======================
   SAVE / LOAD
====================== */
function saveGame() {
  localStorage.setItem("roguelike", JSON.stringify({
    player, floor
  }));
  addLog("💾 Game saved");
}

function loadGame() {
  let data = JSON.parse(localStorage.getItem("roguelike"));
  if (!data) return;

  Object.assign(player, data.player);
  floor = data.floor;
  generateFloor();
  addLog("📂 Game loaded");
}

/* ======================
   UTILS
====================== */
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addLog(msg) {
  log.push(msg);
}

/* ======================
   LOOP
====================== */
generateFloor();
updateVisibility();

function loop() {
  draw();
  requestAnimationFrame(loop);
}

loop();
