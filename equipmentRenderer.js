export function applyEquipment(base,equipment){
  if(equipment.helmet)
    base[0]=base[0].map(()=>equipment.helmet.color);

  if(equipment.chest)
    base[3]=base[3].map(()=>equipment.chest.color);

  return base;
}
