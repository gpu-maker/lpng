import {WorldMap} from "./world/mapData.js";
import {renderWorld} from "./engine/renderer.js";
import {MapEditor} from "./tools/mapEditor.js";

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

MapEditor.init(WorldMap,canvas);

document.getElementById("toggleEditor").onclick=MapEditor.toggle;

function loop(){

ctx.clearRect(0,0,canvas.width,canvas.height);

renderWorld(ctx,WorldMap);
MapEditor.drawGrid(ctx,canvas.width,canvas.height);

requestAnimationFrame(loop);
}

loop();
