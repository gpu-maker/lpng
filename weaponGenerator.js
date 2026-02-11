export function generateWeapon(){
  return{
    name:"Sword "+Math.floor(Math.random()*999),
    damage:Math.floor(Math.random()*10+5),
    color:"#"+Math.floor(Math.random()*16777215).toString(16)
  };
}
