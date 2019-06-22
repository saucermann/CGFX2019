// Canvas
var canvas;

// GL variables
var gl = null,
	program = null;

var chunkMng;

// Drawing environment variables
var	skybox = null,
	skyboxLattx = null,
	skyboxTbtx = null;

var aspectRatio;
var lookRadius = 10.0;

// Light variables
var gLightDir;

// ASSETS

// Vertex shader
var vs;
// Fragment shader
var fs;
var droneObj;
var terrainObj;
var hitBoxObj;

//Time variables
var lastUpdateTime;
var deltaT;
var keys = [];

var gameObjects = [];
var drone;
var camera;

/**
 * Loads all game assets
 */
async function loadAssets() {
	console.log("Loading assets...");
	await Promise.all([
		utils.load('./static/shaders/vertex.glsl').then(text => vs = text),
		utils.load('./static/shaders/fragment.glsl').then(text => fs = text),
		utils.load('./static/assets/objects/Hely1.obj').then( text => droneObj = text),
		utils.load('./static/assets/objects/terrain.obj').then( text => terrainObj = text),
		utils.load('./static/assets/objects/box.obj').then( text => hitBoxObj = text)
	]);
	console.log("Done.")
}


/**
 * Sets up canvas and attaches listeners for controls and resize
 */
function setupCanvas() {
// setup everything else
	console.log("Setting up canvas...")
	canvas = document.getElementById("drone-sim-canvas");
	window.addEventListener("keyup", keyFunctionUp, false);
	window.addEventListener("keydown", keyFunctionDown, false);
	window.onresize = doResize;
	canvas.width  = window.innerWidth-16;
	canvas.height = window.innerHeight-200;
	console.log("Done.")
}

/**
 * Resizes canvas height and width on window resize.
 */
function doResize() {
    var canvas = document.getElementById("drone-sim-canvas");
    if((window.innerWidth > 40) && (window.innerHeight > 240)) {
        console.log("Canvas size changed.");
        canvas.width  = window.innerWidth-16;
        canvas.height = window.innerHeight-200;
        var w=canvas.clientWidth;
        var h=canvas.clientHeight;

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.viewport(0.0, 0.0, w, h);

        aspectRatio = w/h;
    }
}

/**
 * Computes delta time
 */
function computeDeltaT(){

	// compute time interval
	var currentTime = (new Date).getTime();
	if(lastUpdateTime) {
		deltaT = (currentTime - lastUpdateTime) / 1000.0;
	} else {
		deltaT = 1/50;
	}
	lastUpdateTime = currentTime;
	return deltaT;
}


/**
 * Draws an object as seen on the camera. If textureOn, it draws the object with its texture.
 * @param {Array} obj
 */
function draw(obj) {
	// WARNING: UNIFORMS SHOULD BE MOVED OUT OF THIS FUNCTION!
	// Also: buffers have already been enabled in linkMeshAttr...
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.vertexBuffer);
	gl.vertexAttribPointer(
		program.vertexPositionAttribute, obj.mesh.vertexBuffer.itemSize, 
		gl.FLOAT, false, 0, 0
	);
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.normalBuffer);
	gl.vertexAttribPointer(
		program.vertexNormalAttribute, obj.mesh.normalBuffer.itemSize, 
		gl.FLOAT, false, 0, 0
	);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.mesh.indexBuffer);

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.textureBuffer);
	gl.vertexAttribPointer(
		program.textureCoordAttribute, obj.mesh.textureBuffer.itemSize, 
		gl.FLOAT, false, 0, 0
	);
	gl.uniform1i(program.textureUniform, obj.texture.id);


	gl.uniform4f(program.lightDir, gLightDir[0], gLightDir[1], gLightDir[2], 0.2);
	WVPmatrix = utils.multiplyMatrices(camera.projectionMatrix, obj.worldMatrix);
	gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
	gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.transposeMatrix(obj.worldMatrix));
	gl.uniform1f(program.ambFact, 0.1);
	
	gl.drawElements(gl.TRIANGLES, obj.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}


