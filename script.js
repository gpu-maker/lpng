// =====================================
// PIXEL RPG ENGINE (FULL COMBINED)
// =====================================

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

// =====================================
// WORLD MAP
// =====================================

const tileSize=20;
const mapSize=50;

const WorldMap=[];

for(let y=0;y<mapSize;y++){
WorldMap[y]=[];
for(let x=0;x<mapSize;x++){
WorldMap[y][x]=Math.random()<0.1?"water":"grass";
}
}

// =====================================
// PLAYER
// =====================================

const player={
x:500,
y:500,
hp:100,
str:5,
dex:5,
int:5,
level:1,
equipment:{armor:false,helmet:false},
inventory:[]
};

// =====================================
// INPUT
// =====================================

const keys={};
window.onkeydown=e=>keys[e.key.toLowerCase()]=true;
window.onkeyup=e=>keys[e.key.toLowerCase()]=false;

// =====================================
// MAP EDITOR
// =====================================

const MapEditor={
enabled:false
};

document.getElementById("toggleEditor").onclick=()=>{
MapEditor.enabled=!MapEditor.enabled;
};

canvas.addEventListener("click",e=>{

if(!MapEditor.enabled) return;

const rect=canvas.getBoundingClientRect();
const x=Math.floor((e.clientX-rect.left)/tileSize);
const y=Math.floor((e.clientY-rect.top)/tileSize);

const type=document.getElementById("tileType").value;
if(WorldMap[y])WorldMap[y][x]=type;

});

// save map
document.getElementById("saveMap").onclick=()=>{
const data=JSON.stringify(WorldMap);
const blob=new Blob([data],{type:"application/json"});
const a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="map.json";
a.click();
};

// load map
document.getElementById("loadMapBtn").onclick=()=>{
document.getElementById("loadMap").click();
};

document.getElementById("loadMap").onchange=e=>{
const file=e.target.files[0];
const reader=new FileReader();
reader.onload=()=>{
const data=JSON.parse(reader.result);
for(let y=0;y<data.length;y++)WorldMap[y]=data[y];
};
reader.readAsText(file);
};

// =====================================
// INVENTORY UI
// =====================================

const grid=document.getElementById("inventoryGrid");

for(let i=0;i<20;i++){
const s=document.createElement("div");
s.className="slot";
grid.appendChild(s);
}

// =====================================
// SKILL TREE
// =====================================

const sk=document.getElementById("skillTree").getContext("2d");

function drawSkills(){
sk.clearRect(0,0,300,300);

const nodes=[
{x:50,y:50},{x:150,y:50},{x:100,y:120},{x:50,y:200},{x:150,y:200}
];

sk.strokeStyle="white";
sk.beginPath();
sk.moveTo(50,50);
sk.lineTo(100,120);
sk.lineTo(150,50);
sk.stroke();

nodes.forEach(n=>{
sk.fillStyle="gold";
sk.beginPath();
sk.arc(n.x,n.y,8,0,Math.PI*2);
sk.fill();
});
}

// =====================================
// QUEST SYSTEM
// =====================================

const quests=[
{title:"Defeat Boss",done:false},
{title:"Help Village",done:false}
];

function updateQuestUI(){
document.getElementById("questLog").innerHTML=
quests.map(q=>`${q.done?"✔":"◻"} ${q.title}`).join("<br>");
}

// =====================================
// REPUTATION
// =====================================

const factions={
village:0,
guild:0,
bandits:-20
};

function updateReputationUI(){
document.getElementById("reputationUI").innerHTML=
Object.entries(factions)
.map(([k,v])=>`${k}: ${v}`)
.join("<br>");
}

// =====================================
// RENDER WORLD
// =====================================

function renderWorld(){

for(let y=0;y<mapSize;y++){
for(let x=0;x<mapSize;x++){

const tile=WorldMap[y][x];

if(tile==="grass") ctx.fillStyle="#0f0";
if(tile==="water") ctx.fillStyle="#00f";
if(tile==="wall") ctx.fillStyle="#777";
if(tile==="village") ctx.fillStyle="#ff0";

ctx.fillRect(x*tileSize,y*tileSize,tileSize,tileSize);
}
}
}

// =====================================
// DRAW PLAYER (PIXEL)
// =====================================

function drawPlayer(){

ctx.fillStyle="#fff";
ctx.fillRect(player.x,player.y,8,8);

if(player.equipment.armor){
ctx.fillStyle="#44f";
ctx.fillRect(player.x,player.y,8,8);
}

if(player.equipment.helmet){
ctx.fillStyle="#aaa";
ctx.fillRect(player.x,player.y-3,8,3);
}
}

// =====================================
// MOVEMENT
// =====================================

function playerControl(){
if(keys.w)player.y-=2;
if(keys.s)player.y+=2;
if(keys.a)player.x-=2;
if(keys.d)player.x+=2;
}

// =====================================
// STATS UI
// =====================================

function updateStats(){
document.getElementById("stats").innerHTML=
`HP:${player.hp}<br>STR:${player.str}<br>DEX:${player.dex}<br>INT:${player.int}`;
}

// =====================================
// GAME LOOP
// =====================================

function loop(){

ctx.clearRect(0,0,canvas.width,canvas.height);

playerControl();
renderWorld();
drawPlayer();
drawSkills();
updateStats();
updateQuestUI();
updateReputationUI();

requestAnimationFrame(loop);
}

loop();
