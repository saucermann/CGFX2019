//----------------------------------------VARIABLE DECLARATION-----------------------------------------
// Canvas
var canvas;

// GL variables
var gl = null,
	program = null,
	program1 = null;
	
// Object variables
var droneMesh = null,
	itBoxMesh = null,
	terrainMesh = null;
	
// Textures variables
var	imgtx = null;
	
// Drawing environment variables 
var	skybox = null,
	skyboxLattx = null,
	skyboxTbtx = null;
	
// Projection variables
var worldMatrix, 
	viewMatrix,
	projectionMatrix,
	perspectiveMatrix,
	skyboxWM;
var aspectRatio;
var lookRadius = 10.0;
	
// Light variables
var gLightDir;

// ASSETS

// Vertex shader
var vs;
// Fragment shader
var fs;
var droneObjStr;
var terrainObjStr;
var itBoxObjStr;

async function loadAssets() {
	console.log("Loading assets...");
	await Promise.all([
	fetch('./static/shaders/vertex.glsl').then( response => response.text() ).then(function(text) {
		console.log("Loaded vertex shader.")
		vs = text;
	}),
	fetch('./static/shaders/fragment.glsl').then( response => response.text() ).then(function(text) {
		console.log("Loaded fragment shader.")
		fs = text;
	}),
	fetch('./static/assets/objects/drone.obj').then( response => response.text() ).then(function(text) {
		console.log("Loaded drone object.")
		droneObjStr = text;
	}),
	fetch('./static/assets/objects/terrain.obj').then( response => response.text() ).then(function(text) {
		console.log("Loaded terrain.")
		terrainObjStr = text;
	}),
	fetch('./static/assets/objects/box.obj').then( response => response.text() ).then(function(text) {
		console.log("Loaded Box.")
		itBoxObjStr = text;
	})]);
	console.log("Done.")
}

//Parameters for Camera
var cx = 4.5;
var cy = 5.0;
var cz = 10.0;
var elevation = 0.01;
var angle = 0.01;
var roll = 0.01;
var camVel = [0,0,0];

//Camera parameters
var fSk = 500.0;
var fDk = 2.0 * Math.sqrt(fSk);

//Drone movement variables
var droneAngle = 0;		//Angle & position
var droneX = 0;
var droneY = 10;
var droneZ = 0;
var preVz = 0;			//Prev positions
var preVy = 0;
var preVx = 0;
var rvy = 0.0;			//Delta angle & position
var vx = 0.0;
var vy = 0.0;
var vz = 0.0;
var droneLinAccx = 0.0;	//Accelerations & velocities for position
var droneLinVelx = 0.0;
var droneLinAccy = 0.0;
var droneLinVely = 0.0;
var droneLinAccz = 0.0;
var droneLinVelz = 0.0;
var droneAngVel = 0.0;	//Velocity for rotation

// Flying dynamic coefficients
var sAT = 0.5;
var mAT = 5.0;
var ATur = 3.0;
var ATdr = 5.5;
var sBT = 1.0;
var mBT = 3.0;
var BTur = 5.0;
var BTdr = 5.5;
var Tfric = Math.log(0.05);
var sAS = 0.1;	// Not used yet
var mAS = 108.0;
var ASur = 1.0;	// Not used yet
var ASdr = 0.5;	// Not used yet

//Time variables
var lastUpdateTime;
var deltaT;
var keys = [];


//----------------------------------------INPUT OUTPUT FUNCTIONS-----------------------------------------
/*
var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;
function doMouseDown(event) {
	lastMouseX = event.pageX;
	lastMouseY = event.pageY;
	mouseState = true;
}
function doMouseUp(event) {
	lastMouseX = -100;
	lastMouseY = -100;
	mouseState = false;
}
function doMouseMove(event) {
	if(mouseState) {
		var dx = event.pageX - lastMouseX;
		var dy = lastMouseY - event.pageY;
		lastMouseX = event.pageX;
		lastMouseY = event.pageY;
		
		if((dx != 0) || (dy != 0)) {
			angle = angle + 0.5 * dx;
			elevation = elevation + 0.5 * dy;
		}
	}
}
function doMouseWheel(event) {
	var nLookRadius = lookRadius + event.wheelDelta/1000.0;
	if((nLookRadius > 2.0) && (nLookRadius < 20.0)) {
		lookRadius = nLookRadius;
	}
}
*/