/**
 * Draws each animation frame, updates positions and delta time
 * @param {*} camera
 * @param {*} objects
 */
function drawScene() {
	// Compute time interval
	deltaT = computeDeltaT();
	//computing world matrix
	gameObjects.forEach( v => v.update() );
	camera.update();
	gameObjects.forEach( v => draw(v));
	window.requestAnimationFrame(drawScene);
}


/**
 * Compiles and links the shaders to the program
 * @param {*} program 
 * @param {*} vs 
 * @param {*} fs 
 */
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


/**
 * Extracts and assigns to global program all the shader variables.
 * @param {*} program 
 */
function linkMeshAttr(program){
	// Enable and assign to program buffers for vertex position, normals and UV 
	// coordinates of texture
	program.vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
	gl.enableVertexAttribArray(program.vertexPositionAttribute);
	program.vertexNormalAttribute = gl.getAttribLocation(program, "in_norm");
	gl.enableVertexAttribArray(program.vertexNormalAttribute);
	program.textureCoordAttribute = gl.getAttribLocation(program, "in_uv");
	gl.enableVertexAttribArray(program.textureCoordAttribute);

	// Associate uniforms to program
	program.WVPmatrixUniform = gl.getUniformLocation(program, "pMatrix");
	program.NmatrixUniform = gl.getUniformLocation(program, "nMatrix");
	program.textureUniform = gl.getUniformLocation(program, "u_texture");
	program.lightDir = gl.getUniformLocation(program, "lightDir");
	program.ambFact = gl.getUniformLocation(program, "ambFact");
	return program;
}

/**
 * Checks collisions of the drone with each object in the array
 * @param {Array} objects 
 */
function prepareChunks(objects) {
	chunkMng = new ChunkManager(objects.map(v => v.mesh), objects.map(v => v.worldMatrix), NUMOFCHUNKS);
}


/**
 * Initializes global gl program, compiles global fragment and vertex shaders,
 * sets the viewport to the canvas dimensions and enables depth testing.
 */
function initializeWebGL() {
	try {
		gl = canvas.getContext("webgl2");
	} catch(e) {
		console.log(e);
	}

	if(gl) {
		program = compileAndLink(program,vs,fs);
		gl.useProgram(program);

		// Link mesh attributes to shader attributes and enable them
		program = linkMeshAttr(program,false);

		// Init world view and projection matrices
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.viewport(0.0, 0.0, canvas.clientWidth, canvas.clientHeight);
		aspectRatio = canvas.clientWidth/canvas.clientHeight;

		// Turn on depth testing
		gl.enable(gl.DEPTH_TEST);
	} else {
		alert("Error: WebGL not supported by your browser!");
	}
}

//----------------------------------------MAIN FUNCTION-----------------------------------------
async function main(){
	setupCanvas();
	// If assets are not ready, the game cannot start.
	await loadAssets();
	initializeWebGL();

	drone = new Drone({
		'pos': [0, 20, 0],
		'mesh': new OBJ.Mesh(droneObj),
		'texture': new Texture('static/assets/textures/drone.png')
	});

	var terrain = new Terrain({
		'mesh': new OBJ.Mesh(terrainObj),
		'texture': new Texture('static/assets/textures/park.jpg')
	});

	camera = new Camera({
		'target': drone,
		'targetDistance': [0, 0.5, -3, 1],
		'farPlane': 300
	});

	gameObjects.push(drone, terrain);
	prepareChunks([terrain]);
	// Environment initialization
	gLightDir = [-1.0, 0.0, 0.0, 0.0];
	skyboxWM = utils.multiplyMatrices(utils.MakeRotateZMatrix(30), utils.MakeRotateYMatrix(135));
	gLightDir = utils.multiplyMatrixVector(skyboxWM, gLightDir);

	drawScene();
}
