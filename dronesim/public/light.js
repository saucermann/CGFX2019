class Light {
    color = [];
    on = true;

    constructor(obj) {
        if (this.constructor === Light) {
            throw new TypeError('Abstract class "Light" cannot be instantiated directly.');
        }
        this.color = obj.color ? obj.color : null;
        this.on = obj.on ? obj.on : true;
    }
}

class DirectionalLight extends Light {
    direction = null;

    constructor(obj) {
        super(obj);
        this.direction = obj.direction ? [obj.direction[X],obj.direction[Y],obj.direction[Z],1] : null;
    }

    setCoor(coor,value){
      var norm = [];
      for(let i=0; i<3; i++){
        norm[i] = this.direction[i];
      }
      norm[coor] = value;
      norm = utils.normalizeVector3(norm);
      this.direction = [norm[X],norm[Y],norm[Z],1];
    }
}

class PointLight extends Light {
    pos = null;
    target = null;
    decay = null;

    constructor(obj) {
        super(obj);
        this.pos = obj.pos ? obj.pos : null;
        this.decay = obj.decay != null ? obj.decay : 0.1;
        this.target = obj.target != null ? obj.target : 0.1;
        this.on = obj.on ? obj.on : true;
    }
    setCoor(coor,value){
      this.pos[coor] = value;
    }
}

class AmbientLight extends Light {}
