class SkyBox extends WorldObject {
    parent = null;
    worldMatrix = utils.MakeScaleMatrix(160);

    /**
     * Constructor of SkyBox class.
     * @param {*} obj
     */
    constructor(obj) {
        super(obj);
        this.parent = obj.parent ? obj.parent : null;
    }

    update() {
      this.worldMatrix = utils.applyTransform([
        utils.MakeTranslateMatrix(this.parent.pos[X],this.parent.pos[Y],this.parent.pos[Z])
        ,utils.MakeScaleMatrix(160)]);

    }
}
