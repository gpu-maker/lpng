export const MapEditor={};

MapEditor.enabled=false;
MapEditor.tileSize=20;

MapEditor.toggle=()=>{
MapEditor.enabled=!MapEditor.enabled;
document.getElementById("mapEditorUI").hidden=!MapEditor.enabled;
};

MapEditor.init=(world,canvas)=>{

const ctx=canvas.getContext("2d");

canvas.addEventListener("click",e=>{

if(!MapEditor.enabled) return;

const rect=canvas.getBoundingClientRect();
const x=Math.floor((e.clientX-rect.left)/MapEditor.tileSize);
const y=Math.floor((e.clientY-rect.top)/MapEditor.tileSize);

const type=document.getElementById("tileType").value;
world[y][x]=type;

});
};

MapEditor.drawGrid=(ctx,width,height)=>{

if(!MapEditor.enabled) return;

ctx.strokeStyle="#333";

for(let x=0;x<width;x+=MapEditor.tileSize){
ctx.beginPath();
ctx.moveTo(x,0);
ctx.lineTo(x,height);
ctx.stroke();
}

for(let y=0;y<height;y+=MapEditor.tileSize){
ctx.beginPath();
ctx.moveTo(0,y);
ctx.lineTo(width,y);
ctx.stroke();
}

};
