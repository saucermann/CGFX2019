class Terrain {
    mesh = null;
    texture = null;

    worldMatrix = utils.applyTransform([
        utils.MakeTranslateMatrix(-200, -80, 600),
        utils.MakeRotateXMatrix(270),
        utils.MakeScaleMatrix(20),
        ]
    );

    /**
     * Constructor of Terrain class.
     * @param {*} obj 
     */
    constructor(obj) {
        this.mesh = obj.mesh;
        this.texture = obj.texture ? obj.texture : null
        if(this.mesh) {
            OBJ.initMeshBuffers(gl, this.mesh);
        }
    }

    update() {
       // do nothing 
    }
}