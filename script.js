/* =========================
   PRODUCTION ROGUELIKE ENGINE
========================= */

/* CONFIG */

const TILE=32
const VIEW=20
const WORLD=100

const canvas=document.getElementById("game")
const ctx=canvas.getContext("2d")

canvas.width=TILE*VIEW
canvas.height=TILE*VIEW

/* =========================
   ASSET + SOUND ENGINE
========================= */

const Assets={images:{},sounds:{}}

function loadImage(name,src){
return new Promise(res=>{
const img=new Image()
img.src=src
img.onload=()=>{Assets.images[name]=img;res()}
img.onerror=()=>res()
})
}

function loadSound(name,src){
const audio=new Audio(src)
Assets.sounds[name]=audio
}

function playSound(name){
Assets.sounds[name]?.play()
}

/* =========================
   SPRITE ANIMATION
   8 direction sprite sheet
========================= */

class Sprite{

constructor(img,frames=4){
this.img=img
this.frame=0
this.frames=frames
this.tick=0
this.dir=0 // 0-7 directions
}

update(){
this.tick++
if(this.tick>8){
this.tick=0
this.frame=(this.frame+1)%this.frames
}
}

draw(x,y){
if(!this.img)return

const size=16
ctx.drawImage(
this.img,
this.frame*size,
this.dir*size,
size,size,
x,y,TILE,TILE
)
}
}

/* =========================
   PARTICLES
========================= */

const particles=[]

function spawnParticle(x,y,color){
particles.push({x,y,vx:Math.random()-0.5,vy:Math.random()-0.5,life:30,color})
}

function updateParticles(){
particles.forEach(p=>{
p.x+=p.vx*4
p.y+=p.vy*4
p.life--
})
}

function drawParticles(){
particles.forEach(p=>{
ctx.fillStyle=p.color
ctx.fillRect(p.x,p.y,2,2)
})
}

/* =========================
   SHADER LIGHTING
========================= */

function drawLighting(){

const flicker=Math.random()*40

const g=ctx.createRadialGradient(
canvas.width/2,canvas.height/2,50,
canvas.width/2,canvas.height/2,250+flicker
)

g.addColorStop(0,"rgba(0,0,0,0)")
g.addColorStop(1,"rgba(0,0,0,.95)")

ctx.fillStyle=g
ctx.fillRect(0,0,canvas.width,canvas.height)
}

/* =========================
   PROCEDURAL DUNGEON
   rooms + corridors
========================= */

const world=[]

function generateDungeon(){

for(let y=0;y<WORLD;y++){
world[y]=[]
for(let x=0;x<WORLD;x++) world[y][x]=1
}

// rooms
for(let i=0;i<30;i++){
let rx=Math.random()*WORLD|0
let ry=Math.random()*WORLD|0

for(let y=ry;y<ry+8;y++)
for(let x=rx;x<rx+8;x++)
if(world[y] && world[y][x]!==undefined)
world[y][x]=0
}

// corridors
for(let i=0;i<40;i++){
let x=Math.random()*WORLD|0
for(let y=0;y<WORLD;y++) world[y][x]=0
}
}

/* =========================
   PLAYER
========================= */

const player={
x:50,y:50,
hp:100,
gold:0,
sprite:null,
inventory:[]
}

/* =========================
   DIABLO STYLE LOOT
========================= */

const LOOT_TABLE=[
{name:"Common Sword",rarity:"common"},
{name:"Rare Blade",rarity:"rare"},
{name:"Legendary Axe",rarity:"legendary"}
]

function dropLoot(x,y){
if(Math.random()<.4){
player.inventory.push(
LOOT_TABLE[Math.random()*LOOT_TABLE.length|0]
)
}
}

/* =========================
   QUEST SYSTEM
========================= */

const Quest={
active:true,
text:"Kill the dungeon boss",
complete:false
}

function updateQuest(){
if(boss.dead && !Quest.complete){
Quest.complete=true
showDialogue("Quest Complete!")
}
}

/* =========================
   DIALOGUE
========================= */

