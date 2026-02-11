// ============================
// RPG ENGINE — SINGLE FILE
// ============================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("webgl") || canvas.getContext("2d");

// fallback 2D
const g = canvas.getContext("2d");


// ============================
// ECS SYSTEM
// ============================

class Entity {
constructor(){
this.id=Math.random();
this.c={};
}
add(name,data){this.c[name]=data;return this;}
get(name){return this.c[name];}
}

const ECS={
entities:[],
systems:[],
add(e){this.entities.push(e);return e;}
};


// ============================
// PLAYER
// ============================

const player=ECS.add(new Entity()
.add("pos",{x:500,y:500})
.add("vel",{x:0,y:0})
.add("stats",{hp:100,str:5,dex:5,int:5,level:1,xp:0})
.add("anim",{state:"idle",frame:0})
.add("inventory",{items:[]})
.add("equipment",{weapon:null,armor:null})
);


// ============================
// INPUT
// ============================

const keys={};
window.onkeydown=e=>keys[e.key.toLowerCase()]=true;
window.onkeyup=e=>keys[e.key.toLowerCase()]=false;


// ============================
// WORLD GENERATION
// ============================

const WORLD_SIZE=100;
let world=[];

function generateWorld(){
for(let y=0;y<WORLD_SIZE;y++){
world[y]=[];
for(let x=0;x<WORLD_SIZE;x++){
world[y][x]=Math.random()<.1?"water":"grass";
}
}
}
generateWorld();


// ============================
// INVENTORY UI
// ============================

const grid=document.getElementById("inventoryGrid");

function createInventory(){
for(let i=0;i<20;i++){
const slot=document.createElement("div");
slot.className="slot";
slot.draggable=true;
grid.appendChild(slot);
}
}
createInventory();


// ============================
// SKILL TREE
// ============================

const skillCanvas=document.getElementById("skillTree");
const sk=skillCanvas.getContext("2d");

const skills=[
{x:50,y:50,name:"STR"},
{x:150,y:50,name:"DEX"},
{x:100,y:120,name:"INT"},
{x:50,y:200,name:"Fire"},
{x:150,y:200,name:"Ice"}
];

function drawSkillTree(){
sk.clearRect(0,0,300,250);

sk.beginPath();
sk.moveTo(50,50);
sk.lineTo(100,120);
sk.lineTo(150,50);
sk.stroke();

skills.forEach(s=>{
sk.fillStyle="gold";
sk.beginPath();
sk.arc(s.x,s.y,10,0,Math.PI*2);
sk.fill();
});
}
drawSkillTree();


// ============================
// QUEST SYSTEM
// ============================

const quests=[
{title:"Defeat the Boss",done:false},
{title:"Visit Village",done:false}
];

function updateQuestUI(){
document.getElementById("questLog").innerHTML=
quests.map(q=>`<div>${q.done?"✔":"◻"} ${q.title}</div>`).join("");
}
updateQuestUI();


// ============================
// LIGHTING ENGINE
// ============================

function drawLighting(){
const grad=g.createRadialGradient(
player.get("pos").x,
player.get("pos").y,
50,
player.get("pos").x,
player.get("pos").y,
300
);

grad.addColorStop(0,"rgba(255,255,255,0)");
grad.addColorStop(1,"rgba(0,0,0,.3)");

g.fillStyle=grad;
g.fillRect(0,0,1000,1000);
}


// ============================
// PARTICLES
// ============================

let particles=[];

function spawnParticle(x,y){
particles.push({x,y,vx:Math.random()-0.5,vy:-1,life:30});
}

function updateParticles(){
particles.forEach(p=>{
p.x+=p.vx;
p.y+=p.vy;
p.life--;
});
particles=particles.filter(p=>p.life>0);
}

function drawParticles(){
g.fillStyle="orange";
particles.forEach(p=>g.fillRect(p.x,p.y,3,3));
}


// ============================
// PATHFINDING A* BASE
// ============================

function heuristic(a,b){
return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
}


// ============================
// ENEMY + BOSS
// ============================

const enemy=ECS.add(new Entity()
.add("pos",{x:200,y:200})
.add("hp",100)
.add("phase",1)
);


// ============================
// COMBAT
// ============================

function attack(){
spawnParticle(player.get("pos").x,player.get("pos").y);

const dx=enemy.get("pos").x-player.get("pos").x;
const dy=enemy.get("pos").y-player.get("pos").y;

if(Math.hypot(dx,dy)<50){
enemy.c.hp-=player.get("stats").str;

if(enemy.c.hp<50) enemy.c.phase=2;
}
}


// ============================
// PLAYER MOVEMENT + ANIMATION
// ============================

function updatePlayer(){
const pos=player.get("pos");

if(keys["w"])pos.y-=3;
if(keys["s"])pos.y+=3;
if(keys["a"])pos.x-=3;
if(keys["d"])pos.x+=3;

if(keys[" "])attack();
}


// ============================
// DRAW WORLD
// ============================

function drawWorld(){
for(let y=0;y<20;y++){
for(let x=0;x<20;x++){
g.fillStyle=world[y][x]=="water"?"#55f":"#5a5";
g.fillRect(x*50,y*50,50,50);
}
}
}


// ============================
// DRAW ENTITIES (PIXEL CHARACTER)
// ============================

function drawPlayer(){
const p=player.get("pos");

g.fillStyle="#000";
g.fillRect(p.x,p.y,10,10);
g.fillStyle="#ccc";
g.fillRect(p.x+2,p.y+2,6,6);
}

function drawEnemy(){
const p=enemy.get("pos");

g.fillStyle=enemy.get("phase")==1?"red":"purple";
g.fillRect(p.x,p.y,20,20);

g.fillStyle="black";
g.fillRect(p.x,p.y-10,enemy.c.hp,5);
}


// ============================
// SAVE / LOAD
// ============================

function saveGame(){
localStorage.setItem("save",JSON.stringify(player));
}

function loadGame(){
const data=localStorage.getItem("save");
if(data) Object.assign(player,JSON.parse(data));
}


// ============================
// STATS UI
// ============================

function updateStats(){
const s=player.get("stats");
document.getElementById("stats").innerHTML=`
HP: ${s.hp}<br>
STR: ${s.str}<br>
DEX: ${s.dex}<br>
INT: ${s.int}<br>
LVL: ${s.level}
`;
}


// ============================
// GAME LOOP
// ============================

function loop(){

g.clearRect(0,0,1000,1000);

updatePlayer();
updateParticles();

drawWorld();
drawEnemy();
drawPlayer();
drawParticles();
drawLighting();
updateStats();

requestAnimationFrame(loop);
}

loop();
