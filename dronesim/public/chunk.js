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

  addInternals(vertices){
    var i;
    for(i=0; i<vertices.length; i++){
      if(vertices[i][0]>=this.bounds[0][0] & vertices[i][0]<this.bounds[1][0] & vertices[i][2]>=this.bounds[0][1] & vertices[i][2]<this.bounds[2][1]){
        this.internals[this.internals.length] = vertices[i];
      }
    }
  }

}
