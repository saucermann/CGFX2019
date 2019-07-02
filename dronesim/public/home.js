var menu = ['dirLightMenu','ambLightMenu','po1LightMenu','po2LightMenu','po3LightMenu','skyboxMenu','droneMenu'];

var switches = ["Dir","Amb","Po1","Po2","Po3","Sky","Col"];

function ehi(){
  alert("ehi");
}

function toggleOn(id){
  var elem = document.getElementById(id);
    elem.style.display = "flex";
}

function toggleOff(id){
  var elem = document.getElementById(id);
    elem.style.display = "none";
}

function toggleOnExclusive(id){
  var header;
  for(let i=0; i<menu.length; i++){
    toggleOff(menu[i]);
     header = document.getElementById(menu[i]+"Header");
     header.style.color = "black";
  }
  var elem = document.getElementById(id);
    elem.style.display = "flex";
  header = document.getElementById(id+"Header");
    header.style.color = "white";
}

function getVal(id){
  var elem = document.getElementById(id);
  return elem.value;
}

function getColor(id){
  var elem = document.getElementById(id);
  var colorcode = elem.value;
  colorcode = colorcode.slice(1,8);
  if (colorcode.length == 6){
    return   [parseInt(colorcode.substring(0,2), 16)/255,
              parseInt(colorcode.substring(2,4), 16)/255,
              parseInt(colorcode.substring(4,6), 16)/255,
              1];
  }
  return [0,0,0,0];
}

function getHex(color){
  var result = "#";
  var tmp;
  for(let i=0; i<3; i++){
    tmp = Math.round(color[i]*255)
    if(tmp<10){
      result+="0"+tmp.toString(16);
    }else{
      result+=tmp.toString(16);
    }

  }
  return result;
}

function setColor(light){
  switch(light){
    case "dirCol": lights["direct"].color = getColor(light);
                    break;
    case "ambCol": lights["ambient"].color = getColor(light);
                    break;
    case "po1Col": lights["point"][0].color = getColor(light);
                    break;
    case "po2Col": lights["point"][1].color = getColor(light);
                    break;
    case "po3Col": lights["point"][2].color = getColor(light);
                    break;
    case "skyCol": skyBox.emitColor = getColor(light);
                    break;
    default : break;
  }
}

function setNormDir(){
  document.getElementById("dirX").value = lights["direct"].direction[0];
  document.getElementById("dirY").value = lights["direct"].direction[1];
  document.getElementById("dirZ").value = lights["direct"].direction[2];
}

function setDir(coor){
  switch(coor){
    case "dirX":  lights["direct"].setCoor(0,getVal(coor));
                  setNormDir();
                    break;
    case "dirY":  lights["direct"].setCoor(1,getVal(coor));
                  setNormDir();
                    break;
    case "dirZ":  lights["direct"].setCoor(2,getVal(coor));
                  setNormDir();
                    break;
    default : break;
  }
}

function setCor(coor){
  switch(coor){
    case "po1X":  lights["point"][0].setCoor(0,getVal(coor));
                    break;
    case "po1Y":  lights["point"][0].setCoor(1,getVal(coor));
                    break;
    case "po1Z":  lights["point"][0].setCoor(2,getVal(coor));
                    break;
    case "po2X":  lights["point"][1].setCoor(0,getVal(coor));
                    break;
    case "po2Y":  lights["point"][1].setCoor(1,getVal(coor));
                    break;
    case "po2Z":  lights["point"][1].setCoor(2,getVal(coor));
                    break;
    case "po3X":  lights["point"][2].setCoor(0,getVal(coor));
                    break;
    case "po3Y":  lights["point"][2].setCoor(1,getVal(coor));
                    break;
    case "po3Z":  lights["point"][2].setCoor(2,getVal(coor));
                    break;
    case "droX":  drone.pos[0] = getVal(coor);
                    break;
    case "droY":  drone.pos[1] = getVal(coor);
                    break;
    case "droZ":  drone.pos[2] = getVal(coor);
                    break;
    default : break;
  }
}

function setDecay(light){
  switch(light){
    case "po1D":  lights["point"][0].decay=getVal(light);
                    break;
    case "po2D":  lights["point"][1].decay=getVal(light);
                    break;
    case "po3D":  lights["point"][2].decay=getVal(light);
                    break;
    default : break;
  }
}

function setTarget(light){
  switch(light){
    case "po1T":  lights["point"][0].target=getVal(light);
                    break;
    case "po2T":  lights["point"][1].target=getVal(light);
                    break;
    case "po3T":  lights["point"][2].target=getVal(light);
                    break;
    default : break;
  }
}

