// Canvas
var canvas;

// GL variables
var gl = null,
	program = null;

var chunkMng;

// Drawing environment variables
var	skyBox = null,
	skyboxLattx = null,
	skyboxTbtx = null;

var aspectRatio;
var lookRadius = 10.0;

// ASSETS
// Vertex shader
var vs;
// Fragment shader
var fs;
var droneObj;
var terrainObj;
var skyBoxObj;
var cottageObj;

//Time variables
var lastUpdateTime;
var deltaT;
var keys = [];

var gameObjects = [];
var lights = {
	'direct': null,
	'point' : [],
	'ambient': null
};
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
		utils.load('./static/assets/objects/drone.obj').then( text => droneObj = text),
		utils.load('./static/assets/objects/terrain.obj').then( text => terrainObj = text),
		utils.load('./static/assets/objects/skyBox.obj').then( text => skyBoxObj = text),
		utils.load('./static/assets/objects/cottage_obj.obj').then( text => cottageObj = text),
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

function drawBasics(obj){
	// BINDING INPUT VARYINGS, VERTEX, NORMAL, TEXTURE UV, INDICES, TEXTURE ID
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

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.textureBuffer);
	gl.vertexAttribPointer(
		program.textureCoordAttribute, obj.mesh.textureBuffer.itemSize,
		gl.FLOAT, false, 0, 0
	);
	gl.uniform1i(program.textureUniform, obj.texture.id);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.mesh.indexBuffer);
}
/**
 * Draws an object as seen on the camera. If textureOn, it draws the object with its texture.
 * @param {Array} obj
 */
