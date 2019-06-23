class WorldObject {

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
    children = [];

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
        this.emitColor = obj.emitColor ? obj.emitColor : [0.0, 0.0, 0.0, 1.0]
        this.ambientColor = obj.ambientColor ? obj.ambientColor : [0.0, 0.0, 0.0, 1.0]
        this.texture = obj.texture;
        this.hasTexture = obj.hasTexture != null ? obj.hasTexture : true;
        this.specularColor = obj.specularColor ? obj.specularColor : [0.0, 0.0, 0.0, 0.0];
        this.specularShine = obj.specularShine ? obj.specularShine : 0.8;
        this.texFactor = obj.texFactor ? obj.texFactor : 1.0;
        this.mesh = obj.mesh;
        if(this.mesh) {
            OBJ.initMeshBuffers(gl, this.mesh);
        }
    }

    update() {
        // do nothing
    }

}