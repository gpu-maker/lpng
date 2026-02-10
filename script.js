/* =====================================================
   CONFIG
===================================================== */
const TILE = 32;
const GRID = 20;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = GRID * TILE;
canvas.height = GRID * TILE;

/* =====================================================
   ASSETS
===================================================== */
const sprites = {
  player: new Image(),
  enemy: new Image(),
  boss: new Image()
};
sprites.player.src = "assets/player.png";
sprites.enemy.src = "assets/enemy.png";
sprites.boss.src = "assets/boss.png";

/* =====================================================
   AUDIO
===================================================== */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(freq = 300, dur = 0.12) {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.connect(g);
  g.connect(audioCtx.destination);
  o.frequency.value = freq;
  g.gain.value = 0.08;
  o.start();
  o.stop(audioCtx.currentTime + dur);
}

/* =====================================================
   PLAYER
===================================================== */
const player = {
  x: 0, y: 0,
  hp: 100, maxHp: 100,
  mana: 50, maxMana: 50,
  dir: 1,
  frame: 0,
  tick: 0,
  skillPoints: 0
};

/* =====================================================
   MAP + FOG
===================================================== */
const WALL = 1, FLOOR = 0;
let map = [];
let seen = [];
let floorLevel = 1;

function emptyMap() {
  map = Array.from({ length: GRID }, () => Array(GRID).fill(WALL));
  seen = Array.from({ length: GRID }, () => Array(GRID).fill(false));
}

function revealFog() {
  for (let y = -4; y <= 4; y++)
    for (let x = -4; x <= 4; x++) {
      const nx = player.x + x;
      const ny = player.y + y;
      if (seen[ny]?.[nx] !== undefined) seen[ny][nx] = true;
    }
}

/* =====================================================
   LIGHTING
===================================================== */
function drawLighting() {
  const g = ctx.createRadialGradient(
    player.x * TILE + 16,
    player.y * TILE + 16,
    32,
    player.x * TILE + 16,
    player.y * TILE + 16,
    260
  );
  g.addColorStop(0, "rgba(255,255,255,0.85)");
  g.addColorStop(1, "rgba(0,0,0,0.95)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/* =====================================================
   ENEMIES
===================================================== */
let enemies = [];

function spawnEnemies(rooms) {
  enemies = rooms.slice(1).map(r => ({
    x: r.cx,
    y: r.cy,
    hp: 30,
    frame: 0,
    tick: 0
  }));
}

/* =====================================================
   PROJECTILES
===================================================== */
let projectiles = [];

function fireProjectile(dx, dy) {
  projectiles.push({ x: player.x, y: player.y, dx, dy });
  playSound(520);
}

/* =====================================================
   SAVE / LOAD
===================================================== */
function saveGame() {
  localStorage.setItem("roguelikeSave", JSON.stringify({
    player,
    map,
    seen,
    floorLevel
  }));
}

function loadGame() {
  const s = JSON.parse(localStorage.getItem("roguelikeSave"));
  if (!s) return;
  Object.assign(player, s.player);
  map = s.map;
  seen = s.seen;
  floorLevel = s.floorLevel;
}

/* =====================================================
   FLOOR GENERATION
===================================================== */
function generateFloor() {
  emptyMap();
  const rooms = [];

  for (let i = 0; i < 9; i++) {
    const w = 4 + Math.random() * 4 | 0;
    const h = 4 + Math.random() * 4 | 0;
    const x = 1 + Math.random() * (GRID - w - 2) | 0;
    const y = 1 + Math.random() * (GRID - h - 2) | 0;

    for (let iy = y; iy < y + h; iy++)
      for (let ix = x; ix < x + w; ix++)
        map[iy][ix] = FLOOR;

    rooms.push({ cx: x + 2, cy: y + 2 });
  }

  player.x = rooms[0].cx;
  player.y = rooms[0].cy;
  spawnEnemies(rooms);
}

/* =====================================================
   INPUT
===================================================== */
document.addEventListener("keydown", e => {
  let nx = player.x, ny = player.y;

  if (e.key === "ArrowUp") ny--;
  if (e.key === "ArrowDown") ny++;
  if (e.key === "ArrowLeft") nx--, player.dir = -1;
  if (e.key === "ArrowRight") nx++, player.dir = 1;

  if (map[ny]?.[nx] === FLOOR) {
    player.x = nx;
    player.y = ny;
  }

  if (e.key === "f") fireProjectile(player.dir, 0);
  if (e.key === "s") saveGame();
  if (e.key === "l") loadGame();
});

/* =====================================================
   DRAW
===================================================== */
function drawSprite(img, frame, x, y, flip = false) {
  ctx.save();
  ctx.translate(x + 16, y + 16);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, frame * 32, 0, 32, 32, -16, -16, 32, 32);
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  revealFog();

  for (let y = 0; y < GRID; y++)
    for (let x = 0; x < GRID; x++) {
      if (!seen[y][x]) ctx.fillStyle = "#000";
      else ctx.fillStyle = map[y][x] === WALL ? "#2b1b3d" : "#140b1f";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }

  player.tick++;
  if (player.tick % 8 === 0) player.frame = (player.frame + 1) % 4;

  drawSprite(
    sprites.player,
    player.frame,
    player.x * TILE,
    player.y * TILE,
    player.dir === -1
  );

  enemies.forEach(e => {
    e.tick++;
    if (e.tick % 10 === 0) e.frame = (e.frame + 1) % 4;
    drawSprite(sprites.enemy, e.frame, e.x * TILE, e.y * TILE);
  });

  ctx.fillStyle = "#ff66ff";
  projectiles.forEach(p => {
    p.x += p.dx * 0.25;
    p.y += p.dy * 0.25;
    ctx.fillRect(p.x * TILE + 14, p.y * TILE + 14, 4, 4);
  });

  drawLighting();

  document.getElementById("stats").innerText =
    `HP ${player.hp}/${player.maxHp}\nFloor ${floorLevel}`;
}

/* =====================================================
   LOOP
===================================================== */
function loop() {
  draw();
  requestAnimationFrame(loop);
}

/* =====================================================
   INIT
===================================================== */
generateFloor();
loop();
