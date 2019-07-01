class Drone extends WorldObject {

    //Drone movement variables
    pos = null;
    vel = [0, 0, 0];
    prevVel = [0, 0, 0];
    linVel = [0, 0, 0];
    linAcc = [0, 0, 0];

    rvy = 0.0;			//Delta angle & position
    angle = 0;
    angVel = 0.0;	//Velocity for rotat

    // flying dynamic coefficients
    sAT = 2; //saturation
    mAT = 0.1; //minimum
    aTur = 5.0;
    aTdr = 5.5;
    sBT = 2;
    sBTBack = 0.9;
    mBT = 0.1;
    bTur = 5.0;
    bTdr = 5.5;
    tFriction = Math.log(0.05);
    //sAS = 0.1;
    mAS = 108.0;
    //ASur = 1.0;
    //ASdr = 0.5;

    worldMatrix = [];

    MinX = 0.0;
    MaxX = 0.0;
    MinY = 0.0;
    MaxY = 0.0;
    MinZ = 0.0;
    MaxZ = 0.0;
    hitBox = [];

    /**
     * Constructor of class Drone
     * @param {*} obj
     */
    constructor(obj) {
        super(obj);
        this.pos = obj.pos ? obj.pos : [0, 10, 0];
        this.worldMatrix = utils.MakeTranslateMatrix(...this.pos);
        this.collisionOn = obj.collisionOn;
        this.setHitBox();
    }

    updateVel(component, amount) {
        this.vel[component] += amount;
    }

    updateRotVel(amount) {
        this.rvy += amount;
    }

    setHitBox(){
      var vertInd,
          tmpVert = [],
          vertixArray = [[],[],[]],
          vertNum;
      vertNum = this.mesh.vertices.length/3;
      for(vertInd=0; vertInd<vertNum; vertInd++){
        tmpVert = [this.mesh.vertices[vertInd*3],this.mesh.vertices[vertInd*3+1],this.mesh.vertices[vertInd*3+2],1];
        vertixArray[X].push(tmpVert[X]);
        vertixArray[Y].push(tmpVert[Y]);
        vertixArray[Z].push(tmpVert[Z]);
      }
      this.MinX = Math.min(...vertixArray[X]);
      this.MaxX = Math.max(...vertixArray[X]);
      this.MinY = Math.min(...vertixArray[Y]);
      this.MaxY = Math.max(...vertixArray[Y]);
      this.MinZ = Math.min(...vertixArray[Z]);
      this.MaxZ = Math.max(...vertixArray[Z]);
      this.hitBox = [[this.MinX,this.MinY,this.MinZ,1],[this.MinX,this.MinY,this.MaxZ,1],
                     [this.MaxX,this.MinY,this.MinZ,1],[this.MaxX,this.MinY,this.MaxZ,1],
                     [this.MinX,this.MaxY,this.MinZ,1],[this.MinX,this.MaxY,this.MaxZ,1],
                     [this.MaxX,this.MaxY,this.MinZ,1],[this.MaxX,this.MaxY,this.MaxZ,1]];
    }

    getHitBoxUpToDate(futureWorldMatrix){
      return [utils.multiplyMatrixVector(futureWorldMatrix,this.hitBox[0]),
              utils.multiplyMatrixVector(futureWorldMatrix,this.hitBox[1]),
              utils.multiplyMatrixVector(futureWorldMatrix,this.hitBox[2]),
              utils.multiplyMatrixVector(futureWorldMatrix,this.hitBox[3]),
              utils.multiplyMatrixVector(futureWorldMatrix,this.hitBox[4]),
              utils.multiplyMatrixVector(futureWorldMatrix,this.hitBox[5]),
              utils.multiplyMatrixVector(futureWorldMatrix,this.hitBox[6]),
              utils.multiplyMatrixVector(futureWorldMatrix,this.hitBox[7])];
    }

    /**
     * Calculates the acceleration of tje given coordinate
     * @param {*} v
     * @param {*} preV
     * @param {*} droneLinAcc
     * @param {*} deltaT
     */
    __calculateAcc(v, preV, droneLinAcc, deltaT, coord) {
        v = -v;
        if(v > 0.1) {
            if(preV > 0.1) {
                droneLinAcc = droneLinAcc + this.aTur * deltaT;
                if(droneLinAcc > this.sAT)
                    droneLinAcc = this.sAT;
            } else if(droneLinAcc < this.mAT)
                droneLinAcc = this.mAT;
        } else if(v > -0.1) {
                droneLinAcc = 0.0;
        } else {
            if(preV < 0.1) {
                droneLinAcc = droneLinAcc - this.bTur * deltaT;
                if(coord==Z){
                  if(droneLinAcc < this.sBTBack){
                    droneLinAcc = -this.sBTBack;
                  }
                }else{
                  if(droneLinAcc < -this.sBT)
                      droneLinAcc = -this.sBT;
                }
            } else if(droneLinAcc > -this.mBT)
                droneLinAcc = -this.mBT;
        }
        return droneLinAcc;
    }

    /**
     * Updates drone position and world matrix
     */
    update() {
        // update world matrix
        //WORLD MATRIX
        //translation of (droneX,droneY,droneZ)
        let translationMatrix = utils.MakeTranslateMatrix(this.pos[X],this.pos[Y],this.pos[Z]);
            //rotation of droneRotation around the y axis
        let rotationMatrix = utils.MakeRotateYMatrix(this.angle);
        this.worldNotScale = utils.applyTransform([translationMatrix, rotationMatrix]);
        this.worldMatrix = utils.applyTransform([this.worldNotScale, utils.MakeScaleMatrix(this.staticScale)]);
        var newPos = [this.pos[X],this.pos[Y],this.pos[Z]];
        var newAngle = this.angle;
        // 3 is hardcoded since velocity, position, acceleration are expressed by 3 coordinates
        // for each coordinate update its value
        for(var i=0; i<3; i++) {
            this.linAcc[i] = this.__calculateAcc(this.vel[i], this.prevVel[i], this.linAcc[i], deltaT, i);
            this.prevVel[i] = -this.vel[i];
            this.linVel[i] = this.linVel[i] * Math.exp(this.tFriction * deltaT) - deltaT * this.linAcc[i];
        }

        // POSITION UPDATE
        var delta = utils.multiplyMatrixVector(
            this.worldMatrix,
            [this.linVel[0], this.linVel[1], this.linVel[2], 0.0]
        );


        for(let i=0; i<this.pos.length; i++) {
            newPos[i] -= delta[i];
        }

        // ROTATION UPDATE
        this.angVel = this.mAS * deltaT * this.rvy;
		let xaxis = [this.worldMatrix[0],this.worldMatrix[4],this.worldMatrix[8]];
		let yaxis = [this.worldMatrix[1],this.worldMatrix[5],this.worldMatrix[9]];
		let zaxis = [this.worldMatrix[2],this.worldMatrix[6],this.worldMatrix[10]];

		if(this.rvy != 0) {
			let qy = Quaternion.fromAxisAngle(yaxis, utils.degToRad(this.angVel));
            let newDvecmat = utils.multiplyMatrices(qy.toMatrix4(), this.worldMatrix);
            let phi, theta, psi;
            let R11, R12, R13, R21, R22, R23, R31, R32, R33;
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
			newAngle  = psi/Math.PI*180;
    }
    let futureTranslationMatrix = utils.MakeTranslateMatrix(newPos[0],newPos[1],newPos[2]);
		//rotation of droneRotation around the y axis
    let futureRotationMatrix = utils.MakeRotateYMatrix(newAngle);
    let futureWorldMatrix = utils.multiplyMatrices(futureTranslationMatrix, futureRotationMatrix);
    if(this.collisionOn && chunkMng.checkCollision(this,futureWorldMatrix)){
      for(var i=0; i<3; i++) {
          this.linAcc[i] = -this.linAcc[i]/3.5;
          this.prevVel[i] = this.vel[i]/3.5;
          this.linVel[i] = -this.linVel[i]/3.5;
      }

      this.angVel = -this.angVel
    }else{
      this.pos = [newPos[X],newPos[Y],newPos[Z]];
      this.angle = newAngle;
    }
  }
}

class Propeller extends WorldObject{
    angVel = null;

    constructor(obj) {
        super(obj);
        this.angVel = obj.angVel ? obj.angVel : 1;
    }

    update(obj) {
        this.worldMatrix = this.parent.worldMatrix;
    }
}
