class Chunk{
  idChunk;
  bounds = [];
  internals = [];

  constructor(id, bounds){
    this.idChunk=id;
    var i;
    for(i=0; i<4; i++){
      this.bounds[i]=bounds[i];
    }
  }

  belongChunk(v){
    return v[X]>=this.bounds[0][0] & v[X]<this.bounds[1][0] & v[Z]>=this.bounds[0][1] & v[Z]<this.bounds[2][1];
  }

  addInternals(vertices){
    var i;
    for(i=0; i<vertices.length; i++){
      if(this.belongChunk(vertices[i])){
        this.internals[this.internals.length] = vertices[i];
      }
    }
  }

}
