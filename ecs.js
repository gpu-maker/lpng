export class Entity {
  constructor(){ this.components={}; }
  add(name,data){ this.components[name]=data; }
  get(name){ return this.components[name]; }
}

export const Systems=[];

export function updateSystems(dt){
  Systems.forEach(s=>s(dt));
}
