const FAR = 160;

class SkyBox extends WorldObject {

    
    /**
     * Constructor of SkyBox class.
     * @param {*} obj
     */
    update() {
        this.worldMatrix = utils.applyTransform([
            utils.MakeTranslateMatrix(this.parent.pos[X],this.parent.pos[Y],this.parent.pos[Z]),
            utils.MakeScaleMatrix(FAR)
        ]);
    }
}
