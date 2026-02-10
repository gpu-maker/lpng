/* =====================================================
   CORE CONFIG
===================================================== */
const TILE = 32;
const GRID = 12;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* =====================================================
   AUDIO (PROCEDURAL)
===================================================== */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq = 300, dur = 0.12) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = freq;
  gain.gain.value = 0.08;
  osc.start();
  osc.stop(audioCtx.currentTime + dur);
}

/* =====================================================
   PLAYER
===================================================== */
const player = {
  x: 0,
  y: 0,
  hp: 100,
  maxHp: 100,
  mana: 50,
  maxMana: 50,
  attack: 10,
  skillPoints: 0
};

/* =====================================================
   SKILL TREES
===================================================== */
const skillTrees = {
  melee: {
    power: {
      lvl: 0, max: 5,
      apply: () => player.attack += 2
    },
    vitality: {
      lvl: 0, max: 5,
      apply: () => player.maxHp += 10
    }
  },
  magic: {
    mana: {
      lvl: 0, max: 5,
      apply: () => player.maxMana += 10
    },
    fire: {
      lvl: 0, max: 5
    }
  }
};

function renderSkills() {
  const div = document.getElementById("skills");
  div.innerHTML = "<b>Skills</b><br>";
  for (const tree in skillTrees) {
    for (const key in skillTrees[tree]) {
      const s = skillTrees[tree][key];
      const btn = document.createElement("button");
      btn.textContent = `${tree}:${key} (${s.lvl})`;
      btn.onclick = () => {
        if (player.skillPoints > 0 && s.lvl < s.max) {
          s.lvl++;
          if (s.apply) s.apply();
          player.skillPoints--;
        }
      };
      div.appendChild(btn);
    }
  }
}

/* =====================================================
   MAP + FLOORS + FOG OF WAR
===================================================== */
const WALL = 1;
const FLOOR = 0;

let map = [];
let seen = [];
let floorLevel = 1;

function emptyMap() {
  map = Array.from({ length: GRID }, () => Array(GRID).fill(WALL));
  seen = Array.from({ length: GRID }, () => Array(GRID).fill(false));
}

function carveRoom(x, y, w, h) {
  for (let iy = y; iy < y + h; iy++)
    for (let ix = x; ix < x + w; ix++)
      map[iy][ix] = FLOOR;
}

function carveCorridor(x1, y1, x2, y2) {
  while (x1 !== x2) {
    map[y1][x1] = FLOOR;
    x1 += Math.sign(x2 - x1);
  }
  while (y1 !== y2) {
    map[y1][x1] = FLOOR;
    y1 += Math.sign(y2 - y1);
  }
}

function revealFog() {
  for (let y = -2; y <= 2; y++)
    for (let x = -2; x <= 2; x++) {
      const nx = player.x + x;
      const ny = player.y + y;
      if (seen[ny]?.[nx] !== undefined) {
        seen[ny][nx] = true;
      }
    }
}

/* =====================================================
   ENEMIES + BOSS
===================================================== */
let enemies = [];
let boss = null;

function spawnEnemies(rooms) {
  enemies = [];
  for (let i = 1; i < rooms.length; i++) {
    enemies.push({
      x: rooms[i].cx,
      y: rooms[i].cy,
      hp: 30 + floorLevel * 5,
      atk: 6 + floorLevel,
    });
  }
}

function spawnBoss(room) {
  boss = {
    x: room.cx,
    y: room.cy,
    hp: 150 + floorLevel * 20,
    atk: 15 + floorLevel * 2,
    cooldown: 0
  };
}

function enemyAI(e) {
  const dx = player.x - e.x;
  const dy = player.y - e.y;
  const dist = Math.abs(dx) + Math.abs(dy);

  if (dist < 6) {
    const nx = e.x + Math.sign(dx);
    const ny = e.y + Math.sign(dy);
    if (map[ny]?.[nx] === FLOOR) {
      e.x = nx;
      e.y = ny;
    }
  }

  if (dist === 1) {
    player.hp -= e.atk;
    playSound(180);
    if (player.hp <= 0) {
      alert("You died!");
      floorLevel = 1;
      player.hp = player.maxHp;
      generateFloor();
    }
  }
}

function bossAI() {
  if (!boss) return;
  boss.cooldown--;
  if (boss.cooldown <= 0) {
    fireProjectile(
      Math.sign(player.x - boss.x),
      Math.sign(player.y - boss.y),
      boss.atk,
      boss.x,
      boss.y
    );
    boss.cooldown = 20;
  }
}

