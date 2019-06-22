var TEXTURE_INCREMENT_ID = 0;

class Texture {
    /**
     * Constructor of class texture. The texture is loaded by the path
     * of its image. The path must be provided as a relative string starting
     * from "static" folder. 
     * ie. "static/assets/textures/foo.png"
     * @param {string} path 
     */
    constructor(path) {
        console.log("Making new texture from path "+path+" ...");
        // Create the texture using image and assign to it a rudimental
        // autoincrement id 
		this.data = new Image();
        this.id = TEXTURE_INCREMENT_ID;
        TEXTURE_INCREMENT_ID += 1;
        // the id is used to bind the texture to a texture unit of webgl
        // when loaded, send the texture to webgl
		this.data.onload = this.bindTextureUnit.bind(this);
		this.data.src = path;
    }

    bindTextureUnit() {
        console.log("Texture loaded.")
        var texture = gl.createTexture();
        console.log("Binding texture with id="+this.id);
        // the active texture cannot be assigned just by using id
        // it needs an offset provided by the constant TEXTURE0
        gl.activeTexture(gl.TEXTURE0 + this.id);
        //then, bind the actual texture data to the unit
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.data);
        // set the filtering so we don't need mipmaps
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        console.log("Done.")
    }
}