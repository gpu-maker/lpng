// ================================
// PLAYER
// ================================

let player={
x:5,y:5,
hp:100,
attack:10,
armor:0,
xp:0,
level:1
};

// ================================
// WORLD + GENERATION
// ================================

const size=50;
const tileSize=16;
let world=[];

function generateWorld(){
world=[];

for(let y=0;y<size;y++){
let row=[];
for(let x=0;x<size;x++){

let r=Math.random();
if(r<0.1) row.push("water");
else if(r<0.2) row.push("forest");
else row.push("grass");

}
world.push(row);
}

generateDungeon();
spawnNPCs();
spawnEnemies();
}

function generateDungeon(){
for(let i=0;i<5;i++){
let rx=Math.floor(Math.random()*size);
let ry=Math.floor(Math.random()*size);
for(let y=0;y<5;y++)
for(let x=0;x<5;x++)
world[ry+y]?.splice(rx+x,1,"stone");
}
}

// ================================
// CANVAS
// ================================

const canvas=document.getElementById("world");
const ctx=canvas.getContext("2d");

// ================================
// LIGHTING ENGINE
// ================================

function drawLighting(){
ctx.fillStyle="rgba(0,0,0,0.8)";
ctx.fillRect(0,0,canvas.width,canvas.height);

let gx=player.x*tileSize;
let gy=player.y*tileSize;

let g=ctx.createRadialGradient(gx,gy,10,gx,gy,120);
g.addColorStop(0,"rgba(0,0,0,0)");
g.addColorStop(1,"rgba(0,0,0,0.8)");

ctx.globalCompositeOperation="destination-out";
ctx.fillStyle=g;
ctx.fillRect(gx-120,gy-120,240,240);
ctx.globalCompositeOperation="source-over";
}

// ================================
// INVENTORY + DRAG
// ================================

let inventory=new Array(16).fill(null);
inventory[0]="Sword";
inventory[1]="Armor";
inventory[2]="Herb";

let dragItem=null;

function renderInventory(){
inventoryGrid.innerHTML="";
inventory.forEach((item,i)=>{
let d=document.createElement("div");
d.className="slot";
d.draggable=true;
d.innerText=item||"";

d.ondragstart=()=>dragItem=i;
d.ondrop=()=>{
[inventory[i],inventory[dragItem]]=[inventory[dragItem],inventory[i]];
renderInventory();
};
d.ondragover=e=>e.preventDefault();

d.onclick=()=>equipItem(i);

inventoryGrid.appendChild(d);
});
}

// ================================
// EQUIPMENT
// ================================

let equipment={weapon:null,armor:null};

function renderEquipment(){
equipmentDiv.innerHTML="";
for(let k in equipment){
let d=document.createElement("div");
d.className="slot equipSlot";
d.innerText=equipment[k]||k;
equipmentDiv.appendChild(d);
}
}

function equipItem(i){
let item=inventory[i];
if(!item)return;

if(item==="Sword"){equipment.weapon=item;player.attack=20;}
if(item==="Armor"){equipment.armor=item;player.armor=10;}

inventory[i]=null;
renderInventory();
renderEquipment();
}

// ================================
// SKILL TREE
// ================================

let skills={
attack:0,
defense:0,
magic:0
};

const skillCanvas=document.getElementById("skillTree");
const sctx=skillCanvas.getContext("2d");

function drawSkillTree(){

sctx.clearRect(0,0,200,200);

// lines
sctx.strokeStyle="white";
sctx.beginPath();
sctx.moveTo(100,30);
sctx.lineTo(40,120);
sctx.lineTo(160,120);
sctx.stroke();

drawSkillNode(100,30,"attack");
drawSkillNode(40,120,"defense");
drawSkillNode(160,120,"magic");
}

function drawSkillNode(x,y,type){
sctx.fillStyle=skills[type]?"green":"gray";
sctx.beginPath();
sctx.arc(x,y,15,0,Math.PI*2);
sctx.fill();
}

skillCanvas.onclick=e=>{
let rect=skillCanvas.getBoundingClientRect();
let x=e.clientX-rect.left;
let y=e.clientY-rect.top;

if(dist(x,y,100,30)<15)skills.attack++;
if(dist(x,y,40,120)<15)skills.defense++;
if(dist(x,y,160,120)<15)skills.magic++;

drawSkillTree();
};

