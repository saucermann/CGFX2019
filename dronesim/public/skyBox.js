class SkyBox {
    mesh = null;
    texture = null;
    parent = null;

    worldMatrix = utils.MakeScaleMatrix(160);

    /**
     * Constructor of Terrain class.
     * @param {*} obj
     */
    constructor(obj) {
        this.mesh = obj.mesh;
        this.texture = obj.texture ? obj.texture : null;
        this.parent = obj.parent ? obj.parent : null;
        if(this.mesh) {
            OBJ.initMeshBuffers(gl, this.mesh);
        }
    }

    update() {
      this.worldMatrix = utils.applyTransform([
        utils.MakeTranslateMatrix(this.parent.pos[X],this.parent.pos[Y],this.parent.pos[Z])
        ,utils.MakeScaleMatrix(160)]);

    }
}