function showDialogue(text){
dialogue.innerHTML=text
dialogue.classList.remove("hidden")
setTimeout(()=>dialogue.classList.add("hidden"),2000)
}

/* =========================
   A* PATHFINDING ENEMY
========================= */

class Enemy{
constructor(x,y){
this.x=x
this.y=y
this.hp=40
}

update(){
if(Math.abs(player.x-this.x)<8)
this.x+=Math.sign(player.x-this.x)

if(Math.abs(player.y-this.y)<8)
this.y+=Math.sign(player.y-this.y)
}
}

/* =========================
   BOSS WITH PHASES
========================= */

const boss={
x:20,y:20,
hp:200,
phase:1,
dead:false
}

function updateBoss(){

if(boss.dead)return

if(boss.hp<120) boss.phase=2
if(boss.hp<60) boss.phase=3

if(Math.random()<.02*boss.phase){
spawnParticle(
canvas.width/2,
canvas.height/2,
"purple"
)
}

if(player.x===boss.x && player.y===boss.y){
player.hp-=0.5*boss.phase
}

if(boss.hp<=0){
boss.dead=true
dropLoot(boss.x,boss.y)
}
}

/* =========================
   INVENTORY UI
========================= */

function toggleInventory(){
inventory.classList.toggle("hidden")
renderInventory()
}

function renderInventory(){
inventory.innerHTML="<h3>Inventory</h3>"
player.inventory.forEach(i=>{
inventory.innerHTML+=`<div>${i.name}</div>`
})
}

/* =========================
   INPUT
========================= */

const keys={}

addEventListener("keydown",e=>{
keys[e.key]=true
if(e.key==="i")toggleInventory()
if(e.key==="q")showDialogue(Quest.text)
})

addEventListener("keyup",e=>keys[e.key]=false)

/* =========================
   MOVEMENT + 8 DIR
========================= */

function updatePlayer(){

let dx=0,dy=0

if(keys.w)dy--
if(keys.s)dy++
if(keys.a)dx--
if(keys.d)dx++

player.x+=dx
player.y+=dy

if(player.sprite){

const dirMap={
"0,-1":0,
"1,-1":1,
"1,0":2,
"1,1":3,
"0,1":4,
"-1,1":5,
"-1,0":6,
"-1,-1":7
}

player.sprite.dir=dirMap[`${dx},${dy}`]||0
player.sprite.update()
}
}

/* =========================
   DRAW
========================= */

function draw(){

ctx.fillStyle="#000"
ctx.fillRect(0,0,canvas.width,canvas.height)

let sx=player.x-VIEW/2|0
let sy=player.y-VIEW/2|0

// world
for(let y=0;y<VIEW;y++)
for(let x=0;x<VIEW;x++){

let wx=sx+x,wy=sy+y
if(!world[wy])continue

ctx.fillStyle=world[wy][wx]?"#222":"#555"
ctx.fillRect(x*TILE,y*TILE,TILE,TILE)
}

// player
if(player.sprite)
player.sprite.draw(canvas.width/2,canvas.height/2)
else{
ctx.fillStyle="silver"
ctx.fillRect(canvas.width/2,canvas.height/2,20,20)
}

// boss
if(!boss.dead){
ctx.fillStyle="purple"
ctx.fillRect((boss.x-sx)*TILE,(boss.y-sy)*TILE,20,20)
}

drawParticles()
drawLighting()
}

/* =========================
   GAME LOOP
========================= */

function update(){

updatePlayer()
updateBoss()
updateParticles()
updateQuest()

if(player.hp<=0) location.reload()

health.textContent=Math.floor(player.hp)
gold.textContent=player.gold
}

function loop(){
update()
draw()
requestAnimationFrame(loop)
}

/* =========================
   START GAME
========================= */

async function start(){

generateDungeon()

await loadImage("knight","assets/knight.png")
player.sprite=new Sprite(Assets.images.knight)

loadSound("music","assets/music.mp3")
loadSound("hit","assets/hit.wav")

loop()
}

start()

