export function generateBiome(w,h){
 const map=[];
 for(let y=0;y<h;y++){
   const row=[];
   for(let x=0;x<w;x++){
     row.push(Math.random()<0.1?"forest":"plains");
   }
   map.push(row);
 }
 return map;
}