/* =====================================================
   SPELLS + PROJECTILES
===================================================== */
let projectiles = [];

function fireProjectile(dx, dy, dmg, x = player.x, y = player.y) {
  projectiles.push({ x, y, dx, dy, dmg });
  playSound(500);
}

function updateProjectiles() {
  projectiles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;

    enemies.forEach(e => {
      if (e.x === p.x && e.y === p.y) {
        e.hp -= p.dmg;
        p.dead = true;
      }
    });

    if (boss && boss.x === p.x && boss.y === p.y) {
      boss.hp -= p.dmg;
      p.dead = true;
    }

    if (map[p.y]?.[p.x] !== FLOOR) p.dead = true;
  });

  projectiles = projectiles.filter(p => !p.dead);
}

/* =====================================================
   FLOOR GENERATION
===================================================== */
function generateFloor() {
  emptyMap();
  projectiles = [];
  boss = null;

  const rooms = [];
  for (let i = 0; i < 5; i++) {
    const w = 3 + Math.floor(Math.random() * 3);
    const h = 3 + Math.floor(Math.random() * 3);
    const x = Math.floor(Math.random() * (GRID - w - 1)) + 1;
    const y = Math.floor(Math.random() * (GRID - h - 1)) + 1;
    carveRoom(x, y, w, h);
    rooms.push({ cx: x + 1, cy: y + 1 });
  }

  for (let i = 1; i < rooms.length; i++)
    carveCorridor(
      rooms[i - 1].cx, rooms[i - 1].cy,
      rooms[i].cx, rooms[i].cy
    );

  player.x = rooms[0].cx;
  player.y = rooms[0].cy;

  spawnEnemies(rooms);

  if (floorLevel % 3 === 0)
    spawnBoss(rooms[rooms.length - 1]);
}

/* =====================================================
   INPUT
===================================================== */
document.addEventListener("keydown", e => {
  let nx = player.x;
  let ny = player.y;

  if (e.key === "ArrowUp") ny--;
  if (e.key === "ArrowDown") ny++;
  if (e.key === "ArrowLeft") nx--;
  if (e.key === "ArrowRight") nx++;

  if (map[ny]?.[nx] === FLOOR) {
    player.x = nx;
    player.y = ny;
  }

  if (e.key === "f" && player.mana >= 10) {
    fireProjectile(1, 0, 15);
    player.mana -= 10;
  }

  if (e.key === "h" && player.mana >= 15) {
    player.hp = Math.min(player.maxHp, player.hp + 25);
    player.mana -= 15;
    playSound(300);
  }

  if (e.key === "r") {
    floorLevel++;
    generateFloor();
  }
});

/* =====================================================
   DRAWING
===================================================== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  revealFog();

  for (let y = 0; y < GRID; y++)
    for (let x = 0; x < GRID; x++) {
      ctx.fillStyle = !seen[y][x]
        ? "#000"
        : map[y][x] === WALL ? "#222" : "#111";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }

  ctx.fillStyle = "#4af";
  ctx.fillRect(player.x * TILE + 8, player.y * TILE + 8, 16, 16);

  ctx.fillStyle = "#f44";
  enemies.forEach(e =>
    ctx.fillRect(e.x * TILE + 8, e.y * TILE + 8, 16, 16)
  );

  if (boss) {
    ctx.fillStyle = "#a0f";
    ctx.fillRect(boss.x * TILE + 4, boss.y * TILE + 4, 24, 24);
  }

  ctx.fillStyle = "#ff0";
  projectiles.forEach(p =>
    ctx.fillRect(p.x * TILE + 12, p.y * TILE + 12, 8, 8)
  );

  document.getElementById("stats").innerText =
    `HP ${player.hp}/${player.maxHp} | MP ${player.mana}/${player.maxMana} | Floor ${floorLevel}`;
}

/* =====================================================
   GAME LOOP
===================================================== */
function update() {
  enemies.forEach(enemyAI);
  bossAI();
  updateProjectiles();
  enemies = enemies.filter(e => e.hp > 0);

  if (boss && boss.hp <= 0) {
    boss = null;
    player.skillPoints += 2;
  }
}

function loop() {
  update();
  draw();
  renderSkills();
  requestAnimationFrame(loop);
}

/* =====================================================
   INIT
===================================================== */
generateFloor();
loop();
