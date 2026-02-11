// ================================
// PLAYER
// ================================

let player={
x:5,y:5,
hp:100,
armor:0,
attack:10
};

// ================================
// TILE WORLD + PROCEDURAL GEN
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

generateWorld();

// ================================
// CANVAS
// ================================

const canvas=document.getElementById("world");
const ctx=canvas.getContext("2d");

// ================================
// DRAW WORLD
// ================================

function drawTile(x,y,type){
if(type==="grass") ctx.fillStyle="#1f6b2a";
if(type==="water") ctx.fillStyle="#1b3faa";
if(type==="forest") ctx.fillStyle="#0d4f1b";
if(type==="stone") ctx.fillStyle="#555";

ctx.fillRect(x*tileSize,y*tileSize,tileSize,tileSize);
}

// ================================
// INVENTORY + DRAG SYSTEM
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
d.ondragover=e=>e.preventDefault();

d.ondrop=()=>{
[inventory[i],inventory[dragItem]]=
[inventory[dragItem],inventory[i]];
renderInventory();
};

d.onclick=()=>equipItem(i);

inventoryGrid.appendChild(d);
});
}

// ================================
// EQUIPMENT SYSTEM
// ================================

let equipment={
weapon:null,
armor:null
};

function renderEquipment(){
equipmentDiv.innerHTML="";

for(let k in equipment){
let s=document.createElement("div");
s.className="slot equipSlot";
s.innerText=equipment[k]||k;

s.ondrop=()=>{
if(inventory[dragItem]){
equipItem(dragItem);
}
};

s.ondragover=e=>e.preventDefault();

equipmentDiv.appendChild(s);
}
}

function equipItem(index){
let item=inventory[index];
if(!item)return;

if(item==="Sword"){
equipment.weapon="Sword";
player.attack=20;
}

if(item==="Armor"){
equipment.armor="Armor";
player.armor=10;
}

inventory[index]=null;
renderInventory();
renderEquipment();
}

// ================================
// CRAFTING SYSTEM
// ================================

function craftPotion(){
let herbs=inventory.filter(i=>i==="Herb").length;

if(herbs>=2){
removeItem("Herb");
removeItem("Herb");
addItem("Potion");
alert("Potion crafted");
}
}

function addItem(i){
let slot=inventory.indexOf(null);
if(slot!=-1)inventory[slot]=i;
renderInventory();
}

function removeItem(name){
inventory[inventory.indexOf(name)]=null;
}

// ================================
// TILE EDITOR MODE
// ================================

let editor=false;

function toggleEditor(){
editor=!editor;
}

canvas.addEventListener("click",e=>{
if(!editor)return;

let rect=canvas.getBoundingClientRect();
let x=Math.floor((e.clientX-rect.left)/tileSize);
let y=Math.floor((e.clientY-rect.top)/tileSize);

world[y][x]="stone";
});

// ================================
// SOUND ENGINE
// ================================

let music=new Audio(
"https://cdn.pixabay.com/download/audio/2022/03/15/audio_9a2c4b.mp3"
);
music.loop=true;

function toggleMusic(){
if(music.paused) music.play();
else music.pause();
}

// ================================
// MOVEMENT
// ================================

document.addEventListener("keydown",e=>{
if(e.key==="w")player.y--;
if(e.key==="s")player.y++;
if(e.key==="a")player.x--;
if(e.key==="d")player.x++;
});

// ================================
// GAME LOOP
// ================================

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

// world
for(let y=0;y<size;y++)
for(let x=0;x<size;x++)
drawTile(x,y,world[y][x]);

// player
ctx.fillStyle="cyan";
ctx.fillRect(player.x*tileSize,player.y*tileSize,tileSize,tileSize);

stats.innerText=
`HP ${player.hp} | ATK ${player.attack} | ARMOR ${player.armor}`;

requestAnimationFrame(draw);
}

// ================================
// START
// ================================

renderInventory();
renderEquipment();
draw();
