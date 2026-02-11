const inv=document.getElementById("inventory");

for(let i=0;i<20;i++){
  const slot=document.createElement("div");
  slot.className="slot";
  slot.draggable=true;
  slot.style.border="1px solid #444";
  slot.style.height="40px";
  inv.appendChild(slot);
}