function setupCanvas() {
// setup everything else
	console.log("Setting up canvas...")
	canvas = document.getElementById("drone-sim-canvas");
	//canvas.addEventListener("mousedown", doMouseDown, false);
	//canvas.addEventListener("mouseup", doMouseUp, false);
	//canvas.addEventListener("mousemove", doMouseMove, false);
	//canvas.addEventListener("mousewheel", doMouseWheel, false);
	window.addEventListener("keyup", keyFunctionUp, false);
	window.addEventListener("keydown", keyFunctionDown, false);
	window.onresize = doResize;
	canvas.width  = window.innerWidth-16;
	canvas.height = window.innerHeight-200;
	console.log("Done.")
}

var keyFunctionDown =function(e) {
  if(!keys[e.keyCode]) {
  	keys[e.keyCode] = true;
		switch(e.keyCode) {
			case 81:
			//Dir LEFT
			vx = vx - 1.0;
			break;
			case 69:
			//Dir RIGHT
			vx = vx + 1.0;
			break;
			case 38:
			//Dir forward
			vz = vz - 1.0;
			break;
			case 40:
			//Dir back
			vz = vz + 1.0;
			break;
			case 87:
			//Dir UP
			vy = vy - 1.0;
			break;
			case 83:
			//Dir DOWN
			vy = vy + 1.0;
			break;
			case 39:
			//Dir rotation LEFT
			rvy = rvy - 1.0;
			break;
			case 37:
			//Dir rotation RIGHT
			rvy = rvy + 1.0;
			break;
		}
  }
}

var keyFunctionUp =function(e) {
  if(keys[e.keyCode]) {
  	keys[e.keyCode] = false;
		switch(e.keyCode) {
			case 81:
			//KeyDown  - Dir LEFT
			vx = vx + 1.0;
			break;
			case 69:
			//KeyDown - Dir RIGHT
			vx = vx - 1.0;
			break;
			case 38:
			//KeyDown - Dir forward
			vz = vz + 1.0;
			break;
			case 40:
			//KeyDown - Dir back
			vz = vz - 1.0;
			break;
			case 87:
			//KeyUp   - Dir UP
			vy = vy + 1.0;
			break;
			case 83:
			//KeyUp   - Dir DOWN
			vy = vy - 1.0;
			break;
			case 39:
			//KeyDown  - Dir rotation LEFT
			rvy = rvy + 1.0;
			break;
			case 37:
			//KeyDown - Dir rotation RIGHT
			rvy = rvy - 1.0;
			break;
		}
  }
}

function doResize() {
  // set canvas dimensions
	var canvas = document.getElementById("my-canvas");
	if((window.innerWidth > 40) && (window.innerHeight > 240)) {
		canvas.width  = window.innerWidth-16;
		canvas.height = window.innerHeight-200;
		var w=canvas.clientWidth;
		var h=canvas.clientHeight;
		
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.viewport(0.0, 0.0, w, h);
		
		aspectRatio = w/h;
	}
}

//----------------------------------------DRAW SUPPORT FUNCTIONS-----------------------------------------
function computeDeltaT(){

	// compute time interval
	var currentTime = (new Date).getTime();
	if(lastUpdateTime){
		deltaT = (currentTime - lastUpdateTime) / 1000.0;
	} else {
		deltaT = 1/50;
	}
	lastUpdateTime = currentTime;
	return deltaT;
}

