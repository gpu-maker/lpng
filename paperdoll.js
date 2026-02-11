const pd=document.getElementById("paperdoll");
pd.innerHTML="<h3>Character</h3><canvas id='paperCanvas'></canvas>";

const c=document.getElementById("paperCanvas");
const ctx=c.getContext("2d");

export function updatePaperDoll(sprite){
 ctx.clearRect(0,0,200,200);
}
