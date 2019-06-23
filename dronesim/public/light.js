class Light {
    color = [];

    constructor(obj) {
        if (this.constructor === Light) {
            throw new TypeError('Abstract class "Light" cannot be instantiated directly.'); 
        }
        this.color = obj.color ? obj.color : null;
    }
}

class DirectionalLight extends Light {
    direction = null;

    constructor(obj) {
        super(obj);
        this.direction = obj.direction ? obj.direction : null;
    }
}

class PointLight extends Light {
    pos = null;
    target = null;
    decay = null;

    constructor(obj) {
        super(obj);
        this.pos = obj.pos ? obj.pos : null;
        this.decay = obj.decay ? obj.decay : null;
        this.target = obj.target ? obj.target : null;        
    }
}

class AmbientLight extends Light {}