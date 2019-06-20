class Terrain {
    mesh = null;
     worldMatrix = utils.multiplyMatrices(
		utils.multiplyMatrices(
			utils.MakeRotateXMatrix(270),
			utils.MakeTranslateMatrix(0,-200,0)
			),
		utils.MakeScaleMatrix(20)
    );
    
    /**
     * Constructor of Terrain class.
     * @param {*} obj 
     */
    constructor(obj) {
        this.mesh = obj.mesh;
    }

    update() {
       // do nothing 
    }
}