class Camera {
    pos = [];
    vel = [0, 0, 0];
    acc = [0, 0, 0];
    
    elevation = null;
    angle = null;
    roll = null;
    
    // let's not change these two since we don't know what they do
    fSk = 500.0; 
    fDk = 2.0 * Math.sqrt(this.fSk);
    
    fovY = 60;
    nearPlane = 0.1;
    farPlane = 100;

    delta = [];

    viewMatrix = [];
    perspectiveMatrix = [];
    projectionMatrix = [];
    
    target = null;
    targetDistance = [];
    
    /**
     * Constructor of class Camera. 
     * @param {*} obj
     * - fovY: Float
     * - nearPlane: Float
     * - farPlane: Float
     * - targetDistance: Array[4]
     * - target: object
     */
    constructor(obj) {
        //this.pos = obj.pos ? obj.pos : [4.5, 5.0, 10.0];
        
        //this.elevation = obj.elevation ? obj.elevation : 0.01;
        //this.angle = obj.angle ? obj.angle : 0.01;
        //this.roll = obj.roll ? obj.roll : 0.01;

        this.fovY = obj.fovY ? obj.fovY : 60;
        this.nearPlane = obj.nearPlane ? obj.nearPlane : 0.1;
        this.farPlane = obj.farPlane ? obj.farPlane : 100;
        
        this.targetDistance = obj.targetDistance ? obj.targetDistance : [0, 5, -10, 1];
        this.target = obj.target;
    }

    /**
     * Updates the camera position and its matrices (view, perspective, projection) using target position.
     */
    update() {

        // Camera Target position is the position of the camera relative to the target position.
        let cameraTargetPos = utils.multiplyMatrixVector(this.target.worldMatrix, this.targetDistance);
        
        // Since the camera is a "child" of the drone, its position is updated by applying the drone matrix to its
        // target distance and setting it as the new camera position
        this.pos = cameraTargetPos.splice(0,3);
        
		// View matrix constructed using Look At matrix
		this.viewMatrix = utils.MakeLookAt(this.pos, this.target.pos, [0,1,0]);
					
		// Perspective matrix is recalculated at each frame because the canvas aspect ratio can change during execution
		this.perspectiveMatrix = utils.MakePerspective(this.fovY, aspectRatio, this.nearPlane, this.farPlane);
		
		// The projection matrix can change too because of the view and the perspective
		this.projectionMatrix = utils.multiplyMatrices(this.perspectiveMatrix, this.viewMatrix);
    }
}