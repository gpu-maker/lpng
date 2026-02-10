/* ========= CONFIG ========= */
const TILE = 32;
const GRID = 20;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = GRID * TILE;
canvas.height = GRID * TILE;

const mapCanvas = document.getElementById("minimap");
const mapCtx = mapCanvas.getContext("2d");

/* ========= BIOMES ========= */
const BIOMES = [
  { name:"Dungeon", floor:"#444", wall:"#222", fog:"#000" },
  { name:"Cavern", floor:"#355f3b", wall:"#1f3a25", fog:"#020" },
  { name:"Hell", floor:"#6b1f1f", wall:"#2a0000", fog:"#200" },
  { name:"Ice", floor:"#4b6f8a", wall:"#243a4a", fog:"#013" },
  { name:"Arcane", floor:"#5b3b7a", wall:"#2a163f", fog:"#102" }
];

let biome;

/* ========= STATE ========= */
let floor = 1;
let dungeon = [];
let visible = [];
let entities = [];
let projectiles = [];
let effects = [];
let log = [];

const player = {
  x:10, y:10,
  dir:{x:1,y:0},
  hp:100, maxHp:100,
  mana:40, maxMana:40,
  atk:5,
  ranged:4,
  magic:6,
  light:6,
  skillPoints:3
};

/* ========= MAP ========= */
function generateFloor() {
  biome = BIOMES[(floor-1)%BIOMES.length];
  dungeon = Array.from({length:GRID},()=>Array(GRID).fill(1));
  visible = Array.from({length:GRID},()=>Array(GRID).fill(false));

  for(let r=0;r<9;r++){
    let w=rand(4,7), h=rand(4,7);
    let x=rand(1,GRID-w-1), y=rand(1,GRID-h-1);
    for(let i=x;i<x+w;i++)
      for(let j=y;j<y+h;j++)
        dungeon[j][i]=0;
  }
  spawnEnemies();
  updateVisibility();
  addLog(`🌍 ${biome.name}`);
}

function spawnEnemies(){
  entities=[];
  for(let i=0;i<10+floor;i++)
    entities.push({x:rand(1,18),y:rand(1,18),hp:20+floor*4,type:"enemy"});
  if(floor%3===0)
    entities.push({x:10,y:10,hp:150,type:"boss"});
}

/* ========= INPUT ========= */
window.addEventListener("keydown",e=>{
  const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];
  if(m) movePlayer(...m);
  if(e.key==="z") meleeAttack();
  if(e.key==="x") rangedAttack();
  if(e.key==="c") castSpell();
  if(e.key==="k") toggleSkills();
});

/* ========= PLAYER ========= */
function movePlayer(dx,dy){
  player.dir={x:dx,y:dy};
  let nx=player.x+dx, ny=player.y+dy;
  if(dungeon[ny]?.[nx]===0){
    player.x=nx; player.y=ny;
    updateVisibility(); enemyTurn();
  }
}

/* ========= ATTACKS ========= */
function meleeAttack(){
  let tx=player.x+player.dir.x, ty=player.y+player.dir.y;
  hitTile(tx,ty,player.atk*4,"🗡 Slash");
}

function rangedAttack(){
  projectiles.push({x:player.x,y:player.y,dx:player.dir.x,dy:player.dir.y,dmg:player.ranged*5});
  addLog("🏹 Shot"); enemyTurn();
}

function castSpell(){
  if(player.mana<6) return;
  player.mana-=6;
  for(let i=1;i<=3;i++)
    hitTile(player.x+player.dir.x*i,player.y+player.dir.y*i,player.magic*4,"🔮 Arcane");
  enemyTurn();
}

function hitTile(x,y,dmg,msg){
  for(let e of entities){
    if(e.x===x&&e.y===y){
      e.hp-=dmg;
      effects.push({x,y,t:10});
      addLog(msg);
    }
  }
  cleanupEnemies();
}

/* ========= AI ========= */
function enemyTurn(){
  for(let e of entities){
    let dx=Math.sign(player.x-e.x), dy=Math.sign(player.y-e.y);
    if(Math.abs(dx)+Math.abs(dy)<=1){
      player.hp-=5; addLog("💥 Hit");
    } else { e.x+=dx; e.y+=dy; }
  }
}

/* ========= PROJECTILES ========= */
function updateProjectiles(){
  for(let p of projectiles){
    p.x+=p.dx; p.y+=p.dy;
    for(let e of entities)
      if(e.x===p.x&&e.y===p.y){e.hp-=p.dmg;p.hit=true;}
  }
  projectiles=projectiles.filter(p=>!p.hit);
  cleanupEnemies();
}

/* ========= VISIBILITY ========= */
function updateVisibility(){
  for(let y=0;y<GRID;y++)
    for(let x=0;x<GRID;x++)
      visible[y][x]=Math.hypot(player.x-x,player.y-y)<=player.light;
}

/* ========= RENDER ========= */
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++){
    ctx.fillStyle=!visible[y][x]?biome.fog:(dungeon[y][x]?biome.wall:biome.floor);
    ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
  }
  ctx.fillStyle="#0f0";
  ctx.fillRect(player.x*TILE,player.y*TILE,TILE,TILE);

  for(let e of entities){
    ctx.fillStyle=e.type==="boss"?"#f00":"#f80";
    ctx.fillRect(e.x*TILE,e.y*TILE,TILE,TILE);
  }

  for(let fx of effects){ctx.fillStyle="rgba(255,60,60,.6)";
    ctx.fillRect(fx.x*TILE,fx.y*TILE,TILE,TILE);fx.t--;}
  effects=effects.filter(f=>f.t>0);

  drawMinimap();
  drawUI();
}

/* ========= MINIMAP ========= */
function drawMinimap(){
  let s=mapCanvas.width/GRID;
  mapCtx.clearRect(0,0,mapCanvas.width,mapCanvas.height);
  for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++){
    if(!visible[y][x])continue;
    mapCtx.fillStyle=dungeon[y][x]?biome.wall:biome.floor;
    mapCtx.fillRect(x*s,y*s,s,s);
  }
  mapCtx.fillStyle="#0f0";
  mapCtx.fillRect(player.x*s,player.y*s,s,s);
}

/* ========= UI ========= */
function drawUI(){
  document.getElementById("stats").innerHTML=
    `❤️ ${player.hp}/${player.maxHp}<br>
     🔮 ${player.mana}/${player.maxMana}<br>
     🧬 Floor ${floor}<br>
     🌍 ${biome.name}`;
  document.getElementById("skillPoints").innerText=`Skill Points: ${player.skillPoints}`;
}

/* ========= SKILLS ========= */
function toggleSkills(){
  document.getElementById("skills").classList.toggle("hidden");
}
function upgrade(stat){
  if(player.skillPoints<=0)return;
  player[stat]++; player.skillPoints--;
}

/* ========= SAVE ========= */
function saveGame(){
  localStorage.setItem("roguelike",JSON.stringify({player,floor}));
}
function loadGame(){
  let d=JSON.parse(localStorage.getItem("roguelike"));
  if(!d)return;
  Object.assign(player,d.player);
  floor=d.floor;
  generateFloor();
}

/* ========= UTILS ========= */
function cleanupEnemies(){entities=entities.filter(e=>e.hp>0);}
function addLog(m){log.push(m);}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}

/* ========= LOOP ========= */
generateFloor();
function loop(){updateProjectiles();draw();requestAnimationFrame(loop);}
loop();
