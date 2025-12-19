const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const graph = document.getElementById("graph");
const gtx = graph.getContext("2d");

const lrSlider = document.getElementById("lr");
const speedSlider = document.getElementById("speed");
const taskSelect = document.getElementById("task");
const fastBtn = document.getElementById("fast");
const resetBtn = document.getElementById("reset");

const genEl = document.getElementById("gen");
const bestEl = document.getElementById("best");
const aliveEl = document.getElementById("alive");
const weightsDiv = document.getElementById("weights");

const GROUND = 260;
let fast = false;

class Brain {
  constructor(weights) {
    this.weights = weights || Array(4).fill().map(() => Math.random() * 2 - 1);
  }

  predict(inputs) {
    let sum = inputs.reduce((a, b, i) => a + b * this.weights[i], 0);
    return 1 / (1 + Math.exp(-sum));
  }

  mutate(rate) {
    this.weights = this.weights.map(w =>
      Math.random() < rate ? w + (Math.random() * 2 - 1) * 0.4 : w
    );
  }
}

class Agent {
  constructor(brain) {
    this.x = 100;
    this.y = GROUND;
    this.vy = 0;
    this.alive = true;
    this.score = 0;
    this.brain = brain || new Brain();
  }

  think(obstacle) {
    let inputs = [
      (obstacle.x - this.x) / 800,
      obstacle.size / 200,
      this.y / GROUND,
      this.vy / 10
    ];

    let out = this.brain.predict(inputs);

    if (taskSelect.value !== "aim" && out > 0.5 && this.y === GROUND) {
      this.vy = -10;
    }
  }

  update() {
    this.vy += 0.6;
    this.y += this.vy;
    if (this.y > GROUND) {
      this.y = GROUND;
      this.vy = 0;
    }
    this.score++;
  }

  draw() {
    ctx.fillRect(this.x, this.y - 20, 20, 20);
  }
}

let agents = [];
let generation = 1;
let bestScore = 0;
let scores = [];

let obstacle = { x: 800, size: 80 };

function resetGen(bestBrain) {
  agents = [];
  for (let i = 0; i < 60; i++) {
    let brain = bestBrain ? new Brain([...bestBrain.weights]) : loadBrain();
    brain.mutate(lrSlider.value);
    agents.push(new Agent(brain));
  }
  obstacle.x = 800;
  generation++;
}

function saveBrain(brain) {
  localStorage.setItem("bestBrain", JSON.stringify(brain.weights));
}

function loadBrain() {
  let data = localStorage.getItem("bestBrain");
  return data ? new Brain(JSON.parse(data)) : null;
}

function drawWeights(brain) {
  weightsDiv.innerHTML = "";
  brain.weights.forEach(w => {
    let bar = document.createElement("div");
    bar.className = "weight";
    let fill = document.createElement("div");
    fill.style.height = Math.abs(w) * 40 + "px";
    fill.style.background = w > 0 ? "#000" : "#999";
    bar.appendChild(fill);
    weightsDiv.appendChild(bar);
  });
}

function drawGraph() {
  gtx.clearRect(0, 0, graph.width, graph.height);
  gtx.beginPath();
  gtx.moveTo(0, graph.height);
  scores.forEach((s, i) => {
    gtx.lineTo(i * 10, graph.height - s / 10);
  });
  gtx.stroke();
}

resetGen();

function loop() {
  let iterations = fast ? 30 : speedSlider.value;

  for (let i = 0; i < iterations; i++) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    obstacle.x -= 4;
    if (obstacle.x < -obstacle.size) {
      obstacle.x = 800;
      obstacle.size = 50 + Math.random() * 120;
    }

    ctx.fillRect(obstacle.x, GROUND, obstacle.size, 40);

    agents.forEach(a => {
      if (!a.alive) return;
      a.think(obstacle);
      a.update();

      if (
        a.x + 20 > obstacle.x &&
        a.x < obstacle.x + obstacle.size &&
        a.y === GROUND
      ) {
        a.alive = false;
      }
      a.draw();
    });

    let alive = agents.filter(a => a.alive);
    aliveEl.textContent = alive.length;

    if (alive.length === 0) {
      let best = agents.sort((a, b) => b.score - a.score)[0];
      scores.push(best.score);
      if (best.score > bestScore) {
        bestScore = best.score;
        saveBrain(best.brain);
      }
      bestEl.textContent = bestScore;
      genEl.textContent = generation;
      drawWeights(best.brain);
      drawGraph();
      resetGen(best.brain);
      break;
    }
  }

  requestAnimationFrame(loop);
}

fastBtn.onclick = () => fast = !fast;
resetBtn.onclick = () => {
  localStorage.removeItem("bestBrain");
  generation = 1;
  bestScore = 0;
  scores = [];
  resetGen();
};

loop();
