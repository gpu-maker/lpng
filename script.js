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
PLAYER + RPG STATS
=============================== */

const player={
 x:50,y:50,
 px:0,py:0,
 hp:100,maxHp:100,
 mana:50,
 gold:200,
 attack:10,
 defense:0,
 dir:0,
 frame:0,
 equipment:{weapon:null,armor:null}
}

/* ===============================
INPUT
=============================== */

const keys={}
addEventListener("keydown",e=>{
 keys[e.key]=true

 if(e.key==="i")toggle("inventory")
 if(e.key==="k")toggle("skills")
 if(e.key==="e")toggle("shop")
})
addEventListener("keyup",e=>keys[e.key]=false)

function toggle(id){
 document.getElementById(id).classList.toggle("hidden")
}

/* ===============================
DIABLO LOOT SYSTEM
=============================== */

const AFFIXES=[
 {name:"Strong",attack:5},
 {name:"Guarded",defense:5},
 {name:"Vampiric",lifeSteal:2}
]

function rollItem(){
 const aff=AFFIXES[Math.floor(Math.random()*AFFIXES.length)]
 return{
  name:aff.name+" Sword",
  ...aff
 }
}

/* ===============================
INVENTORY GRID + DRAG DROP
=============================== */

const inventory=new Array(25).fill(null)
inventory[0]=rollItem()

const grid=document.getElementById("grid")

function drawInventory(){
 grid.innerHTML=""
 inventory.forEach((item,i)=>{
  const d=document.createElement("div")
  d.className="slot"
  d.draggable=true
  d.dataset.index=i
  d.textContent=item?item.name[0]:""

  d.ondragstart=e=>e.dataTransfer.setData("i",i)

  d.ondrop=e=>{
   const from=e.dataTransfer.getData("i")
   ;[inventory[i],inventory[from]]=[inventory[from],inventory[i]]
   drawInventory()
  }

  d.ondragover=e=>e.preventDefault()
  grid.appendChild(d)
 })
}

drawInventory()

/* ===============================
SHOP SYSTEM + BLACKSMITH
=============================== */

const shopItems=[
 {name:"Sword",price:100,attack:5},
 {name:"Armor",price:120,defense:5},
 {name:"Potion",price:20}
]

const shopUI=document.getElementById("shopItems")

function drawShop(){
 shopUI.innerHTML=""
 shopItems.forEach(item=>{
  const b=document.createElement("button")
  b.textContent=item.name+" $"+item.price
  b.onclick=()=>{
   if(player.gold>=item.price){
    player.gold-=item.price
    inventory.push(item)
    updateHUD()
   }
  }
  shopUI.appendChild(b)
 })
}

drawShop()

/* ===============================
SKILL TREE
=============================== */

const skills=[
 {name:"Power",level:0,max:5,apply:()=>player.attack++},
 {name:"Vitality",level:0,max:5,apply:()=>player.maxHp+=10}
]

const skillTree=document.getElementById("skillTree")

function drawSkills(){
 skillTree.innerHTML=""
 skills.forEach(s=>{
  const b=document.createElement("button")
  b.textContent=s.name+" "+s.level+"/"+s.max
  b.onclick=()=>{
   if(s.level<s.max){
    s.level++
    s.apply()
    drawSkills()
   }
  }
  skillTree.appendChild(b)
 })
}
drawSkills()

/* ===============================
ENEMIES + HEALTH BARS
=============================== */

const enemies=[]

function spawnEnemy(x,y){
 enemies.push({x,y,hp:40,maxHp:40})
}

spawnEnemy(300,300)

function updateEnemies(){
 enemies.forEach(e=>{
  const dx=player.px-e.x
  const dy=player.py-e.y
  const d=Math.hypot(dx,dy)
  if(d<200){e.x+=dx/d;e.y+=dy/d}
 })
}

function drawEnemies(){
 enemies.forEach(e=>{
  ctx.fillStyle="purple"
  ctx.fillRect(e.x,e.y,32,32)

  ctx.fillStyle="red"
  ctx.fillRect(e.x,e.y-5,32*(e.hp/e.maxHp),4)
 })
}

