let boids = [];
let canvasResolutionMultiplier = 1;
let xResolution = 200;
let yResolution = 200;

let sensorDistance = 3;
let sensorSize = 5; // Side of square
let sensorAngle = Math.PI/4;
let angleAdjustmentAfterSensorReading = Math.PI/15;
let amountGreaterForAngleAdjustement = 50;

let viewCanvas = document.getElementById("viewCanvas");
let viewCTX = viewCanvas.getContext("2d");
let canvasData = [];


viewCanvas.width = xResolution * canvasResolutionMultiplier;
viewCanvas.height = yResolution * canvasResolutionMultiplier;

class boidCell {
  constructor() {
    this.cellType = "boid";
    this.x = Math.floor(Math.random() * xResolution);
    this.y = Math.floor(Math.random() * xResolution);

    this.angle = Math.random() * 2 * Math.PI;
    this.speed = 1;

    
  }
}

async function updateCanvasData() {
  const imageData = viewCTX.getImageData(
    0,
    0,
    xResolution * canvasResolutionMultiplier,
    yResolution * canvasResolutionMultiplier
  );

  const pixelData = new Uint8Array(imageData.data.buffer);

  const pixelArray = new Array(yResolution * canvasResolutionMultiplier);

  for (let y = 0; y < yResolution * canvasResolutionMultiplier; y++) {
    pixelArray[y] = new Array(xResolution * canvasResolutionMultiplier);

    for (let x = 0; x < xResolution * canvasResolutionMultiplier; x++) {
      const index = (y * xResolution * canvasResolutionMultiplier + x) * 4;

      const red = pixelData[index];
      const green = pixelData[index + 1];
      const blue = pixelData[index + 2];

      pixelArray[y][x] = red + green + blue;
    }
  }

  canvasData = pixelArray;
}

function initalizeBoids() {
  for (let y = 0; y<yResolution; y++) {
    for (let x = 0; x<xResolution; x++) {
      if (Math.random()>0.995) { 
        let boid = new boidCell();
        boids.push(boid);
      }   
    } 
  }
}

async function drawBoids() {
  boids.forEach(boid => {
    drawBoid(boid);
  });
  
}

async function drawBoid(boid) {
  viewCTX.fillRect(boid.x, boid.y, 1 * canvasResolutionMultiplier, 1 * canvasResolutionMultiplier);
}

