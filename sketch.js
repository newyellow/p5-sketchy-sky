
let noiseScaleX = 0.02;
let noiseScaleY = 0.02;

let lineThickness = 3;
let lineDensity = 0.15;

let dotDensity = 0.6;
let dotSize = [2, 4];

async function setup() {
  createCanvas(1000, 1000);
  colorMode(HSB);
  background(0, 0, 10);



  blendMode(ADD);

  // for(let i=0; i< 300; i++)
  // {
  //   let xPos = random(0.2, 0.8) * width;
  //   let yPos = random(0.2, 0.8) * height;

  //   let maxHeight = random(30, 80);
  //   let length = random(100, 400);

  //   noiseStroke(xPos, yPos, maxHeight, length);
  //   await sleep(1);
  // }

  let mainHue = 0;

  let pathCount = floor(random(4, 10));
  let pathSpace = height / pathCount;
  let pathHeight = random(200, 600);

  let circleMinSize = random(10, 20);
  let circleMaxSize = random(60, 120);

  let paths = [];
  let circleQueues = [];

  for (let p = 0; p < pathCount; p++) {
    paths[p] = [];
    mainHue = p / pathCount * 360;

    for (let x = 0; x < width; x += 2) {
      let xPos = x;
      let yPos = (p + 0.5) * pathSpace;

      yPos += noise(x * 0.003, yPos * 0.01) * pathHeight - 0.25 * pathHeight;

      noStroke();
      fill(mainHue, 30, 80);
      circle(xPos, yPos, 2);
      paths[p].push({ x: xPos, y: yPos });
    }

    // get circle queue
    circleQueues[p] = getCircleQueue(paths[p], circleMinSize, circleMaxSize);
    await sleep(10);
  }

  await sleep(10);

  // drawCircles
  for (let q = 0; q < circleQueues.length; q++) {
    let circles = circleQueues[q];
    mainHue = q / pathCount * 360;

    for (let i = 0; i < circles.length; i++) {
      stroke(mainHue, random(30, 80), random(60, 100));
      strokeWeight(1);
      noFill();
      circle(circles[i].x, circles[i].y, circles[i].radius * 2);

      // visualize the end angle
      if (i < circles.length - 1) {
        let endAngle = circles[i].getIntersectionAngle(circles[i + 1])[0];
        let endX = circles[i].x + sin(radians(endAngle)) * circles[i].radius;
        let endY = circles[i].y - cos(radians(endAngle)) * circles[i].radius;
        stroke(mainHue, 30, 80);
        strokeWeight(3);
        circle(endX, endY, 5);
      }
    }
  }

  // walking on the edge
  for (let q = 0; q < circleQueues.length; q++) {

    let circles = circleQueues[q];

    // draw on the edge of circles
    let nowCircleIndex = 0;
    let nowWalkingAngle = -90;
    let endWalkingAngle = circles[nowCircleIndex].getIntersectionAngle(circles[nowCircleIndex + 1])[0];
    let angleStep = 1;
    let walkX = circles[nowCircleIndex].x + sin(radians(nowWalkingAngle)) * circles[nowCircleIndex].radius;
    let walkY = circles[nowCircleIndex].y - cos(radians(nowWalkingAngle)) * circles[nowCircleIndex].radius;

    let counter = 0;

    while (true) {
      fill('white');
      noStroke();
      circle(walkX, walkY, 6);

      nowWalkingAngle += angleStep;

      let walkPoint = circles[nowCircleIndex].getSurfacePoint(nowWalkingAngle);
      walkX = walkPoint.x;
      walkY = walkPoint.y;

      // walk on next cirlce
      if (nowWalkingAngle >= endWalkingAngle) {
        nowCircleIndex++;

        if (nowCircleIndex == circles.length - 1) {
          nowWalkingAngle = circles[nowCircleIndex].getPointAngle(walkX, walkY);

          if (nowWalkingAngle > 180)
            nowWalkingAngle -= 360;

          endWalkingAngle = 90;
        }
        else if (nowCircleIndex == circles.length) {
          break;
        }
        else {

          nowWalkingAngle = circles[nowCircleIndex].getPointAngle(walkX, walkY);
          if (nowWalkingAngle > 0)
            nowWalkingAngle -= 360;

          endWalkingAngle = circles[nowCircleIndex].getIntersectionAngle(circles[nowCircleIndex + 1])[0];
        }
      }

      if (counter++ % 6 == 0)
        await sleep(1);
    }
  }
}

function getCircleQueue(_pathPoints, _minSize = 10, _maxSize = 60) {

  let resultCircles = [];

  let pathIndex = 0;
  let lastPoint = _pathPoints[0];
  let nextPoint = _pathPoints[1];

  // prepare next circle
  let lastCircleSize = random(_minSize, _maxSize);
  let nextCircleSize = random(_minSize, _maxSize);
  let maxDist = lastCircleSize + nextCircleSize;
  let minDist = max(lastCircleSize, nextCircleSize);
  let nextCircleDist = lerp(minDist, maxDist, random(0.1, 0.9));

  // add in first circle
  let walkX = _pathPoints[0].x;
  let walkY = _pathPoints[0].y;
  let walkDir = getAngle(_pathPoints[0], _pathPoints[1]) + 90; // add 90 is global angle
  resultCircles.push(new CircleData(_pathPoints[0].x, _pathPoints[0].y, lastCircleSize));

  let lastCircleX = walkX;
  let lastCircleY = walkY;

  // walk and get circles
  while (true) {
    walkX += sin(radians(walkDir));
    walkY -= cos(radians(walkDir));
    // noStroke();
    // fill('blue');
    // circle(walkX, walkY, 2);

    let distToLastCircle = dist(walkX, walkY, lastCircleX, lastCircleY);
    let distToNextPathPoint = dist(walkX, walkY, nextPoint.x, nextPoint.y);

    // arrive dest circle point
    if (distToLastCircle >= nextCircleDist) {
      resultCircles.push(new CircleData(walkX, walkY, nextCircleSize));

      lastCircleX = walkX;
      lastCircleY = walkY;

      // noFill();
      // stroke(random(0, 360), random(40, 60), random(80, 100));
      // circle(walkX, walkY, nextCircleSize * 2);

      // get next circle
      lastCircleSize = nextCircleSize;
      nextCircleSize = random(_minSize, _maxSize);

      maxDist = lastCircleSize + nextCircleSize;
      minDist = max(lastCircleSize, nextCircleSize);
      nextCircleDist = lerp(minDist, maxDist, random(0.1, 0.9));
    }

    // arrive next path point
    if (distToNextPathPoint <= 1) {
      lastPoint = _pathPoints[pathIndex];

      pathIndex++;
      if (pathIndex >= _pathPoints.length) {
        // add last circle
        let endCircleX = lastCircleX + sin(radians(walkDir)) * nextCircleDist;
        let endCircleY = lastCircleY - cos(radians(walkDir)) * nextCircleDist;
        resultCircles.push(new CircleData(endCircleX, endCircleY, nextCircleSize));
        break;
      }

      nextPoint = _pathPoints[pathIndex];
      walkDir = getAngle(lastPoint, nextPoint) + 90;
    }
  }

  return resultCircles;
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}