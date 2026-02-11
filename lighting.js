export function applyLighting(ctx,x,y,radius){
  const g=ctx.createRadialGradient(x,y,10,x,y,radius);
  g.addColorStop(0,"rgba(255,255,200,0.4)");
  g.addColorStop(1,"rgba(0,0,0,0.9)");

  ctx.fillStyle=g;
  ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
}
