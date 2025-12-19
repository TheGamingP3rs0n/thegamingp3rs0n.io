const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let speedSlider = document.getElementById("speed");
let lrSlider = document.getElementById("learningRate");
let resetBtn = document.getElementById("reset");

const GROUND = 260;
let simSpeed = 1;

// Agent
class Agent {
  constructor(brain) {
    this.x = 100;
    this.y = GROUND;
    this.vy = 0;
    this.alive = true;
    this.score = 0;
    this.brain = brain || new Brain();
  }

  think(gap) {
    let inputs = [
      (gap.x - this.x) / 800,
      gap.width / 200,
      this.y / GROUND
    ];
    let output = this.brain.predict(inputs);
    if (output > 0.5 && this.y === GROUND) {
      this.vy = -10;
    }
  }

  update() {
    this.vy += 0.5;
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

// Simple neural net
class Brain {
  constructor(weights) {
    this.weights = weights || Array(3).fill().map(() => Math.random() * 2 - 1);
  }

  predict(inputs) {
    let sum = inputs.reduce((a, b, i) => a + b * this.weights[i], 0);
    return 1 / (1 + Math.exp(-sum));
  }

  mutate(rate) {
    this.weights = this.weights.map(w =>
      Math.random() < rate ? w + (Math.random() * 2 - 1) * 0.3 : w
    );
  }
}

// Gap
let gap = { x: 800, width: 100 };

let agents = [];
let generation = 1;

function resetGeneration(bestBrain) {
  agents = [];
  for (let i = 0; i < 50; i++) {
    let brain = bestBrain ? new Brain([...bestBrain.weights]) : null;
    if (brain) brain.mutate(lrSlider.value);
    agents.push(new Agent(brain));
  }
  gap.x = 800;
  generation++;
}

resetGeneration();

function update() {
  for (let i = 0; i < simSpeed; i++) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    gap.x -= 4;
    if (gap.x < -gap.width) {
      gap.x = 800;
      gap.width = 60 + Math.random() * 100;
    }

    ctx.fillRect(gap.x, GROUND, gap.width, 40);

    agents.forEach(agent => {
      if (!agent.alive) return;
      agent.think(gap);
      agent.update();

      if (
        agent.x + 20 > gap.x &&
        agent.x < gap.x + gap.width &&
        agent.y === GROUND
      ) {
        agent.alive = false;
      }

      agent.draw();
    });

    let alive = agents.filter(a => a.alive);
    if (alive.length === 0) {
      let best = agents.sort((a, b) => b.score - a.score)[0];
      resetGeneration(best.brain);
      break;
    }
  }

  requestAnimationFrame(update);
}

speedSlider.oninput = () => simSpeed = speedSlider.value;
resetBtn.onclick = () => resetGeneration();

update();