/*
var lastUpdateTime;
var camVel = [0,0,0];
var fSk = 500.0;
var fDk = 2.0 * Math.sqrt(fSk);

// Driving dynamic coefficients
var sAT = 0.5;
var mAT = 5.0;
var ATur = 3.0;
var ATdr = 5.5;
var sBT = 1.0;
var mBT = 3.0;
var BTur = 5.0;
var BTdr = 5.5;
var Tfric = Math.log(0.05);
var sAS = 0.1;	// Not used yet
var mAS = 108.0;
var ASur = 1.0;	// Not used yet
var ASdr = 0.5;	// Not used yet

var droneLinAccz = 0.0;
var droneLinVelz = 0.0;
var droneLinAccy = 0.0;
var droneLinVely = 0.0;
var droneLinAccx = 0.0;
var droneLinVelx = 0.0;
var preVz = 0;
var preVy = 0;
var preVx = 0;
var droneAngVel = 0.0;
*/


function calculateAcc(v,preV,droneLinAcc,deltaT){
	v = -v;
	// = 0.8 * deltaT * 60 * v;
	if(v > 0.1) {
		if(preV > 0.1) {
		droneLinAcc = droneLinAcc + ATur * deltaT;
		if(droneLinAcc > mAT) droneLinAcc = mAT;
		} else if(droneLinAcc < sAT) droneLinAcc = sAT;
	} else if(v > -0.1) {
		droneLinAcc = droneLinAcc - ATdr * deltaT * Math.sign(droneLinAcc);
		if(Math.abs(droneLinAcc) < 0.001) droneLinAcc = 0.0;
	} else { 
		if(preV < 0.1) {
		droneLinAcc = droneLinAcc - BTur * deltaT;
		if(droneLinAcc < -mBT) droneLinAcc = -mBT;
		} else if(droneLinAcc > -sBT) droneLinAcc = -sBT;
	}
	return droneLinAcc;
}


function draw(obj,textureOn){
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
	gl.vertexAttribPointer(program.vertexPositionAttribute, obj.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
	gl.vertexAttribPointer(program.vertexNormalAttribute, obj.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		if(textureOn){
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.textureBuffer);
		gl.vertexAttribPointer(program.textureCoordAttribute, obj.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	}
		
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);		

	if(textureOn){
		gl.uniform1i(program.textureUniform, 0);
	}
	gl.uniform4f(program.lightDir, gLightDir[0], gLightDir[1], gLightDir[2], 0.2);
	WVPmatrix = utils.multiplyMatrices(projectionMatrix, worldMatrix);
	gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));		
	gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.transposeMatrix(worldMatrix));
	gl.drawElements(gl.TRIANGLES, obj.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}


