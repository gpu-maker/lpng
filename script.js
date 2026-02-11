/* ===============================
CONFIG
=============================== */

const TILE=32
const WORLD_SIZE=100
const SCREEN_W=800
const SCREEN_H=600

/* ===============================
CANVAS
=============================== */

const canvas=document.getElementById("game")
canvas.width=SCREEN_W
canvas.height=SCREEN_H
const ctx=canvas.getContext("2d")

const mini=document.getElementById("minimap")
mini.width=200
mini.height=200
const mctx=mini.getContext("2d")

/* ===============================
ASSET LOADER
=============================== */

const Assets={
 images:{},
 sounds:{},

 loadImage(name,src){
  return new Promise(r=>{
   const img=new Image()
   img.src=src
   img.onload=()=>{Assets.images[name]=img;r()}
  })
 },

 loadSound(name,src){
  const a=new Audio(src)
  Assets.sounds[name]=a
 }
}

/* ===============================
BIOMES
=============================== */

const BIOMES=[
 {name:"grass",color:"#3cb043",enemy:"slime"},
 {name:"desert",color:"#e4d96f",enemy:"scorpion"},
 {name:"snow",color:"#ccefff",enemy:"ice"},
 {name:"forest",color:"#1e7a1e",enemy:"wolf"}
]

/* ===============================
WORLD GENERATOR 100x100
=============================== */

let world=[]

function generateWorld(){
 for(let y=0;y<WORLD_SIZE;y++){
  world[y]=[]
  for(let x=0;x<WORLD_SIZE;x++){
   const b=BIOMES[Math.floor(Math.random()*BIOMES.length)]
   world[y][x]={biome:b,enemies:[]}
  }
 }

 // spawn village
 world[50][50].village=true
}

/* ===============================
PLAYER
=============================== */

const player={
 x:50,y:50,
 px:0,py:0,
 speed:3,
 dir:0,
 frame:0,
 hp:100,
 gold:0,
 torchtime:0
}

/* ===============================
INPUT
=============================== */

const keys={}
addEventListener("keydown",e=>keys[e.key]=true)
addEventListener("keyup",e=>keys[e.key]=false)

/* ===============================
PARTICLES
=============================== */

const particles=[]

function spawnParticle(x,y,color){
 particles.push({x,y,vx:Math.random()-0.5,vy:Math.random()-0.5,life:30,color})
}

function updateParticles(){
 for(let i=particles.length-1;i>=0;i--){
  const p=particles[i]
  p.x+=p.vx
  p.y+=p.vy
  p.life--
  if(p.life<=0)particles.splice(i,1)
 }
}

function drawParticles(){
 particles.forEach(p=>{
  ctx.fillStyle=p.color
  ctx.fillRect(p.x,p.y,3,3)
 })
}

/* ===============================
PROJECTILES (BOW + SPELL)
=============================== */

const projectiles=[]

function shoot(){
 projectiles.push({
  x:player.px+16,
  y:player.py+16,
  vx:Math.cos(player.dir)*8,
  vy:Math.sin(player.dir)*8
 })
 Assets.sounds.shoot?.play()
}

function updateProjectiles(){
 for(let i=projectiles.length-1;i>=0;i--){
  const p=projectiles[i]
  p.x+=p.vx
  p.y+=p.vy
  spawnParticle(p.x,p.y,"orange")
  if(p.x<0||p.y<0||p.x>SCREEN_W||p.y>SCREEN_H)
   projectiles.splice(i,1)
 }
}

function drawProjectiles(){
 ctx.fillStyle="yellow"
 projectiles.forEach(p=>ctx.fillRect(p.x,p.y,6,6))
}

/* ===============================
ENEMIES + BOSSES
=============================== */

const enemies=[]

function spawnEnemy(x,y,type){
 enemies.push({x,y,type,hp:30})
}

function spawnBoss(x,y){
 enemies.push({x,y,type:"boss",hp:200,phase:1})
}

function updateEnemies(){
 enemies.forEach(e=>{
  const dx=player.px-e.x
  const dy=player.py-e.y
  const d=Math.hypot(dx,dy)
  if(d<200){
   e.x+=dx/d
   e.y+=dy/d
  }

  if(e.type==="boss" && e.hp<100) e.phase=2
 })
}

