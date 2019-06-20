const NUMOFCHUNKS = 30;

class ChunkManager{
  verticesArray = [];
  minVert;
  maxVert;
  lengthMap;
  widthMap;
  numOfChunks;
  numCPerRow;
  lengthChunk;
  widthChunk;
  chunks = [];

  constructor(staticObjects,worldMatrices,numOfChunks){
    var objInd, vertInd, chunkInd,
        tmpVert = [],
        vertNum;
    for(objInd=0; objInd<staticObjects.length; objInd++){
      vertNum = staticObjects[objInd].vertices.length/3;
      for( vertInd=0; vertInd<vertNum; vertInd++ ){
        tmpVert = [staticObjects[objInd].vertices[vertInd*3],staticObjects[objInd].vertices[vertInd*3+1],staticObjects[objInd].vertices[vertInd*3+2],1];
        tmpVert = utils.multiplyMatrixVector(worldMatrices[objInd],tmpVert);
        this.verticesArray[this.verticesArray.length] = tmpVert;
      }

    }
    this.verticesArray.sort(this.compareVertecesXZ);
    this.numOfChunks = numOfChunks;
    this.setLengthWidth();
    for(chunkInd=0; chunkInd<this.numCPerRow*this.numCPerRow; chunkInd++){
      this.addChunk(chunkInd);
    }
  }

  compareVertecesXZ(a, b) {
    if (a[0]<b[0]) {
      return -1;
    }else if(a[0]>b[0]){
      return 1;
    }else if(a[2]<b[2]){
      return -1;
    }else if(a[2]>b[2]){
      return 1;
    }else{
      return 0;
    }
  }

  setLengthWidth(){
    this.minVert = this.verticesArray[0];
    this.maxVert = this.verticesArray[this.verticesArray.length-1];
    this.lengthMap = this.verticesArray[this.verticesArray.length-1][0] -  this.verticesArray[0][0];
    this.widthMap = this.verticesArray[this.verticesArray.length-1][2] -  this.verticesArray[0][2];
    this.numCPerRow = Math.ceil(Math.sqrt(this.numOfChunks));
    this.lengthChunk = this.lengthMap / this.numCPerRow;
    this.widthChunk = this.widthMap / this.numCPerRow;
  }

  addChunk(ind){
    var row = Math.floor(ind / this.numCPerRow);
    var col = ind % this.numCPerRow;
    var bounds =[];
    bounds[0] = [this.minVert[0] + row*this.lengthChunk, this.minVert[2] + col*this.widthChunk];
    bounds[1] = [this.minVert[0] + (row+1)*this.lengthChunk, this.minVert[2] + col*this.widthChunk];
    bounds[2] = [this.minVert[0] + row*this.lengthChunk, this.minVert[2] + (col+1)*this.widthChunk];
    bounds[3] = [this.minVert[0] + (row+1)*this.lengthChunk, this.minVert[2] + (col+1)*this.widthChunk];
    this.chunks[ind] = new Chunk(ind,bounds);
    this.chunks[ind].addInternals(this.verticesArray);
  }
  checkCollision(itbox,worldMatrix){
    //var boxVert = utils.multiplyMatrixVector(worldMatrix,itbox.verticesArray);

  }

}
