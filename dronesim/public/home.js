var menu = ['dirLightMenu','ambLightMenu','po1LightMenu','po2LightMenu','po3LightMenu','skyboxMenu','droneMenu'];

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

function setDir(coor){
  switch(coor){
    case "dirX":  lights["direct"].setCoor(0,getVal(coor));
                    break;
    case "dirY":  lights["direct"].setCoor(1,getVal(coor));
                    break;
    case "dirZ":  lights["direct"].setCoor(2,getVal(coor));
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