function switchElem(elem){
  switch(elem){
    case "Dir":  if(lights["direct"].on){
                    lights["direct"].on = false;
                    toggleOn("switchOff"+elem);
                    toggleOff("switchOn"+elem);
                  }else{
                    lights["direct"].on = true;
                    toggleOff("switchOff"+elem);
                    toggleOn("switchOn"+elem);
                  }
                    break;
  case "Amb":  if(lights["ambient"].on){
                    lights["ambient"].on = false;
                    toggleOn("switchOff"+elem);
                    toggleOff("switchOn"+elem);
                  }else{
                    lights["ambient"].on = true;
                    toggleOff("switchOff"+elem);
                    toggleOn("switchOn"+elem);
                  }
                    break;
  case "Po1":  if(lights["point"][0].on){
                  lights["point"][0].on = false;
                  toggleOn("switchOff"+elem);
                  toggleOff("switchOn"+elem);
                }else{
                  lights["point"][0].on = true;
                  toggleOff("switchOff"+elem);
                  toggleOn("switchOn"+elem);
                }
                  break;
  case "Po2":  if(lights["point"][1].on){
                  lights["point"][1].on = false;
                  toggleOn("switchOff"+elem);
                  toggleOff("switchOn"+elem);
                }else{
                  lights["point"][1].on = true;
                  toggleOff("switchOff"+elem);
                  toggleOn("switchOn"+elem);
                }
                  break;
  case "Po3":  if(lights["point"][2].on){
                  lights["point"][2].on = false;
                  toggleOn("switchOff"+elem);
                  toggleOff("switchOn"+elem);
                }else{
                  lights["point"][2].on = true;
                  toggleOff("switchOff"+elem);
                  toggleOn("switchOn"+elem);
                }
                  break;
  case "Sky":  if(skyBox.toBeDrawn){
                  skyBox.toBeDrawn = false;
                  toggleOn("switchOff"+elem);
                  toggleOff("switchOn"+elem);
                }else{
                  skyBox.toBeDrawn = true;
                  toggleOff("switchOff"+elem);
                  toggleOn("switchOn"+elem);
                }
                  break;
  case "Col":  if(drone.collisionOn){
                  drone.collisionOn = false;
                  toggleOn("switchOff"+elem);
                  toggleOff("switchOn"+elem);
                }else{
                  drone.collisionOn = true;
                  toggleOff("switchOff"+elem);
                  toggleOn("switchOn"+elem);
                }
                  break;
    default : break;
  }
}

function updateInputDrone(){
  document.getElementById("droX").value = drone.pos[0];
  document.getElementById("droY").value = drone.pos[1];
  document.getElementById("droZ").value = drone.pos[2];
}

function initInput(){
  document.getElementById("dirCol").value = getHex(lights["direct"].color);
  document.getElementById("ambCol").value = getHex(lights["ambient"].color);
  document.getElementById("po1Col").value = getHex(lights["point"][0].color);
  document.getElementById("po2Col").value = getHex(lights["point"][1].color);
  document.getElementById("po3Col").value = getHex(lights["point"][2].color);
  document.getElementById("skyCol").value = getHex(skyBox.emitColor);

  setNormDir();

  document.getElementById("po1X").value = lights["point"][0].pos[0];
  document.getElementById("po1Y").value = lights["point"][0].pos[1];
  document.getElementById("po1Z").value = lights["point"][0].pos[2];
  document.getElementById("po2X").value = lights["point"][1].pos[0];
  document.getElementById("po2Y").value = lights["point"][1].pos[1];
  document.getElementById("po2Z").value = lights["point"][1].pos[2];
  document.getElementById("po3X").value = lights["point"][2].pos[0];
  document.getElementById("po3Y").value = lights["point"][2].pos[1];
  document.getElementById("po3Z").value = lights["point"][2].pos[2];

  document.getElementById("po1D").value = lights["point"][0].decay;
  document.getElementById("po1T").value = lights["point"][0].target;
  document.getElementById("po2D").value = lights["point"][1].decay;
  document.getElementById("po2T").value = lights["point"][1].target;
  document.getElementById("po3D").value = lights["point"][2].decay;
  document.getElementById("po3T").value = lights["point"][2].target;
  updateInputDrone();

  for(let i=0; i<switches.length; i++){
    switchElem(switches[i]);
    switchElem(switches[i]);
  }

}
