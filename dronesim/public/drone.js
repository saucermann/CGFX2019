class Drone {

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
    sAT = 0.5;
    mAT = 5.0;
    aTur = 3.0;
    aTdr = 5.5;
    sBT = 1.0;
    mBT = 3.0;
    bTur = 5.0;
    bTdr = 5.5;
    tFriction = Math.log(0.05);
    //sAS = 0.1;
    mAS = 108.0;
    //ASur = 1.0;
    //ASdr = 0.5;

    worldMatrix = [];
    mesh = null;

    /**
     * Constructor of class Drone
     * @param {*} obj
     */
    constructor(obj) {
        this.pos = obj.pos ? obj.pos : [0, 10, 0];
        this.mesh = obj.mesh ? obj.mesh : null;
    }

    updateVel(component, amount) {
        this.vel[component] += amount;
    }

    updateRotVel(amount) {
        this.rvy += amount;
    }

    /**
     * Calculates the acceleration of tje given coordinate
     * @param {*} v
     * @param {*} preV
     * @param {*} droneLinAcc
     * @param {*} deltaT
     */
    __calculateAcc(v, preV, droneLinAcc, deltaT) {
        v = -v;
        if(v > 0.1) {
            if(preV > 0.1) {
                droneLinAcc = droneLinAcc + this.aTur * deltaT;
            if(droneLinAcc > this.mAT)
                droneLinAcc = this.mAT;
            } else if(droneLinAcc < this.sAT)
                droneLinAcc = this.sAT;
        } else if(v > -0.1) {
            droneLinAcc = droneLinAcc - this.aTdr * deltaT * Math.sign(droneLinAcc);
            if(Math.abs(droneLinAcc) < 0.001)
                droneLinAcc = 0.0;
        } else {
            if(preV < 0.1) {
                droneLinAcc = droneLinAcc - this.bTur * deltaT;
            if(droneLinAcc < -this.mBT)
                droneLinAcc = -this.mBT;
            } else if(droneLinAcc > -this.sBT)
                droneLinAcc = -this.sBT;
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

		let traslationMatrix = utils.MakeTranslateMatrix(this.pos[0],this.pos[1],this.pos[2]);
		//rotation of droneRotation around the y axis
        let rotationMatrix = utils.MakeRotateYMatrix(this.angle);
        this.worldMatrix = utils.multiplyMatrices(traslationMatrix, rotationMatrix);

        // 3 is hardcoded since velocity, position, acceleration are expressed by 3 coordinates
        // for each coordinate update its value
        for(var i=0; i<3; i++) {
            this.linAcc[i] = this.__calculateAcc(this.vel[i], this.prevVel[i], this.linAcc[i], deltaT);
            this.prevVel[i] = -this.vel[i];
            this.linVel[i] = this.linVel[i] * Math.exp(this.tFriction * deltaT) - deltaT * this.linAcc[i];
        }

		this.angVel = this.mAS * deltaT * this.rvy;
    chunkMng.checkCollision(itBoxMesh,worldMatrix);
        // POSITION UPDATE
        var delta = utils.multiplyMatrixVector(
            this.worldMatrix,
            [this.linVel[0], this.linVel[1], this.linVel[2], 0.0]
        );

        for(let i=0; i<this.pos.length; i++) {
            this.pos[i] -= delta[i];
        }


		// ROTATION UPDATE
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
			this.angle  = psi/Math.PI*180;
        }
    }
}