function dist(x1,y1,x2,y2){
return Math.hypot(x1-x2,y1-y2);
}

// ================================
// QUEST + NPC SYSTEM
// ================================

let quests=[
{name:"Kill 3 enemies",progress:0,target:3,complete:false}
];

let npcs=[];

function spawnNPCs(){
npcs=[
{x:10,y:10,text:"Please defeat monsters!"}
];
}

function renderQuests(){
questsDiv.innerHTML="";
quests.forEach(q=>{
questsDiv.innerHTML+=
`${q.name} ${q.progress}/${q.target}<br>`;
});
}

// ================================
// ENEMY AI + PATHFINDING
// ================================

let enemies=[];

function spawnEnemies(){
enemies=[];
for(let i=0;i<5;i++)
enemies.push({
x:Math.random()*size|0,
y:Math.random()*size|0,
hp:30
});
}

function updateEnemies(){

enemies.forEach(e=>{

if(Math.abs(e.x-player.x)<6){
if(e.x<player.x)e.x++;
if(e.x>player.x)e.x--;
if(e.y<player.y)e.y++;
if(e.y>player.y)e.y--;
}

if(e.x===player.x&&e.y===player.y){
player.hp-=1;
}
});
}

// ================================
// COMBAT
// ================================

function attack(){
enemies.forEach(e=>{
if(Math.abs(e.x-player.x)<=1&&Math.abs(e.y-player.y)<=1){
e.hp-=player.attack;
if(e.hp<=0){
player.xp+=10;
quests[0].progress++;
}
}
});
}

// ================================
// NPC INTERACTION
// ================================

function checkNPC(){
npcs.forEach(n=>{
if(n.x===player.x&&n.y===player.y){
alert(n.text);
}
});
}

// ================================
// SAVE / LOAD
// ================================

function saveGame(){
localStorage.setItem("rpgSave",
JSON.stringify({player,inventory,skills,quests}));
}

function loadGame(){
let d=JSON.parse(localStorage.getItem("rpgSave"));
if(!d)return;

player=d.player;
inventory=d.inventory;
skills=d.skills;
quests=d.quests;

renderInventory();
renderEquipment();
drawSkillTree();
renderQuests();
}

// ================================
// SOUND
// ================================

let music=new Audio(
"https://cdn.pixabay.com/download/audio/2022/03/15/audio_9a2c4b.mp3"
);
music.loop=true;

function toggleMusic(){
music.paused?music.play():music.pause();
}

// ================================
// INPUT
// ================================

document.addEventListener("keydown",e=>{
if(e.key==="w")player.y--;
if(e.key==="s")player.y++;
if(e.key==="a")player.x--;
if(e.key==="d")player.x++;
if(e.key===" ")attack();

checkNPC();
});

// ================================
// DRAW WORLD
// ================================

function drawTile(x,y,t){
if(t==="grass")ctx.fillStyle="#1f6b2a";
if(t==="water")ctx.fillStyle="#1b3faa";
if(t==="forest")ctx.fillStyle="#0d4f1b";
if(t==="stone")ctx.fillStyle="#555";

ctx.fillRect(x*tileSize,y*tileSize,tileSize,tileSize);
}

// ================================
// GAME LOOP
// ================================

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

// world
for(let y=0;y<size;y++)
for(let x=0;x<size;x++)
drawTile(x,y,world[y][x]);

// npcs
ctx.fillStyle="yellow";
npcs.forEach(n=>ctx.fillRect(n.x*tileSize,n.y*tileSize,16,16));

// enemies
ctx.fillStyle="red";
enemies.forEach(e=>ctx.fillRect(e.x*tileSize,e.y*tileSize,16,16));

// player
ctx.fillStyle="cyan";
ctx.fillRect(player.x*tileSize,player.y*tileSize,16,16);

drawLighting();

stats.innerText=
`HP:${player.hp} LV:${player.level} XP:${player.xp}`;

updateEnemies();
renderQuests();

requestAnimationFrame(draw);
}

// ================================
// START
// ================================

generateWorld();
renderInventory();
renderEquipment();
drawSkillTree();
draw();
