// ==============================
// GAME STATE
// ==============================

let player={
x:240,
y:180,
health:100,
gold:50
};

let reputation={
village:0
};

let quests={};
let worldNPCs=[];
let activeDialogue=null;

// ==============================
// CANVAS SETUP
// ==============================

const canvas=document.getElementById("world");
const ctx=canvas.getContext("2d");

function updateStats(){
health.textContent=player.health;
gold.textContent=player.gold;
rep.textContent=reputation.village;
}

// ==============================
// PIXEL DRAWING (NO SPRITES)
// ==============================

function drawPixel(x,y,color,size=6){
ctx.fillStyle=color;
ctx.fillRect(x,y,size,size);
}

function drawPlayer(){
drawPixel(player.x,player.y,"cyan",10);
}

function drawNPC(n){
drawPixel(n.x,n.y,n.color,10);
}

// ==============================
// WORLD LOOP
// ==============================

function drawWorld(){
ctx.clearRect(0,0,canvas.width,canvas.height);

drawPlayer();
worldNPCs.forEach(drawNPC);

updateMinimap();
}

setInterval(drawWorld,50);

// ==============================
// MOVEMENT
// ==============================

document.addEventListener("keydown",e=>{
if(activeDialogue)return;

if(e.key==="ArrowUp")player.y-=10;
if(e.key==="ArrowDown")player.y+=10;
if(e.key==="ArrowLeft")player.x-=10;
if(e.key==="ArrowRight")player.x+=10;

checkInteraction();
});

// ==============================
// DIALOGUE ENGINE (BRANCHING)
// ==============================

function startDialogue(tree){
activeDialogue=tree;
dialogueBox.classList.remove("hidden");
showDialogueNode(tree.start);
}

function showDialogueNode(id){
let node=activeDialogue.nodes[id];
dialogueText.innerText=node.text;
dialogueChoices.innerHTML="";

node.choices?.forEach(choice=>{
let b=document.createElement("button");
b.innerText=choice.text;

b.onclick=()=>{
choice.effect?.();
if(choice.next)showDialogueNode(choice.next);
else closeDialogue();
};

dialogueChoices.appendChild(b);
});
}

function closeDialogue(){
dialogueBox.classList.add("hidden");
activeDialogue=null;
}

// ==============================
// QUEST SYSTEM
// ==============================

function startQuest(id,data){
if(!quests[id]){
quests[id]={...data,status:"active"};
updateQuestLog();
}
}

function completeQuest(id){
if(quests[id]){
quests[id].status="complete";
player.gold+=quests[id].reward||0;
reputation.village+=5;
updateQuestLog();
}
}

function updateQuestLog(){
questList.innerHTML="";
Object.entries(quests).forEach(([id,q])=>{
let d=document.createElement("div");
d.className="quest";
d.textContent=`${q.name} (${q.status})`;
questList.appendChild(d);
});
}

// ==============================
// MINIMAP + QUEST MARKERS
// ==============================

function updateMinimap(){
let map=document.getElementById("minimap");
map.innerHTML="";

Object.values(quests).forEach(q=>{
if(q.status==="active" && q.marker){
let m=document.createElement("div");
m.textContent=`📍 ${q.name}`;
map.appendChild(m);
}
});
}

// ==============================
// NPC DEFINITIONS
// ==============================

worldNPCs=[

// Quest giver
{
x:100,y:100,color:"lime",
dialogue:{
start:"hello",
nodes:{
hello:{
text:"Village Elder: A beast attacks us. Help?",
choices:[
{
text:"Accept quest",
effect:()=>startQuest("boss1",{
name:"Slay Forest Beast",
reward:100,
marker:true
}),
next:"accept"
},
{ text:"No", next:"bye" }
]
},
accept:{ text:"Return when it is slain." },
bye:{ text:"..." }
}
}
},

// Boss
{
x:420,y:300,color:"red",
boss:true,
onInteract(){
if(quests.boss1?.status==="active"){
player.health-=20;
completeQuest("boss1");
alert("Boss defeated!");
}
}
},

// Shop NPC
{
x:200,y:250,color:"yellow",
dialogue:{
start:"shop",
nodes:{
shop:{
text:"Merchant: Buy potion (20 gold)?",
choices:[
{
text:"Buy",
effect:()=>{
if(player.gold>=20){
player.gold-=20;
player.health+=20;
}
}
},
{ text:"Leave" }
]
}
}
}
}

];

// ==============================
// INTERACTION CHECK
// ==============================

function checkInteraction(){
worldNPCs.forEach(n=>{
if(Math.abs(player.x-n.x)<15 && Math.abs(player.y-n.y)<15){
if(n.dialogue)startDialogue(n.dialogue);
if(n.onInteract)n.onInteract();
}
});
}

// ==============================
// SAVE / LOAD SYSTEM
// ==============================

function saveGame(){
localStorage.setItem("pixelRPG",JSON.stringify({
player,
quests,
reputation
}));
alert("Saved!");
}

function loadGame(){
let data=JSON.parse(localStorage.getItem("pixelRPG"));
if(!data)return;

player=data.player;
quests=data.quests;
reputation=data.reputation;

updateQuestLog();
updateStats();
}

// ==============================
// INIT
// ==============================

updateStats();
updateQuestLog();
