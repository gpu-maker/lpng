export function renderWorld(ctx,map){
const size=20;

for(let y=0;y<map.length;y++){
for(let x=0;x<map[y].length;x++){

if(map[y][x]==="grass") ctx.fillStyle="#0f0";
if(map[y][x]==="water") ctx.fillStyle="#00f";

ctx.fillRect(x*size,y*size,size,size);
}
}
}
