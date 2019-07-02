class WorldObject {

    pos = null;
    rotation = null;
    scale = null;

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
    toBeDrawn =true;

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
        this.emitColor = obj.emitColor ? obj.emitColor : [0.0, 0.0, 0.0, 1.0];
        this.ambientColor = obj.ambientColor ? obj.ambientColor : [0.3, 0.3, 0.3, 1.0];
        this.texture = obj.texture;
        this.hasTexture = obj.texture ? true : false;
        this.specularColor = obj.specularColor ? obj.specularColor : [0.0, 0.0, 0.0, 0.0];
        this.specularShine = obj.specularShine != null ? obj.specularShine : 10.0;
        this.texFactor = obj.texFactor ? obj.texFactor : 1.0;
        this.pos = obj.pos ? obj.pos : [0.0, 0.0, 0.0];
        this.rotation = obj.rotation ? obj.rotation : [0.0, 0.0, 0.0];
        this.scale = obj.scale != null ? obj.scale : 1;
        this.parent = obj.parent;
        this.mesh = obj.mesh;
        if(this.mesh) {
            OBJ.initMeshBuffers(gl, this.mesh);
        }

        // make sure to read the comments above
        this.worldMatrix = utils.applyTransform([
            utils.MakeTranslateMatrix(...this.pos),
            utils.MakeRotateYMatrix(this.rotation[1]),
            utils.MakeRotateXMatrix(this.rotation[0]),
            utils.MakeRotateZMatrix(this.rotation[2]),
            //utils.MakeScaleMatrix(this.scale)
        ]);
    }

    update() {
        // do nothing
    }

}
