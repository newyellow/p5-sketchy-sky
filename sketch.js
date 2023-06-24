
let noiseScaleX = 0.02;
let noiseScaleY = 0.02;

let lineThickness = 3;
let lineDensity = 0.15;

let dotDensity = 0.6;
let dotSize = [2, 4];

async function setup() {
  console.log(fxhash);
  randomSeed(fxrand() * 20000);
  noiseSeed(fxrand() * 20000);

  await sleep(100);

  createCanvas(800, 1000);
  colorMode(HSB);
  background(0, 0, 10);

  let mainHue = 0;

  let pathCount = floor(random(4, 10));
  let pathSpace = height / pathCount;
  let pathHeight = random(200, 600);

  let circleMinSize = random(10, 20);
  let circleMaxSize = random(60, 120);

  let paths = [];
  let circleQueues = [];


  let noisePath = await getNoisePath(0, height / 2, width, height / 2, 0.002, 600);

  // background(0, 0, 10);
  let lv1Circles = await getCircleQueue(noisePath, 30, 200);
  let lv1CirclesPath = await getCircleWalkPath(lv1Circles, 1);

  // background(0, 0, 10);
  let lv2Circles = await getCircleQueue(lv1CirclesPath, 10, 60);
  let lv2CirclesPath = await getCircleWalkPath(lv2Circles, 1);

  let lv3Circles = await getCircleQueue(lv2CirclesPath, 5, 30);
  let lv3CirclesPath = await getCircleWalkPath(lv3Circles, 1);
  return;


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
    circleQueues[p] = await getCircleQueue(paths[p], circleMinSize, circleMaxSize);
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


let pointNoiseX = 0;
let pointNoiseY = 325;
let pointNoiseScaleX = 0.003;
let pointNoiseScaleY = 0.003;
let pointNoiseRadius = 10;

function NoisePoint(_x, _y) {
  pointNoiseX += pointNoiseScaleX;
  pointNoiseY += pointNoiseScaleY;

  let offsetX = (noise(pointNoiseX) - 0.5) * 2 * pointNoiseRadius;
  let offsetY = (noise(pointNoiseY) - 0.5) * 2 * pointNoiseRadius;

  circle(_x + offsetX, _y + offsetY, 3);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}