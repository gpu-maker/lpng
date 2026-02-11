export function generateKnight(equipment={}){

const armor=equipment.armorColor||"#999";
const cloth=equipment.clothColor||"#2244cc";

return[
[0,armor,armor,armor,armor,0],
[armor,"#ffcc99","#ffcc99","#ffcc99","#ffcc99",armor],
[0,armor,armor,armor,armor,0],
[cloth,cloth,armor,armor,cloth,cloth],
[0,armor,0,0,armor,0]
];

}
