const NUMOFCHUNKS = 4096;

class ChunkManager{
  verticesArray = [];
  minVert;
  maxVert;
  lengthMap;
  widthMap;
  realNumOfChunks;
  numCPerRow;
  lengthChunk;
  widthChunk;
  chunks = [];
  greenChunks = [];

  constructor(staticObjects,worldMatrices,desiredChunks){
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
    this.numCPerRow = Math.ceil(Math.sqrt(desiredChunks));
    this.realNumOfChunks = this.numCPerRow*this.numCPerRow;
    this.setLengthWidth();
    for(chunkInd=0; chunkInd<this.realNumOfChunks; chunkInd++){
      this.addChunk(chunkInd);
    }
  }

  compareVertecesXZ(a, b) {
    if (a[X]<b[X]) {
      return -1;
    }else if(a[X]>b[X]){
      return 1;
    }else if(a[Z]<b[Z]){
      return -1;
    }else if(a[Z]>b[Z]){
      return 1;
    }else{
      return 0;
    }
  }

  setLengthWidth(){
    this.minVert = this.verticesArray[0];
    this.maxVert = this.verticesArray[this.verticesArray.length-1];
    this.lengthMap = this.verticesArray[this.verticesArray.length-1][X] -  this.verticesArray[0][X];
    this.widthMap = this.verticesArray[this.verticesArray.length-1][Z] -  this.verticesArray[0][Z];
    this.lengthChunk = this.lengthMap / this.numCPerRow;
    this.widthChunk = this.widthMap / this.numCPerRow;
  }

  addChunk(ind){
    var row = Math.floor(ind / this.numCPerRow);
    var col = ind % this.numCPerRow;
    var bounds =[];
    bounds[0] = [this.minVert[X] + row*this.lengthChunk, this.minVert[Z] + col*this.widthChunk];
    bounds[1] = [this.minVert[X] + (row+1)*this.lengthChunk, this.minVert[Z] + col*this.widthChunk];
    bounds[2] = [this.minVert[X] + row*this.lengthChunk, this.minVert[Z] + (col+1)*this.widthChunk];
    bounds[3] = [this.minVert[X] + (row+1)*this.lengthChunk, this.minVert[Z] + (col+1)*this.widthChunk];
    this.chunks[ind] = new Chunk(ind,bounds);
    this.chunks[ind].addInternals(this.verticesArray);
  }
  dycotomicSearch(e,start,end){
    var midId = start+Math.floor((end-start)/2);
    var midChunk = this.chunks[midId];

    if(e[X]<midChunk.bounds[0][0]){
      return this.dycotomicSearch(e,start,midId);
    }else if(e[X]>midChunk.bounds[1][0]){
      return this.dycotomicSearch(e,midId,end);
    }else if(e[Z]<midChunk.bounds[0][1]){
      return this.dycotomicSearch(e,start,midId);
    }else if(e[Z]>=midChunk.bounds[2][1]){
      return this.dycotomicSearch(e,midId,end);
    }else{
      return midChunk.idChunk;
    }
  }

  circularIndex(ind,base){
    return (ind+base)%base;
  }

  checkNear(e,prevChunks){
    var chunkIndP, chunkIndN;
    var nears;
    for(chunkIndP=0; chunkIndP<prevChunks.length; chunkIndP++){
      nears = [prevChunks[chunkIndP],this.circularIndex(prevChunks[chunkIndP]+1,this.realNumOfChunks),this.circularIndex(prevChunks[chunkIndP]-1,this.realNumOfChunks),
               this.circularIndex(prevChunks[chunkIndP]+this.numCPerRow,this.realNumOfChunks),this.circularIndex(prevChunks[chunkIndP]+this.numCPerRow+1,this.realNumOfChunks),this.circularIndex(prevChunks[chunkIndP]+this.numCPerRow-1,this.realNumOfChunks),
               this.circularIndex(prevChunks[chunkIndP]-this.numCPerRow,this.realNumOfChunks),this.circularIndex(prevChunks[chunkIndP]-this.numCPerRow+1,this.realNumOfChunks),this.circularIndex(prevChunks[chunkIndP]-this.numCPerRow-1,this.realNumOfChunks),];
      for(chunkIndN=0; chunkIndN<nears.length; chunkIndN++){
        if(this.chunks[nears[chunkIndN]].belongChunk(e)){
          return nears[chunkIndN];
        }
      }
    }
    return this.dycotomicSearch(e,0,this.realNumOfChunks-1);
  }

  checkCollision(obj){
    var greenChunksOld = [];
    var objBounds = obj.getHitBoxUpToDate();
    var vertInd, chunkInd;
    var greenInternals, internal;
    for(vertInd=0; vertInd<objBounds.length/2; vertInd++){
      if(objBounds[vertInd][X]<this.minVert[X] || objBounds[vertInd][Z]<this.minVert[Z] ||
         objBounds[vertInd][X]>this.maxVert[X] || objBounds[vertInd][Z]>this.maxVert[Z]){
           return true;
      }
    }
    while(this.greenChunks.length){
      greenChunksOld.push(this.greenChunks.pop());
    }
    for(vertInd=0; vertInd<objBounds.length/2; vertInd++){
      if(greenChunksOld.length){
          this.greenChunks.push(this.checkNear(objBounds[vertInd],greenChunksOld));
      }else{
        this.greenChunks.push(this.dycotomicSearch(objBounds[vertInd],0,this.realNumOfChunks-1));
      }
    }

    for(chunkInd=0; chunkInd<this.greenChunks.length; chunkInd++){
      greenInternals = this.chunks[this.greenChunks[chunkInd]].internals;
      for(vertInd=0; vertInd<greenInternals.length; vertInd++){
        internal = greenInternals[vertInd];
        if((internal[X]>objBounds[0][X] & internal[X]<objBounds[2][X] & internal[Y]>objBounds[0][Y] & internal[Y]<objBounds[4][Y]
          & internal[Z]>objBounds[0][Z] & internal[Z]<objBounds[1][Z]) ||  internal[Y]>objBounds[0][Y]){
          return true;
        }
      }
    }
    return false;
  }

}
