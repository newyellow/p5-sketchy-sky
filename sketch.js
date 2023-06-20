
let noiseScaleX = 0.02;
let noiseScaleY = 0.02;

let lineThickness = 3;
let lineDensity = 0.15;

let dotDensity = 0.6;
let dotSize = [2, 4];

let circles = [];

async function setup() {
  createCanvas(800, 1200);
  colorMode(HSB);
  background(0, 0, 90);



  blendMode(MULTIPLY);

  // for(let i=0; i< 300; i++)
  // {
  //   let xPos = random(0.2, 0.8) * width;
  //   let yPos = random(0.2, 0.8) * height;

  //   let maxHeight = random(30, 80);
  //   let length = random(100, 400);

  //   noiseStroke(xPos, yPos, maxHeight, length);
  //   await sleep(1);
  // }

  let addCircleCount = 20;
  let nextCircleDirAngle = 90;

  for (let i = 0; i < addCircleCount; i++) {
    if (i == 0) {
      let circleSize = random(30, 200);
      circles.push(new CircleData(0, height / 2, circleSize));
    }
    else {
      let lastSize = circles[circles.length - 1].radius;
      let newCircleSize = random(10, 60);

      let maxDist = lastSize + newCircleSize;
      let minDist = max(lastSize, newCircleSize);

      let randomDist = lerp(minDist, maxDist, random(0.1, 0.9));

      let lastX = circles[circles.length - 1].x;
      let lastY = circles[circles.length - 1].y;

      nextCircleDirAngle = noise(lastX * 0.001, lastY * 0.001) * 720;

      let newX = lastX + randomDist * sin(radians(nextCircleDirAngle));
      let newY = lastY - randomDist * cos(radians(nextCircleDirAngle));

      circles.push(new CircleData(newX, newY, newCircleSize));
    }
  }

  // drawCircles
  for (let i = 0; i < circles.length; i++) {
    stroke(60, 30, 80);
    circle(circles[i].x, circles[i].y, circles[i].radius * 2);
  }

  // draw on the edge of circles
  let nowCircleIndex = 0;
  let nowWalkingAngle = 270;
  let angleStep = 0.5;
  let walkX = circles[nowCircleIndex].x + sin(radians(nowWalkingAngle)) * circles[nowCircleIndex].radius;
  let walkY = circles[nowCircleIndex].y - cos(radians(nowWalkingAngle)) * circles[nowCircleIndex].radius;

  while (true) {
    fill('red');
    circle(walkX, walkY, 3);

    nowWalkingAngle += angleStep;

    let walkPoint = circles[nowCircleIndex].getSurfacePoint(nowWalkingAngle);
    walkX = walkPoint.x;
    walkY = walkPoint.y;

    let isOnEdgeA = circles[nowCircleIndex].isOnEdge(walkX, walkY);
    let isOnEdgeB = circles[nowCircleIndex + 1].isOnEdge(walkX, walkY);

    if (isOnEdgeA && isOnEdgeB) {
      nowCircleIndex++;
      nowWalkingAngle = circles[nowCircleIndex].angleOnTheEdge(walkX, walkY);
    }

    await sleep(1);
  }
}

function noiseStroke(_x, _y, _maxHeight, _length) {

  let lineCount = _length * lineDensity;

  for (let i = 0; i < lineCount; i++) {
    let t = i / lineCount;

    let xPos = _x + t * _length;
    let yPos = _y;

    let noiseScaler = 1;

    if (t <= 0.1)
      noiseScaler = map(t, 0, 0.1, 0, 1);
    else if (t >= 0.9)
      noiseScaler = map(t, 0.9, 1, 1, 0);

    let noiseValue = noise(xPos * noiseScaleX, yPos * noiseScaleY) * noiseScaler;

    let yAddUp = noiseValue * _maxHeight * 0.7;
    let yAddBot = noiseValue * _maxHeight * 0.3;

    NYLine(xPos, yPos - yAddUp, xPos, yPos + yAddBot);
  }
}

function draw() {

}

function NYRect(_x, _y, _width, _height) {

}

function NYLine(_x1, _y1, _x2, _y2) {
  let dotCount = dist(_x1, _y1, _x2, _y2) * dotDensity;
  let stepDistance = dist(_x1, _y1, _x2, _y2) / dotCount;

  let forwardAngle = getAngle(_x1, _y1, _x2, _y2);
  let wavingAngle = forwardAngle + 90;

  for (let i = 0; i < dotCount; i++) {
    let t = i / dotCount;
    let xPos = lerp(_x1, _x2, t);
    let yPos = lerp(_y1, _y2, t);

    let sizeNoise = noise(xPos * noiseScaleX, yPos * noiseScaleY, 666);
    let nowDotSize = lerp(dotSize[0], dotSize[1], sizeNoise);

    // let wavingNoise = noise(xPos * 0.01, yPos * 0.01, 999) * 2 - 1;
    let wavingNoise = sizeNoise;
    xPos += wavingNoise * 6;

    strokeWeight(lineThickness);
    // stroke(200, 60, 80, 1);
    fill(200, 60, 80);
    noStroke();

    circle(xPos, yPos, nowDotSize);
  }
}

// calculate degree
function getAngle(_x1, _y1, _x2, _y2) {
  let xDiff = _x2 - _x1;
  let yDiff = _y2 - _y1;

  let degree = atan2(yDiff, xDiff) * 180 / PI;

  return degree;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CircleData {
  constructor(_x, _y, _radius) {
    this.x = _x;
    this.y = _y;
    this.radius = _radius;
  }

  isOnEdge(_x, _y) {
    let distToCenter = dist(_x, _y, this.x, this.y);
    return abs(distToCenter - this.radius) < 0.5;
  }

  getSurfacePoint(_angle) {
    let xPos = this.x + sin(radians(_angle)) * this.radius;
    let yPos = this.y - cos(radians(_angle)) * this.radius;

    return { x: xPos, y: yPos };
  }

  distToCenter(_x, _y) {
    return dist(_x, _y, this.x, this.y);
  }

  angleOnTheEdge(_x, _y) {
    let angleToCenter = getAngle(this.x, this.y, _x, _y);
    return angleToCenter + 90;
  }
}