/* ===============================
DAMAGE NUMBERS
=============================== */

function damageText(x,y,val){
 const d=document.createElement("div")
 d.className="damage"
 d.style.left=x+"px"
 d.style.top=y+"px"
 d.textContent=val
 document.body.appendChild(d)

 let t=0
 const i=setInterval(()=>{
  t++
  d.style.top=(y-t)+"px"
  if(t>30){clearInterval(i);d.remove()}
 },16)
}

/* ===============================
8 DIRECTION ATTACK
=============================== */

function attack(){
 enemies.forEach(e=>{
  const d=Math.hypot(e.x-player.px,e.y-player.py)
  if(d<50){
   e.hp-=player.attack
   damageText(e.x,e.y,player.attack)
  }
 })
}

/* ===============================
PROCEDURAL DUNGEON
=============================== */

let dungeon=[]

function generateDungeon(){
 dungeon=[]
 for(let y=0;y<20;y++){
  dungeon[y]=[]
  for(let x=0;x<20;x++)
   dungeon[y][x]=Math.random()<0.4?1:0
 }
}

/* ===============================
WORLD + BIOMES
=============================== */

const BIOMES=["#3cb043","#e4d96f","#ccefff","#1e7a1e"]
let world=[]

function generateWorld(){
 for(let y=0;y<WORLD_SIZE;y++){
  world[y]=[]
  for(let x=0;x<WORLD_SIZE;x++)
   world[y][x]={color:BIOMES[Math.random()*BIOMES.length|0]}
 }
}

/* ===============================
DRAW WORLD
=============================== */

function drawWorld(){
 const tx=Math.floor(player.px/TILE)
 const ty=Math.floor(player.py/TILE)

 for(let y=-10;y<10;y++){
  for(let x=-13;x<13;x++){
   const wx=tx+x
   const wy=ty+y
   if(!world[wy]||!world[wy][wx])continue

   ctx.fillStyle=world[wy][wx].color
   ctx.fillRect(x*TILE+SCREEN_W/2,y*TILE+SCREEN_H/2,TILE,TILE)
  }
 }
}

/* ===============================
MINIMAP
=============================== */

function drawMinimap(){
 const scale=200/WORLD_SIZE
 mctx.clearRect(0,0,200,200)

 for(let y=0;y<WORLD_SIZE;y++)
  for(let x=0;x<WORLD_SIZE;x++){
   mctx.fillStyle=world[y][x].color
   mctx.fillRect(x*scale,y*scale,scale,scale)
  }

 mctx.fillStyle="white"
 mctx.fillRect(player.x*scale,player.y*scale,3,3)
}

/* ===============================
HUD
=============================== */

function updateHUD(){
 hp.textContent=player.hp
 gold.textContent=player.gold
 mana.textContent=player.mana
}

/* ===============================
PLAYER MOVEMENT
=============================== */

function updatePlayer(){
 if(keys.w){player.py-=3;player.dir=0}
 if(keys.s){player.py+=3;player.dir=4}
 if(keys.a){player.px-=3;player.dir=6}
 if(keys.d){player.px+=3;player.dir=2}

 if(keys[" "])attack()

 player.frame+=0.2
}

/* ===============================
DRAW PLAYER + EQUIPMENT VISUAL
=============================== */

function drawPlayer(){
 ctx.fillStyle="silver"
 ctx.fillRect(SCREEN_W/2-16,SCREEN_H/2-16,32,32)

 if(player.equipment.weapon){
  ctx.fillStyle="yellow"
  ctx.fillRect(SCREEN_W/2+10,SCREEN_H/2,10,4)
 }
}

/* ===============================
GAME LOOP
=============================== */

function loop(){
 ctx.clearRect(0,0,SCREEN_W,SCREEN_H)

 updatePlayer()
 updateEnemies()

 drawWorld()
 drawEnemies()
 drawPlayer()
 drawMinimap()
 updateHUD()

 requestAnimationFrame(loop)
}

/* ===============================
INIT
=============================== */

generateWorld()
generateDungeon()
loop()
