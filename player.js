import { generateKnight } from "../graphics/knightGenerator.js";
import { applyEquipment } from "../graphics/equipmentRenderer.js";
import { drawPixelSprite } from "../graphics/pixelSprite.js";

export class Player{
  constructor(){
    this.x=200;
    this.y=200;

    this.equipment={
      helmet:{color:"#bbb"},
      chest:{color:"#666"}
    };
  }

  draw(ctx){
    let sprite=generateKnight(this.equipment);
    sprite=applyEquipment(sprite,this.equipment);
    drawPixelSprite(ctx,sprite,this.x,this.y);
  }
}