function drawObj(obj) {
	drawBasics(obj);

	// DO CALCULATIONS FOR OBJECT SPACE SHADERS
	let inverseWorldMatrix = utils.invertMatrix(obj.worldMatrix);
	let inverseWVMatrix = utils.invertMatrix(utils.multiplyMatrices(obj.worldMatrix, camera.viewMatrix));
	let WVPmatrix = utils.multiplyMatrices(camera.projectionMatrix, obj.worldMatrix);

	// GET ALL THE UNIFORMS
	// EYE Position
	let eyePos = utils.multiplyMatrixVector(inverseWVMatrix, camera.pos.concat(1));
	gl.uniform3f(program.eyePos, ...eyePos);

	// Lights and lights and lights
	let transformedLightDir = utils.normalizeVector3(
		utils.multiplyMatrix3Vector3(inverseWorldMatrix, lights.direct.direction)
	);

	gl.uniform3f(program.dirLightDirection, ...transformedLightDir);
	gl.uniform4f(program.dirLightColor, ...lights.direct.color);
	gl.uniform4f(program.ambientLightColor, ...lights.ambient.color);
	gl.uniform1i(program.pointLightsLength, lights.point.length);

	for(let i=0; i<lights.point.length; i++) {
		let lightPos = gl.getUniformLocation(program, "u_point_lights["+i+"].position");
		let transformedLightPos = utils.multiplyMatrixVector(inverseWorldMatrix, lights.point[i].pos.concat(1))
		gl.uniform3f(lightPos, ...transformedLightPos);
		let lightDecay = gl.getUniformLocation(program, "u_point_lights["+i+"].decay");
		gl.uniform1f(lightDecay, lights.point[i].decay);
		let lightColor = gl.getUniformLocation(program, "u_point_lights["+i+"].color");
		gl.uniform4f(lightColor, ...lights.point[i].color);
		let lightTarget = gl.getUniformLocation(program, "u_point_lights["+i+"].target");
		gl.uniform1f(lightTarget, lights.point[i].target);
	}

	gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
	// the following is not needed anymore since shaders are in obj space
	//gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.transposeMatrix(obj.worldMatrix));

	// object and material properties
	gl.uniform1f(program.texFactor, obj.texFactor);
	gl.uniform1i(program.hasTexture, obj.hasTexture);
	gl.uniform4f(program.diffuseColor, ...obj.diffuseColor);
	gl.uniform1f(program.specularShine, obj.specularShine);
	gl.uniform4f(program.specularColor, ...obj.specularColor);
	gl.uniform4f(program.emitColor, ...obj.emitColor);
	gl.uniform4f(program.ambientColor, ...obj.ambientColor);

	gl.drawElements(gl.TRIANGLES, obj.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawNotPhysical(obj) {
	drawBasics(obj);

	let WVPmatrix = utils.multiplyMatrices(camera.projectionMatrix, obj.worldMatrix);

	// Lights and lights and lights

	let inverseWorldMatrix = utils.invertMatrix(obj.worldMatrix);
	let transformedLightDir = utils.normalizeVector3(
		utils.multiplyMatrix3Vector3(inverseWorldMatrix, lights.direct.direction)
	);

	gl.uniform3f(program.dirLightDirection, ...transformedLightDir);
	gl.uniform4f(program.dirLightColor, ...lights.direct.color);

	gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
	// the following is not needed anymore since shaders are in obj space
	//gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.transposeMatrix(obj.worldMatrix));

	// object and material properties
	gl.uniform1f(program.texFactor, obj.texFactor);
	gl.uniform1i(program.hasTexture, obj.hasTexture);
	gl.uniform4f(program.diffuseColor, ...obj.diffuseColor);
	gl.uniform1f(program.specularShine, obj.specularShine);
	gl.uniform4f(program.specularColor, ...obj.specularColor);
	gl.uniform4f(program.emitColor, ...obj.emitColor);
	gl.uniform4f(program.ambientColor, ...obj.ambientColor);

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
	skyBox.update();
	camera.update();
	gameObjects.forEach( v => drawObj(v));
	drawNotPhysical(skyBox);
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
	//program.NmatrixUniform = gl.getUniformLocation(program, "nMatrix");

	// Texture
	program.textureUniform = gl.getUniformLocation(program, "u_texture");
	program.texFactor = gl.getUniformLocation(program, "u_tex_factor");
	program.hasTexture = gl.getUniformLocation(program, "u_has_texture");

	// Direct light
	program.dirLightDirection = gl.getUniformLocation(program, "u_dir_light.direction");
	program.dirLightColor = gl.getUniformLocation(program, "u_dir_light.color");

	// Point Lights
	program.pointLightsLength = gl.getUniformLocation(program, "u_pl_length");

	// Ambient Light
	program.ambientLightColor = gl.getUniformLocation(program, "u_amb_light");

	// Material
	program.diffuseColor = gl.getUniformLocation(program, "u_mat.diffuse");
	program.emitColor = gl.getUniformLocation(program, "u_mat.emit");
	program.ambientColor = gl.getUniformLocation(program, "u_mat.ambient")
	program.specularColor = gl.getUniformLocation(program, "u_mat.specular");
	program.specularShine = gl.getUniformLocation(program, "u_mat.shine");

	// Camera position
	program.eyePosition = gl.getUniformLocation(program, "u_eye_pos");


	return program;
}

/**
 * Checks collisions of the drone with each object in the array
 * @param {Array} objects
 */
function prepareChunks(objects) {
	chunkMng = new ChunkManager(
		objects.map(v => v.mesh),
		objects.map(v => v.worldMatrix),
		NUMOFCHUNKS
	);
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
		gl.enable(gl.CULL_FACE);
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
		'texture': new Texture('static/assets/textures/drone.png'),
		'collisionOn': true,
		'specularColor': [1.0, 1.0, 1.0, 1.0],
		'specularShine': 1.0,
	});

	var terrain = new WorldObject({
		'mesh': new OBJ.Mesh(terrainObj),
		'texture': new Texture('static/assets/textures/park.jpg'),
		'pos': [-200, -80, 600],
		'rotation': [270, 0, 0],
		'scale': 20
	});

	skyBox = new SkyBox({
		'mesh': new OBJ.Mesh(skyBoxObj),
		'texture': new Texture('static/assets/textures/sky.jpg'),
		'parent': drone
	});

	var cottage = new WorldObject({
		'mesh': new OBJ.Mesh(cottageObj),
		'pos': [0, -40, 0],
		'specularColor': [0.0, 0.0, 0.0, 1.0],
		'specularShine': 0.8,
		'texture': new Texture('static/assets/textures/cottage_diffuse.png'),
	});

	camera = new Camera({
		'target': drone,
		'targetDistance': [0, 0.5, -1.5, 1],
		'farPlane': 300
	});

	let direct = new DirectionalLight({
		'color': [1.0, 1.0, 1.0, 1.0],
		'direction' : [0.60, 0.35, 0.70, 0.0]
	});

	let pl1 = new PointLight({
		'pos': [0, 21, 0],
		'decay': 0.2,
		'target': 0.9,
		'color': [1, 1.0, 1.0, 1.0]
	});

	let ambient = new AmbientLight({
		'color': [0.0, 0.0, 0.0, 1.0]
	});

	gameObjects.push(drone, terrain, cottage);

	lights['direct'] = direct;
	lights['point'].push(pl1);
	lights['ambient'] = ambient;


	prepareChunks([terrain, cottage]);
	drawScene();
}
