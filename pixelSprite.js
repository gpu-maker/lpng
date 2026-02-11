export function drawPixelSprite(ctx,data,x,y,size=4){
  data.forEach((row,ry)=>{
    row.forEach((c,rx)=>{
      if(!c) return;
      ctx.fillStyle=c;
      ctx.fillRect(x+rx*size,y+ry*size,size,size);
    });
  });
}
