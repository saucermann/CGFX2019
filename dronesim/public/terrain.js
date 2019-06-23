class Terrain extends WorldObject {

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
        super(obj);
    }
}
