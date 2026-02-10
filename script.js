/* ======================
   CONFIG
====================== */
const TILE = 16;
const WORLD = 100;
const VIEW = 20;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = VIEW * TILE;
canvas.height = VIEW * TILE;

/* ======================
   GAME STATE
====================== */
let gameOver = false;
let skillMenu = false;
let skillPoints = 3;

const player = {
  x: 50, y: 50,
  hp: 100, maxHp: 100,
  mana: 40,
  skills: {
    melee: 1,
    magic: 1,
    ranged: 1,
    stealth: 0
  }
};

let enemies = [];
let dungeon = [];
let visible = [];
let log = [];

/* ======================
   PIXEL ICONS
====================== */
const icons = {
  player: ["010","111","101"],
  enemy: ["111","101","111"],
  boss: ["1111","1001","1001","1111"]
};

function drawIcon(icon, x, y, color) {
  ctx.fillStyle = color;
  icon.forEach((row, j) => {
    [...row].forEach((p, i) => {
      if (p === "1")
        ctx.fillRect(
          x + i * (TILE / icon.length),
          y + j * (TILE / icon.length),
          TILE / icon.length,
          TILE / icon.length
        );
    });
  });
}

/* ======================
   WORLD GEN
====================== */
function generateWorld() {
  dungeon = Array.from({ length: WORLD }, () =>
    Array(WORLD).fill(0)
  );

  enemies = [];
  for (let i = 0; i < 50; i++) {
    enemies.push({
      x: rand(0, WORLD),
      y: rand(0, WORLD),
      hp: 20
    });
  }
}

/* ======================
   INPUT
====================== */
window.addEventListener("keydown", e => {
  if (gameOver) return;

  if (e.key === "k") toggleSkills();

  if (skillMenu) return;

  const d = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0]
  }[e.key];

  if (d) {
    player.x += d[0];
    player.y += d[1];
    enemyTurn();
  }
});

/* ======================
   AI + COMBAT
====================== */
function enemyTurn() {
  enemies.forEach(e => {
    if (Math.abs(player.x - e.x) <= 1 &&
        Math.abs(player.y - e.y) <= 1) {
      player.hp -= 5;
      addLog("💥 Hit!");
    } else {
      e.x += Math.sign(player.x - e.x);
      e.y += Math.sign(player.y - e.y);
    }
  });

  if (player.hp <= 0) {
    gameOver = true;
    canvas.classList.add("dead");
    addLog("☠ You died");
  }
}

/* ======================
   SKILLS
====================== */
function toggleSkills() {
  skillMenu = !skillMenu;
  document.getElementById("skills").classList.toggle("hidden");
  renderSkills();
}

function upgrade(skill) {
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
    <button onclick="upgrade('melee')">+</button><br>
    Magic (${player.skills.magic})
    <button onclick="upgrade('magic')">+</button><br>
    Ranged (${player.skills.ranged})
    <button onclick="upgrade('ranged')">+</button><br>
    Stealth (${player.skills.stealth})
    <button onclick="upgrade('stealth')">+</button>
  `;
}

/* ======================
   RENDER
====================== */
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const ox = player.x - VIEW / 2;
  const oy = player.y - VIEW / 2;

  for (let y = 0; y < VIEW; y++) {
    for (let x = 0; x < VIEW; x++) {
      ctx.fillStyle = "#222";
      ctx.fillRect(x*TILE, y*TILE, TILE, TILE);
    }
  }

  enemies.forEach(e => {
    drawIcon(
      icons.enemy,
      (e.x - ox) * TILE,
      (e.y - oy) * TILE,
      "#f55"
    );
  });

  drawIcon(
    icons.player,
    (player.x - ox) * TILE,
    (player.y - oy) * TILE,
    "#5f5"
  );

  document.getElementById("stats").innerHTML =
    `❤️ ${player.hp} | 🧠 ${skillPoints}`;
}

/* ======================
   UTIL
====================== */
function rand(min, max) {
  return Math.floor(Math.random() * (max - min));
}
function addLog(t) {
  log.push(t);
  document.getElementById("log").innerHTML =
    log.slice(-3).join("<br>");
}

function restartGame() {
  location.reload();
}

/* ======================
   START
====================== */
generateWorld();
renderSkills();

function loop() {
  draw();
  requestAnimationFrame(loop);
}
loop();
