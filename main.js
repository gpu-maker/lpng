import { initRenderer, renderFrame } from "./renderer/webglRenderer.js";
import { Player } from "./entities/player.js";
import { generateBiome } from "./world/biomeGenerator.js";
import "./inventory/inventory.js";
import "./ui/paperdoll.js";
import "./ui/skillTree.js";

initRenderer();

const player = new Player();
const world = generateBiome(100,100);

function loop(){
  renderFrame(player, world);
  requestAnimationFrame(loop);
}

loop();

