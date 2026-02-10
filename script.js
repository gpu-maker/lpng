/* ==================================================
   CONFIG
================================================== */
const TILE = 16;
const VIEW = 20;
const WORLD = 100;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = VIEW * TILE;
canvas.height = VIEW * TILE;

const mini = document.getElementById("minimap");
const mctx = mini.getContext("2d");
mini.width = WORLD;
mini.height = WORLD;

/* ==================================================
   GAME STATE
================================================== */
let dead = false;
let skillMenu = false;
let skillPoints = 5;

const player = {
  x: 50,
  y: 50,
  hp: 100,
  maxHp: 100,
  dir: 0,
  skills: {
    melee: 1,
    magic: 1,
    ranged: 1,
    stealth: 0
  }
};

let enemies = [];
let explored = Array.from({ length: WORLD }, () =>
  Array(WORLD).fill(false)
);

/* ==================================================
   SPRITES (PIXEL KNIGHT + ENEMIES)
================================================== */
const knightSprites = [
  [
    "00100",
    "01110",
    "10101",
    "01110",
    "01010"
  ],
  [
    "00100",
    "01110",
    "10101",
    "01110",
    "10101"
  ]
];

const enemySprite = [
  "0110",
  "1111",
  "1011",
  "1111"
];

/* ==================================================
   SPRITE DRAWER
================================================== */
function drawSprite(sprite, x, y, color, scale) {
  ctx.fillStyle = color;
  sprite.forEach((row, j) => {
    [...row].forEach((p, i) => {
      if (p === "1") {
        ctx.fillRect(
          x + i * scale,
          y + j * scale,
          scale,
          scale
        );
      }
    });
  });
}

/* ==================================================
   INPUT
================================================== */
window.addEventListener("keydown", e => {
  if (dead) {
    if (e.key.toLowerCase() === "r") restartGame();
    return;
  }

  if (e.key.toLowerCase() === "k") {
    toggleSkills();
    return;
  }

  if (skillMenu) return;

  const d = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0]
  }[e.key];

  if (d) {
    player.x = clamp(player.x + d[0], 0, WORLD - 1);
    player.y = clamp(player.y + d[1], 0, WORLD - 1);
    enemyTurn();
  }
});

/* ==================================================
   ENEMY AI + COMBAT
================================================== */
function enemyTurn() {
  enemies.forEach(e => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;

    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
      player.hp -= 8;
    } else {
      e.x += Math.sign(dx);
      e.y += Math.sign(dy);
    }
  });

  if (player.hp <= 0) {
    dead = true;
    canvas.classList.add("dead");
  }
}

/* ==================================================
   SKILLS
================================================== */
function toggleSkills() {
  skillMenu = !skillMenu;
  document.getElementById("skills").classList.toggle("hidden");
  renderSkills();
}

function upgradeSkill(skill) {
  if (skillPoints <= 0) return;
  player.skills[skill]++;
  skillPoints--;
  renderSkills();
}

function renderSkills() {
  const s = document.getElementById("skills");
  s.innerHTML = `
    <b>Skill Points: ${skillPoints}</b><br><br>
    Melee (${player.skills.melee})
    <button onclick="upgradeSkill('melee')">+</button><br>
    Magic (${player.skills.magic})
    <button onclick="upgradeSkill('magic')">+</button><br>
    Ranged (${player.skills.ranged})
    <button onclick="upgradeSkill('ranged')">+</button><br>
    Stealth (${player.skills.stealth})
    <button onclick="upgradeSkill('stealth')">+</button>
  `;
}

/* ==================================================
   MINIMAP
================================================== */
function drawMinimap() {
  explored[player.y][player.x] = true;

  for (let y = 0; y < WORLD; y++) {
    for (let x = 0; x < WORLD; x++) {
      if (explored[y][x]) {
        mctx.fillStyle = "#333";
        mctx.fillRect(x, y, 1, 1);
      }
    }
  }

  enemies.forEach(e => {
    mctx.fillStyle = "#f44";
    mctx.fillRect(e.x, e.y, 1, 1);
  });

  mctx.fillStyle = "#4f4";
  mctx.fillRect(player.x, player.y, 1, 1);
}

/* ==================================================
   RENDER
================================================== */
let frame = 0;
let tick = 0;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const ox = player.x - VIEW / 2;
  const oy = player.y - VIEW / 2;

  for (let y = 0; y < VIEW; y++) {
    for (let x = 0; x < VIEW; x++) {
      ctx.fillStyle = "#222";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
  }

  enemies.forEach(e => {
    drawSprite(
      enemySprite,
      (e.x - ox) * TILE,
      (e.y - oy) * TILE,
      "#f55",
      4
    );
  });

  drawSprite(
    knightSprites[frame],
    (player.x - ox) * TILE,
    (player.y - oy) * TILE,
    "#6f6",
    3
  );

  drawMinimap();
}

/* ==================================================
   UTILS
================================================== */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function restartGame() {
  location.reload();
}

/* ==================================================
   INIT
================================================== */
for (let i = 0; i < 40; i++) {
  enemies.push({
    x: Math.floor(Math.random() * WORLD),
    y: Math.floor(Math.random() * WORLD)
  });
}

renderSkills();

/* ==================================================
   LOOP
================================================== */
function loop() {
  tick++;
  if (tick % 20 === 0) frame = (frame + 1) % 2;
  draw();
  requestAnimationFrame(loop);
}

loop();
