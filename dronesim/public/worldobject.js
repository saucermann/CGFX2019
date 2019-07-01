class WorldObject {

    // CAREFUL NED, CAREFUL NOW!
    // The "update" function in each class breaks the initialization,
    // because does not calculate the world matrix for each frame
    // taking into account the previous one.
    // Therefore, just set "staticPos", "staticRotation", "staticScale"
    // when you're sure that the object won't move
    // (This is obviously a momentary solution)
    staticPos = null;
    staticRotation = null;
    staticScale = null;

    // Material properties
    diffuseColor = null;
  	emitColor = null;
  	ambientColor = null;
  	hasTexture = null;
  	specularColor = null;
  	specularShine = null;
  	texFactor = null;

    mesh = null;
    texture = null;
    worldMatrix = [];
    worldNotScale = null;
    parent = null;

    // children = [];
    // the intention was to call, for each update, the "onUpdate" function
    // of the class and do the same for each child WorldObject
    // (Thanks Unity!)

    /**
     * Constructor of the WorldObject class. It provides default material parameters,
     * mesh loading, texture, children and world matrix.
     * It must be used for static objects.
     * @param {*} obj
     * - diffuseColor : Array(4)
     * - emitColor : Array(4)
     * - ambientColor : Array(4)
     * - texture : Texture
     * - hasTexture : boolean
     * - specularColor : Array(4)
     * - specularShine : float
     * - texFactor: float in range(0,1)
     *
     */
    constructor(obj) {
        console.log(obj);
        this.diffuseColor = obj.diffuseColor ? obj.diffuseColor : [1.0, 1.0, 1.0, 1.0];
        this.emitColor = obj.emitColor ? obj.emitColor : [0.03, 0.03, 0.03, 1.0];
        this.ambientColor = obj.ambientColor ? obj.ambientColor : [0.3, 0.3, 0.3, 1.0];
        this.texture = obj.texture;
        this.hasTexture = obj.texture ? true : false;
        this.specularColor = obj.specularColor ? obj.specularColor : [0.0, 0.0, 0.0, 0.0];
        this.specularShine = obj.specularShine != null ? obj.specularShine : 10.0;
        this.texFactor = obj.texFactor ? obj.texFactor : 1.0;
        this.staticPos = obj.pos ? obj.pos : [0.0, 0.0, 0.0];
        this.staticRotation = obj.rotation ? obj.rotation : [0.0, 0.0, 0.0];
        this.staticScale = obj.scale != null ? obj.scale : 1;
        this.parent = obj.parent;


        this.mesh = obj.mesh;
        if(this.mesh) {
            OBJ.initMeshBuffers(gl, this.mesh);
        }

        // make sure to read the comments above
        this.worldMatrix = utils.applyTransform([
            utils.MakeTranslateMatrix(...this.staticPos),
            utils.MakeRotateYMatrix(this.staticRotation[1]),
            utils.MakeRotateXMatrix(this.staticRotation[0]),
            utils.MakeRotateZMatrix(this.staticRotation[2]),
            utils.MakeScaleMatrix(this.staticScale)
        ]);
        this.worldNotScale = obj.worldNotScale ? utils.applyTransform([
            utils.MakeTranslateMatrix(...this.staticPos),
            utils.MakeRotateYMatrix(this.staticRotation[1]),
            utils.MakeRotateXMatrix(this.staticRotation[0]),
            utils.MakeRotateZMatrix(this.staticRotation[2])
        ]) : null;
    }

    update() {
        // do nothing
    }

}
