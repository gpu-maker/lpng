const tree=document.getElementById("skillTree");

const skills=["Strength","Defense","Magic","Speed"];

skills.forEach(s=>{
 const b=document.createElement("button");
 b.innerText=s;
 b.onclick=()=>alert("Learned "+s);
 tree.appendChild(b);
});