function syncDirections() {
  for (let i=0; i<boids.length; i++) {
    let averageX = 0;
    let averageY = 0;
    let totalBoidsWithinArea = 0;
    


    for (let j=i+1; j<boids.length; j++) {
      if (((boids[i].y + 20) > (boids[j].y)) &&
        (boids[i].y < (boids[j].y + 20)) &&
        ((boids[i].x + 10) > boids[j].x-10) &&
        (boids[i].x -10 < (boids[j].x + 10))) {
          totalBoidsWithinArea += 1;
          averageX += boids[j].x;
          averageY += boids[j].y;
        }
        
    }

    averageX = averageX/totalBoidsWithinArea;
    averageY = averageY/totalBoidsWithinArea;

    if (averageX>0 && averageY>0) {
      boids[i].angle = (Math.atan2(averageY-boids[i].y, averageX-boids[i].x) + boids[i].angle * 10)/11;
    }

    for (let j=i+1; j<boids.length; j++) {
      if (((boids[i].y + 40) > (boids[j].y)) &&
        (boids[i].y < (boids[j].y + 40)) &&
        ((boids[i].x + 20) > boids[j].x-20) &&
        (boids[i].x -20 < (boids[j].x + 20))) {
          boids[i].angle = (boids[i].angle * 10 + boids[j].angle) / 11;
        }
    }

    
    
    
  }
}
function detect(boid) {
  let leftSensorX = boid.x + Math.cos(boid.angle - sensorAngle) * sensorDistance-1;
  let leftSensorY = boid.y + Math.sin(boid.angle - sensorAngle) * sensorDistance-1;
  
  leftSensorX = Math.floor(leftSensorX) * canvasResolutionMultiplier;
  leftSensorY = Math.floor(leftSensorY) * canvasResolutionMultiplier;

  let leftSensorValue = 0;
  for (let y=0; y<sensorSize*canvasResolutionMultiplier; y++) {
    for (let x=0; x<sensorSize*canvasResolutionMultiplier; x++) {
      if (leftSensorY+y<canvasData.length && leftSensorY+y>=0) {
        if (leftSensorX+x<canvasData[leftSensorY+y].length && leftSensorX+x>=0) {
          leftSensorValue += canvasData[leftSensorY+y][leftSensorX+x];
          
        }
      }
      
    }
  }
  viewCTX.fillStyle = "red"
  // viewCTX.fillRect(leftSensorX, leftSensorY, sensorSize, sensorSize)

  let rightSensorX = boid.x + Math.cos(boid.angle + sensorAngle) * sensorDistance;
  let rightSensorY = boid.y + Math.sin(boid.angle + sensorAngle) * sensorDistance;
  
  rightSensorX = Math.floor(rightSensorX) * canvasResolutionMultiplier;
  rightSensorY = Math.floor(rightSensorY) * canvasResolutionMultiplier;

  let rightSensorValue = 0;
  for (let y=0; y<sensorSize*canvasResolutionMultiplier; y++) {
    for (let x=0; x<sensorSize*canvasResolutionMultiplier; x++) {
      if (rightSensorY+y<canvasData.length && rightSensorY+y>=0) {
        if (rightSensorX+x<canvasData[rightSensorY+y].length && rightSensorX+x>=0) {
          rightSensorValue += canvasData[rightSensorY+y][rightSensorX+x];
          
        }
      }
      
    }
  }
  viewCTX.fillStyle = "blue"
  // viewCTX.fillRect(rightSensorX, rightSensorY, sensorSize, sensorSize)
  if (leftSensorValue-amountGreaterForAngleAdjustement>rightSensorValue) {
    if (leftSensorValue>rightSensorValue-amountGreaterForAngleAdjustement) {
      boid.angle -= angleAdjustmentAfterSensorReading;
    }
    
  } else if (leftSensorValue<rightSensorValue-amountGreaterForAngleAdjustement) {
    boid.angle += angleAdjustmentAfterSensorReading;
  } else {
    boid.angle += angleAdjustmentAfterSensorReading * (Math.random() - 0.5);
  }


}


async function updateBoidPositions() {
  for (let i = 0; i<boids.length; i++) {
    updateBoidPosition(boids[i]);

  }
}

async function updateBoidPosition(boid) {
  let boidXSpeed = Math.cos(boid.angle) * boid.speed;
  let boidYSpeed = Math.sin(boid.angle) * boid.speed;

  if (boid.x + boidXSpeed>xResolution-1) {
    boid.x = 0;
  }

  if (boid.x + boidXSpeed<=0) {
    boid.x = xResolution-1; 
  }
  
  if (boid.y + boidYSpeed>yResolution-1) {
    boid.y = 0;
  }

  if (boid.y + boidYSpeed<=0) {
    boid.y = yResolution-1; 
  }
  boid.x += boidXSpeed
  boid.y += boidYSpeed;
}


let previousTickTime = performance.now();
let currentTickTime = performance.now();
let running = false;

function tick() {

  if (running) {
    // viewCTX.clearRect(0, 0, viewCanvas.width, viewCanvas.height);
    currentTickTime = performance.now();
    document.getElementById("FPS").innerHTML = "FPS: " + (1000/(currentTickTime-previousTickTime)).toFixed(2);
    viewCTX.fillStyle = "rgb(255, 255, 255)";
    viewCTX.globalAlpha = 0.3;
    viewCTX.fillRect(0, 0, viewCanvas.width, viewCanvas.height);
    viewCTX.globalAlpha = 1;
    viewCTX.fillStyle = "rgb(10, 255, 255)";
    drawBoids();
    updateCanvasData();

    syncDirections();
    for (let i=0; i<boids.length;i++) {
      detect(boids[i])
    }
    updateBoidPositions();

    previousTickTime = currentTickTime;
  }
  
  
  // requestAnimationFrame(tick);
}
function toggleRunning() {
  running = !running;
  running = true;
  const interval = setInterval(function() {
    tick()
  }, 10);
  // tick();
}

initalizeBoids();
viewCTX.fillStyle = "rgb(10, 255, 255)";
drawBoids();
tick();



