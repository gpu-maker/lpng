// =====================================
// CONFIG
// =====================================

const size=100;
const tileSize=10;

// =====================================
// PLAYER + LEVEL SYSTEM
// =====================================

let player={
x:50,y:50,
hp:100,maxHp:100,
xp:0,level:1,statPoints:0,
attack:10,armor:0,
reputation:{village:0}
};

function gainXP(v){
player.xp+=v;
if(player.xp>=player.level*50){
player.level++;
player.statPoints+=3;
player.xp=0;
}
}

// =====================================
// WORLD + BIOMES + TOWNS
// =====================================

let world=[];
let discovered=[];

function generateWorld(){
world=[];
discovered=[];

for(let y=0;y<size;y++){
let row=[];
let fog=[];
for(let x=0;x<size;x++){

let r=Math.random();
if(r<.1) row.push("water");
else if(r<.25) row.push("forest");
else if(r<.3) row.push("desert");
else row.push("grass");

fog.push(false);
}
world.push(row);
discovered.push(fog);
}

generateTowns();
spawnEnemies();
spawnBoss();
}

function generateTowns(){
for(let i=0;i<5;i++){
let x=Math.random()*size|0;
let y=Math.random()*size|0;
world[y][x]="town";
}
}

// =====================================
// CANVAS
// =====================================

const canvas=document.getElementById("world");
const ctx=canvas.getContext("2d");

// =====================================
// LIGHTING
// =====================================

function lighting(){
ctx.fillStyle="rgba(0,0,0,.85)";
ctx.fillRect(0,0,canvas.width,canvas.height);

let gx=player.x*tileSize;
let gy=player.y*tileSize;

let g=ctx.createRadialGradient(gx,gy,10,gx,gy,150);
g.addColorStop(0,"rgba(0,0,0,0)");
g.addColorStop(1,"rgba(0,0,0,.85)");

ctx.globalCompositeOperation="destination-out";
ctx.fillStyle=g;
ctx.fillRect(gx-150,gy-150,300,300);
ctx.globalCompositeOperation="source-over";
}

// =====================================
// MINIMAP + FOG
// =====================================

const mini=document.getElementById("minimap");

function drawMinimap(){
let m=mini.getContext?.("2d");
if(!m){
mini.innerHTML="";
let c=document.createElement("canvas");
c.width=150;c.height=150;
mini.appendChild(c);
return drawMinimap();
}

m.clearRect(0,0,150,150);

for(let y=0;y<size;y++)
for(let x=0;x<size;x++){
if(!discovered[y][x]) continue;

m.fillStyle="#666";
m.fillRect(x*1.5,y*1.5,2,2);
}

m.fillStyle="red";
m.fillRect(player.x*1.5,player.y*1.5,3,3);
}

// =====================================
// SKILL TREE (EXPANDED)
// =====================================

let skills={
attack:0,
defense:0,
magic:0,
archery:0,
vitality:0
};

const skillNodes=[
{x:130,y:30,type:"attack"},
{x:50,y:100,type:"defense"},
{x:210,y:100,type:"magic"},
{x:80,y:200,type:"archery"},
{x:180,y:200,type:"vitality"}
];

const sCanvas=document.getElementById("skillTree");
const sctx=sCanvas.getContext("2d");

function drawSkillTree(){
sctx.clearRect(0,0,260,260);

sctx.strokeStyle="white";
skillNodes.forEach((n,i)=>{
if(i>0){
sctx.beginPath();
sctx.moveTo(skillNodes[0].x,skillNodes[0].y);
sctx.lineTo(n.x,n.y);
sctx.stroke();
}
});

skillNodes.forEach(n=>{
sctx.fillStyle=skills[n.type]?"green":"gray";
sctx.beginPath();
sctx.arc(n.x,n.y,15,0,Math.PI*2);
sctx.fill();
});
}

sCanvas.onclick=e=>{
if(player.statPoints<=0)return;

let r=sCanvas.getBoundingClientRect();
let x=e.clientX-r.left,y=e.clientY-r.top;

skillNodes.forEach(n=>{
if(Math.hypot(x-n.x,y-n.y)<15){
skills[n.type]++;
player.statPoints--;
}
});

drawSkillTree();
};

// =====================================
// A* PATHFINDING
// =====================================

