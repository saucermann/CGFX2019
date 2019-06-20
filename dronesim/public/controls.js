const X = 0; 
const Y = 1; 
const Z = 2;

var keyFunctionDown = function(e) {
    if(!keys[e.keyCode]) {
        keys[e.keyCode] = true;
          switch(e.keyCode) {
              case 81: 
              //Dir LEFT
              drone.updateVel(X, -1.0);
              break;
              case 69:
              //Dir RIGHT
              drone.updateVel(X, +1.0);
              break;
              case 38:
              //Dir forward
              drone.updateVel(Z, -1.0);
              break;
              case 40:
              //Dir back
              drone.updateVel(Z, +1.0);
              break;
              case 87:
              //Dir UP
              drone.updateVel(Y, -1.0);
              break;
              case 83:
              //Dir DOWN
              drone.updateVel(Y, +1.0);
              break;
              case 39:
              //Dir rotation LEFT
              drone.updateRotVel(-1.0);
              break;
              case 37:
              //Dir rotation RIGHT
              drone.updateRotVel(+1.0);
              break;
          }
    }
  }
  
  var keyFunctionUp = function(e) {
    if(keys[e.keyCode]) {
        keys[e.keyCode] = false;
          switch(e.keyCode) {
              case 81:
              //KeyDown  - Dir LEFT
              drone.updateVel(X, +1.0);
              break;
              case 69:
              //KeyDown - Dir RIGHT
              drone.updateVel(X, -1.0);
              break;
              case 38:
              //KeyDown - Dir forward
              drone.updateVel(Z, +1.0);
              break;
              case 40:
              //KeyDown - Dir back
              drone.updateVel(Z, -1.0);
              break;
              case 87:
              //KeyUp   - Dir UP
              drone.updateVel(Y, +1.0);
              break;
              case 83:
              //KeyUp   - Dir DOWN
              drone.updateVel(Y, -1.0);
              break;
              case 39:
              //KeyDown  - Dir rotation LEFT
              drone.updateRotVel(+1.0);
              break;
              case 37:
              //KeyDown - Dir rotation RIGHT
              drone.updateRotVel(-1.0);
              break;
          }
    }
  }

  