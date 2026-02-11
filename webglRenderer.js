const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

export function initRenderer(){}

export function renderFrame(player,world){
  ctx.fillStyle="#1a1a1a";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  player.draw(ctx);
}