function findPath(sx,sy,tx,ty){
let open=[[sx,sy]];
let visited={};

while(open.length){
let [x,y]=open.shift();
if(x===tx&&y===ty) return [x,y];

[[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>{
let nx=x+d[0],ny=y+d[1];
let key=nx+","+ny;
if(!visited[key]&&world[ny]?.[nx]){
visited[key]=true;
open.push([nx,ny]);
}
});
}
}

// =====================================
// ENEMIES + BOSS PHASES
// =====================================

let enemies=[];
let boss=null;

function spawnEnemies(){
enemies=[];
for(let i=0;i<15;i++)
enemies.push({x:Math.random()*size|0,y:Math.random()*size|0,hp:30});
}

function spawnBoss(){
boss={x:20,y:20,hp:200,phase:1};
}

function updateEnemies(){

enemies.forEach(e=>{
let p=findPath(e.x,e.y,player.x,player.y);
if(p){ if(e.x<player.x)e.x++; if(e.y<player.y)e.y++; }

if(e.x===player.x&&e.y===player.y){
player.hp-=.2;
}
});

if(boss){
if(boss.hp<100)boss.phase=2;
if(boss.hp<40)boss.phase=3;
}
}

// =====================================
// SPELL PROJECTILES + PARTICLES
// =====================================

let projectiles=[];
let particles=[];

function castSpell(){
projectiles.push({x:player.x,y:player.y,dx:1,dy:0});
}

function updateProjectiles(){
projectiles.forEach(p=>{
p.x+=p.dx;p.y+=p.dy;

particles.push({x:p.x,y:p.y,life:20});

enemies.forEach(e=>{
if(e.x===p.x&&e.y===p.y){
e.hp-=20;
gainXP(5);
}
});
});

particles.forEach(p=>p.life--);
projectiles=projectiles.filter(p=>p.x<size);
particles=particles.filter(p=>p.life>0);
}

// =====================================
// QUEST + BRANCHING DIALOGUE
// =====================================

let quests=[
{name:"Help village",progress:0,target:1}
];

let dialogue={
start:{
text:"Will you help our village?",
choices:[
{text:"Yes",next:"accept"},
{text:"No",next:"leave"}
]
},
accept:{text:"Thank you!",end:true},
leave:{text:"We remember this...",end:true}
};

function talk(){
let node=dialogue.start;
let choice=prompt(node.text+" (yes/no)");

if(choice==="yes"){
player.reputation.village+=5;
quests[0].progress=1;
}else{
player.reputation.village-=5;
}
}

// =====================================
// DRAW
// =====================================

function drawTile(x,y,t){
let c={
grass:"#1f6b2a",
water:"#1b3faa",
forest:"#0d4f1b",
desert:"#b99a5e",
town:"#c9b27d"
}[t]||"#444";

ctx.fillStyle=c;
ctx.fillRect(x*tileSize,y*tileSize,tileSize,tileSize);
}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

for(let y=0;y<size;y++)
for(let x=0;x<size;x++){
if(Math.hypot(x-player.x,y-player.y)<12){
discovered[y][x]=true;
drawTile(x,y,world[y][x]);
}
}

// particles
ctx.fillStyle="orange";
particles.forEach(p=>
ctx.fillRect(p.x*tileSize,p.y*tileSize,4,4)
);

// enemies
ctx.fillStyle="red";
enemies.forEach(e=>
ctx.fillRect(e.x*tileSize,e.y*tileSize,10,10)
);

// boss
if(boss){
ctx.fillStyle="purple";
ctx.fillRect(boss.x*tileSize,boss.y*tileSize,12,12);
}

// player
ctx.fillStyle="cyan";
ctx.fillRect(player.x*tileSize,player.y*tileSize,10,10);

lighting();
drawMinimap();

stats.innerText=
`HP:${player.hp.toFixed(0)} LV:${player.level} SP:${player.statPoints} REP:${player.reputation.village}`;

updateEnemies();
updateProjectiles();

requestAnimationFrame(draw);
}

// =====================================
// INPUT
// =====================================

document.addEventListener("keydown",e=>{
if(e.key==="w")player.y--;
if(e.key==="s")player.y++;
if(e.key==="a")player.x--;
if(e.key==="d")player.x++;
if(e.key===" ")castSpell();
if(e.key==="e")talk();
});

// =====================================
// SAVE / LOAD
// =====================================

function saveGame(){
localStorage.setItem("save",
JSON.stringify({player,world,skills,quests}));
}

function loadGame(){
let s=JSON.parse(localStorage.getItem("save"));
if(!s)return;
Object.assign(player,s.player);
world=s.world;
skills=s.skills;
quests=s.quests;
}

// =====================================
// SOUND
// =====================================

let music=new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_9a2c4b.mp3");
music.loop=true;
function toggleMusic(){music.paused?music.play():music.pause();}

// =====================================
// START
// =====================================

generateWorld();
drawSkillTree();
draw();