function drawScene() {
		// Compute time interval
		deltaT = computeDeltaT();
	
		//WORLD MATRIX
		
		//translation of (droneX,droneY,droneZ)
		var traslationDrone = utils.MakeTranslateMatrix(droneX,droneY,droneZ);
		//rotation of droneRotation around the y axis
		var rotationDrone = utils.MakeRotateYMatrix(droneAngle);
		//computing world matrix
		worldMatrix = utils.multiplyMatrices(traslationDrone,rotationDrone);
		
		//VIEW MATRIX
		
		//LookAt camera procedure:
		viewMatrix = utils.MakeLookAt([cx,cy,cz],[droneX,droneY,droneZ],[0,1,0]);
					
		//PERSPECTIVE MATRIX
		
		perspectiveMatrix = utils.MakePerspective(60, aspectRatio, 0.1, 100);
		
		//PROJECTION MATRIX	
		
		projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);

		//VELOCITIES & ACCELERATIONS UPDATE
		// x coordinate
		droneLinAccx = calculateAcc(vx, preVx, droneLinAccx, deltaT);
		preVx = -vx;
		droneLinVelx = droneLinVelx * Math.exp(Tfric * deltaT) - deltaT * droneLinAccx;
		// y coordinate
		droneLinAccy = calculateAcc(vy,preVy,droneLinAccy,deltaT);
		preVy = -vy;
		droneLinVely = droneLinVely * Math.exp(Tfric * deltaT) - deltaT * droneLinAccy;
		// z coordinate
		droneLinAccz = calculateAcc(vz,preVz,droneLinAccz,deltaT);
		preVz = -vz;
		droneLinVelz = droneLinVelz * Math.exp(Tfric * deltaT) - deltaT * droneLinAccz;
		// y angle
		droneAngVel = mAS * deltaT * rvy;
		
		// POSITION UPDATE
		delta = utils.multiplyMatrixVector(worldMatrix, [droneLinVelx, droneLinVely, droneLinVelz, 0.0]);
		droneX -= delta[0];
		droneY -= delta[1];
		droneZ -= delta[2];
		
		// ROTATION UPDATE
		xaxis = [worldMatrix[0],worldMatrix[4],worldMatrix[8]];
		yaxis = [worldMatrix[1],worldMatrix[5],worldMatrix[9]];
		zaxis = [worldMatrix[2],worldMatrix[6],worldMatrix[10]];
		
		if(rvy != 0) {
			qy = Quaternion.fromAxisAngle(yaxis, utils.degToRad(droneAngVel));
			newDvecmat = utils.multiplyMatrices(qy.toMatrix4(), worldMatrix);
			R11=newDvecmat[10];R12=newDvecmat[8];R13=newDvecmat[9];
			R21=newDvecmat[2]; R22=newDvecmat[0];R23=newDvecmat[1];
			R31=newDvecmat[6]; R32=newDvecmat[4];R33=newDvecmat[5];
			
			if((R31<1)&&(R31>-1)) {
				theta = -Math.asin(R31);
				phi = Math.atan2(R32/Math.cos(theta), R33/Math.cos(theta));
				psi = Math.atan2(R21/Math.cos(theta), R11/Math.cos(theta));
				
			} else {
				phi = 0;
				if(R31<=-1) {
					theta = Math.PI / 2;
					psi = phi + Math.atan2(R12, R13);
				} else {
					theta = -Math.PI / 2;
					psi = Math.atan2(-R12, -R13) - phi;
				}
			}
			//elevation = theta/Math.PI*180;
			//roll      = phi/Math.PI*180;
			//angle     = psi/Math.PI*180;
			droneAngle  = psi/Math.PI*180;
		}
		
		// CAMERA UPDATE
		
		// target coordinates
		nC = utils.multiplyMatrixVector(worldMatrix, [0, 5, -10, 1]);
		// distance from target			
		deltaCam = [cx - nC[0], cy - nC[1], cz - nC[2]];
		// acceleration of the camera
		camAcc = [-fSk * deltaCam[0] - fDk * camVel[0], -fSk * deltaCam[1] - fDk * camVel[1], -fSk * deltaCam[2] - fDk * camVel[2]];
		// velocity of the camera
		camVel = [camVel[0] + camAcc[0] * deltaT, camVel[1] + camAcc[1] * deltaT, camVel[2] + camAcc[2] * deltaT];
		cx += camVel[0] * deltaT;
		cy += camVel[1] * deltaT;
		cz += camVel[2] * deltaT;

		gl.useProgram(program);	

		//DRAW OBJECTS
		draw(droneMesh,false);
		draw(itBoxMesh,false);
		worldMatrix=utils.multiplyMatrices(utils.multiplyMatrices(utils.MakeRotateXMatrix(270),[1,0,0,0,0,1,0,-200,0,0,1,0,0,0,0,1]),utils.MakeScaleMatrix(20));
		draw(terrainMesh,false);
		
		//gl.useProgram(program1);
		// 	draw(terrainMesh,true);
		
		window.requestAnimationFrame(drawScene);		
}

//----------------------------------------TEXTURE FUNCTIONS-----------------------------------------
var textureLoaderCallback = function() {
	var textureId = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0 + this.txNum);
	gl.bindTexture(gl.TEXTURE_2D, textureId);		
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);		
// set the filtering so we don't need mips
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
}

//----------------------------------------GL FUNCTIONS-----------------------------------------------

