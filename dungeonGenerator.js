export function generateDungeon(size=20){
 const grid=[];
 for(let y=0;y<size;y++){
   grid.push(Array(size).fill(Math.random()<0.2?1:0));
 }
 return grid;
}
