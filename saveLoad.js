export function saveGame(data){
 localStorage.setItem("save",JSON.stringify(data));
}

export function loadGame(){
 return JSON.parse(localStorage.getItem("save"));
}