function compileAndLink(program,vs,fs){
	program = gl.createProgram();
	var v1 = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(v1, vs);
	gl.compileShader(v1);
	if (!gl.getShaderParameter(v1, gl.COMPILE_STATUS)) {
		alert("ERROR IN VS SHADER : " + gl.getShaderInfoLog(v1));
	}
	var v2 = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(v2, fs)
	gl.compileShader(v2);		
	if (!gl.getShaderParameter(v2, gl.COMPILE_STATUS)) {
		alert("ERROR IN FS SHADER : " + gl.getShaderInfoLog(v2));
	}			
	gl.attachShader(program, v1);
	gl.attachShader(program, v2);
	gl.linkProgram(program);
	return program;
}

function linkMeshAttr(program,textureOn){
	program.vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
	gl.enableVertexAttribArray(program.vertexPositionAttribute);
		
	program.vertexNormalAttribute = gl.getAttribLocation(program, "in_norm");
	gl.enableVertexAttribArray(program.vertexNormalAttribute);
		
	if(textureOn){
		program.textureCoordAttribute = gl.getAttribLocation(program, "in_uv");
		gl.enableVertexAttribArray(program.textureCoordAttribute);
	}

	program.WVPmatrixUniform = gl.getUniformLocation(program, "pMatrix");
	program.NmatrixUniform = gl.getUniformLocation(program, "nMatrix");
	if(textureOn){
		program.textureUniform = gl.getUniformLocation(program, "u_texture");
	}
	program.lightDir = gl.getUniformLocation(program, "lightDir");
	if(textureOn){
		program.ambFact = gl.getUniformLocation(program, "ambFact");
	}
	return program;
}


function initializeWebGL() {
	try {
		gl = canvas.getContext("webgl2");
	} catch(e) {
		console.log(e);
	}
		
	if(gl) {
		// Compiling and linking shaders without texture
		program = compileAndLink(program,vs,fs);				
	
		// Compiling and linking shaders with texture
		//program1=compileAndLink(program1,vs1,fs1);		
		
		gl.useProgram(program);

		// Load mesh using the webgl-obj-loader libraryvar

		droneMesh = new OBJ.Mesh(droneObjStr);
		itBoxMesh = new OBJ.Mesh(itBoxObjStr);
		terrainMesh = new OBJ.Mesh(terrainObjStr);
		//skybox = new OBJ.Mesh(trackNfieldObjStr);
		OBJ.initMeshBuffers(gl, droneMesh);
		OBJ.initMeshBuffers(gl, itBoxMesh);
		OBJ.initMeshBuffers(gl, terrainMesh);
		
		// Create the textures
		
		/*imgtx = new Image();
		imgtx.txNum = 0;
		imgtx.onload = textureLoaderCallback;
		imgtx.src = droneTextureData;

		skyboxLattx = new Image();
		skyboxLattx.txNum = 1;
		skyboxLattx.onload = textureLoaderCallback;
		skyboxLattx.src = TrackTextureData;*/

		/*skyboxTbtx = new Image();
		skyboxTbtx.txNum = 2;
		skyboxTbtx.onload = textureLoaderCallback;
		skyboxTbtx.src = FieldTextureData;*/
		
		// Link mesh attributes to shader attributes and enable them
		program = linkMeshAttr(program,false);
		
		// Link mesh attributes to shader attributes and enable them (with texture)
		//program1 = linkMeshAttr(program1,true);
		
		// Init world view and projection matrices
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.viewport(0.0, 0.0, canvas.clientWidth, canvas.clientHeight);
		aspectRatio = canvas.clientWidth/canvas.clientHeight;
		
		// Turn on depth testing
			gl.enable(gl.DEPTH_TEST);

		// Environment initialization
		gLightDir = [-1.0, 0.0, 0.0, 0.0];
		skyboxWM = utils.multiplyMatrices(utils.MakeRotateZMatrix(30), utils.MakeRotateYMatrix(135));
		gLightDir = utils.multiplyMatrixVector(skyboxWM, gLightDir);
	} else {
		alert("Error: WebGL not supported by your browser!");
	}
}

//----------------------------------------MAIN FUNCTION-----------------------------------------

// The real app starts here
async function main(){
	setupCanvas();
	// If assets are not ready, the game cannot start.
	await loadAssets();
	initializeWebGL();
	drawScene();
}