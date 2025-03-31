const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

let isPanning = false;

// Represents start-x and start-y of the graph
let startX = 0,
  startY = 0;

// Represents the visible area of graph
let xMin = -10,
  xMax = 10,
  yMin = -5,
  yMax = 5;

let gridSpacing = 1;

let equations = [];

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  plotGraph();
};

const init = () => {
  resizeCanvas();
};

// Graph coords -> Canvas coords
const toCanvasCoords = (graphX, graphY) => {
  // (xDistance/totalDistance)*canvasWidth
  let canvasX = ((graphX - xMin) / (xMax - xMin)) * canvas.width;
  let canvasY =
    canvas.height - ((graphY - yMin) / (yMax - yMin)) * canvas.height;

  return [canvasX, canvasY];
};

// Reveres of toCanvasCoords
const toGraphCoords = (canvasX, canvasY) => {
  let graphX = xMin + (canvasX / canvas.width) * (xMax - xMin);
  let graphY =
    yMin + ((canvas.height - canvasY) / canvas.height) * (yMax - yMin);

  return [graphX, graphY];
};

const getGraphX = (canvasX) => {
  return xMin + (canvasX / canvas.width) * (xMax - xMin);
};

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const setCtxStyle = (color, width) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
};

const drawLine = (startX, startY, endX, endY) => {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
};

// think in terms of graphX and graphY
// and then convert it into canvasX and canvasY
const drawGrid = () => {
  setCtxStyle("#ddd", 0.5);

  for (
    let x = Math.ceil(xMin / gridSpacing) * gridSpacing;
    x <= xMax;
    x += gridSpacing
  ) {
    let [canvasX, _] = toCanvasCoords(x, 0);
    drawLine(canvasX, 0, canvasX, canvas.height);
  }

  for (
    let y = Math.ceil(yMin / gridSpacing) * gridSpacing;
    y <= yMax;
    y += gridSpacing
  ) {
    let [_, canvasY] = toCanvasCoords(0, y);
    drawLine(0, canvasY, canvas.width, canvasY);
  }
};

const drawAxis = () => {
  setCtxStyle("#999", 2);

  let [startX, startY] = toCanvasCoords(0, 0);

  drawLine(startX, 0, startX, canvas.height);
  drawLine(0, startY, canvas.width, startY);
};

const addGraph = () => {
  const inpEqn = document.getElementById("equation").value;
  if (equations.includes(inpEqn) === true) {
    return;
  }
  try {
    math.evaluate(inpEqn, { x: 0 });
    equations.push(inpEqn);
    plotGraph();
  } catch (e) {
    return;
  }
};

const plotG = (inpEqn) => {
  // Plotting the actual graph
  let isFirstPoint = true;

  ctx.beginPath();
  for (let pixelX = 0; pixelX < canvas.width; pixelX++) {
    let graphX = getGraphX(pixelX);

    try {
      let graphY = math.evaluate(inpEqn, { x: graphX });
      let [canvasX, canvasY] = toCanvasCoords(graphX, graphY);

      if (isFirstPoint) {
        ctx.moveTo(canvasX, canvasY);
        isFirstPoint = false;
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    } catch (e) {
      // console.log(e);
      return;
    }
  }
  ctx.stroke();
};

const popGraph = () => {
  if (equations.length <= 0) {
    return;
  }
  equations.pop();
  plotGraph();
};

const clearGraphs = () => {
  equations = [];
  plotGraph();
};

const plotGraph = () => {
  clearCanvas();
  drawGrid();
  drawAxis();

  setCtxStyle("#77f", 3);

  // const inpEqn = document.getElementById("equation").value;
  for (let i = 0; i < equations.length; i++) {
    plotG(equations[i]);
  }
};

canvas.addEventListener("mouseup", () => {
  isPanning = false;
  document.body.classList.remove("grabbing");
});
canvas.addEventListener("mouseleave", () => {
  isPanning = false;
  document.body.classList.remove("grabbing");
});
window.addEventListener("resize", resizeCanvas);

canvas.addEventListener("mousedown", (event) => {
  if (!isPanning) {
    document.body.classList.add("grabbing");
  }
  isPanning = true;
  [startX, startY] = toGraphCoords(event.offsetX, event.offsetY);
});

canvas.addEventListener("mousemove", (event) => {
  if (!isPanning) {
    return;
  }
  let [newX, newY] = toGraphCoords(event.offsetX, event.offsetY);
  let dx = startX - newX;
  let dy = startY - newY;

  xMin += dx;
  xMax += dx;

  yMin += dy;
  yMax += dy;

  plotGraph();
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  let scaleFactor = event.deltaY < 0 ? 0.9 : 1.1;
  let [newX, newY] = toGraphCoords(event.offsetX, event.offsetY);

  xMin = newX + (xMin - newX) * scaleFactor;
  xMax = newX + (xMax - newX) * scaleFactor;

  yMin = newY + (yMin - newY) * scaleFactor;
  yMax = newY + (yMax - newY) * scaleFactor;

  plotGraph();
});

init();