function drawEnemies(){
 enemies.forEach(e=>{
  ctx.fillStyle=e.type==="boss"?"red":"purple"
  ctx.fillRect(e.x,e.y,32,32)
 })
}

/* ===============================
LIGHTING + SHADOW ENGINE
=============================== */

function drawLighting(){
 const g=ctx.createRadialGradient(
  player.px+16,player.py+16,20,
  player.px+16,player.py+16,200
 )
 g.addColorStop(0,"rgba(0,0,0,0)")
 g.addColorStop(1,"rgba(0,0,0,.9)")

 ctx.fillStyle=g
 ctx.fillRect(0,0,SCREEN_W,SCREEN_H)
}

/* ===============================
MINIMAP RADAR
=============================== */

function drawMinimap(){
 mctx.clearRect(0,0,200,200)

 const scale=200/WORLD_SIZE

 for(let y=0;y<WORLD_SIZE;y++){
  for(let x=0;x<WORLD_SIZE;x++){
   mctx.fillStyle=world[y][x].biome.color
   mctx.fillRect(x*scale,y*scale,scale,scale)
  }
 }

 mctx.fillStyle="white"
 mctx.fillRect(player.x*scale,player.y*scale,3,3)
}

/* ===============================
SAVE / LOAD
=============================== */

function saveGame(){
 localStorage.setItem("rpgSave",JSON.stringify(player))
}

function loadGame(){
 const s=localStorage.getItem("rpgSave")
 if(s)Object.assign(player,JSON.parse(s))
}

/* ===============================
PLAYER MOVEMENT + ANIMATION
=============================== */

function updatePlayer(){
 if(keys["w"]){player.py-=player.speed;player.dir=-Math.PI/2}
 if(keys["s"]){player.py+=player.speed;player.dir=Math.PI/2}
 if(keys["a"]){player.px-=player.speed;player.dir=Math.PI}
 if(keys["d"]){player.px+=player.speed;player.dir=0}

 if(keys[" "])shoot()
 if(keys["f"])player.torchtime=200

 player.frame+=0.1
}

/* ===============================
DRAW WORLD
=============================== */

function drawWorld(){
 const tileX=Math.floor(player.px/TILE)
 const tileY=Math.floor(player.py/TILE)

 for(let y=-10;y<10;y++){
  for(let x=-13;x<13;x++){
   const wx=tileX+x
   const wy=tileY+y
   if(wx<0||wy<0||wx>=WORLD_SIZE||wy>=WORLD_SIZE)continue

   const b=world[wy][wx]
   ctx.fillStyle=b.biome.color
   ctx.fillRect(
    x*TILE+SCREEN_W/2,
    y*TILE+SCREEN_H/2,
    TILE,TILE
   )

   if(b.village){
    ctx.fillStyle="brown"
    ctx.fillRect(x*TILE+SCREEN_W/2,y*TILE+SCREEN_H/2,20,20)
   }
  }
 }
}

/* ===============================
DRAW PLAYER (SPRITE SHEET)
=============================== */

function drawPlayer(){
 const img=Assets.images.knight
 if(!img)return

 const frame=Math.floor(player.frame)%4
 ctx.drawImage(
  img,
  frame*32,0,32,32,
  SCREEN_W/2-16,SCREEN_H/2-16,
  32,32
 )
}

/* ===============================
GAME LOOP
=============================== */

function loop(){
 ctx.clearRect(0,0,SCREEN_W,SCREEN_H)

 updatePlayer()
 updateParticles()
 updateProjectiles()
 updateEnemies()

 drawWorld()
 drawEnemies()
 drawProjectiles()
 drawPlayer()
 drawParticles()
 drawLighting()
 drawMinimap()

 requestAnimationFrame(loop)
}

/* ===============================
INIT
=============================== */

async function init(){
 await Assets.loadImage("knight","assets/knight.png")
 Assets.loadSound("shoot","assets/shoot.wav")

 generateWorld()
 loadGame()

 spawnEnemy(200,200,"slime")
 spawnBoss(400,300)

 loop()
}

init()

setInterval(saveGame,5000)

