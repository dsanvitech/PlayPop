const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const distanceEl = document.getElementById("distance");
const coinsEl = document.getElementById("coins");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("startBtn");

let W = 600;
let H = 338;

function resize() {
  const rect = canvas.getBoundingClientRect();

  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  W = rect.width;
  H = rect.height;
}

resize();
window.addEventListener("resize", resize);

let bike;
let terrain;
let coinObjects;

let running = false;
let gameOver = false;

let distance = 0;
let coins = 0;

let best = Number(
  localStorage.getItem("playpopBikeBest")
) || 0;

bestEl.textContent = best;

let cameraX = 0;

function startGame() {

  terrain = [];

  for (let x = 0; x < 5000; x += 20) {

    const y =
      H * 0.65 +
      Math.sin(x * 0.012) * 35 +
      Math.sin(x * 0.025) * 18 +
      Math.sin(x * 0.005) * 45;

    terrain.push({
      x,
      y
    });
  }

  coinObjects = [];

  for (let x = 300; x < 5000; x += 250) {

    const ground = getGroundY(x);

    coinObjects.push({
      x,
      y: ground - 45,
      collected: false
    });
  }

  bike = {
    x: 120,
    y: 100,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0
  };

  distance = 0;
  coins = 0;
  cameraX = 0;

  running = true;
  gameOver = false;

  distanceEl.textContent = "0";
  coinsEl.textContent = "0";

  startBtn.textContent = "Restart";

  requestAnimationFrame(loop);
}

function getGroundY(x) {

  if (!terrain || terrain.length === 0) {
    return H * 0.7;
  }

  const index = Math.floor(x / 20);

  if (index < 0) {
    return terrain[0].y;
  }

  if (index >= terrain.length) {
    return terrain[terrain.length - 1].y;
  }

  return terrain[index].y;
}

function update() {

  if (!running) return;

  const accelerating =
    keys.right || keys.forward;

  const braking =
    keys.left || keys.backward;

  if (accelerating) {
    bike.vx += 0.12;
  }

  if (braking) {
    bike.vx -= 0.05;
  }

  bike.vx *= 0.985;

  if (bike.vx > 5) bike.vx = 5;
  if (bike.vx < -2) bike.vx = -2;

  bike.x += bike.vx;

  bike.vy += 0.35;
  bike.y += bike.vy;

  const ground = getGroundY(bike.x);

  const wheelRadius = 12;

  if (bike.y + 25 > ground) {

    bike.y = ground - 25;
    bike.vy = 0;

    const groundAhead =
      getGroundY(bike.x + 20);

    const slope =
      groundAhead - ground;

    bike.angle +=
      (slope * 0.003 - bike.angle) * 0.15;
  }

  if (accelerating) {
    bike.angularVelocity += 0.002;
  }

  if (braking) {
    bike.angularVelocity -= 0.002;
  }

  bike.angularVelocity *= 0.98;
  bike.angle += bike.angularVelocity;

  cameraX = bike.x - W * 0.3;

  if (cameraX < 0) {
    cameraX = 0;
  }

  distance = Math.max(
    distance,
    Math.floor(bike.x / 10)
  );

  distanceEl.textContent = distance;

  collectCoins();

  if (
    Math.abs(bike.angle) > Math.PI * 0.55
  ) {
    endGame();
  }

  if (bike.y > H + 100) {
    endGame();
  }
}

function collectCoins() {

  coinObjects.forEach(coin => {

    if (coin.collected) return;

    const dx = bike.x - coin.x;
    const dy = bike.y - coin.y;

    if (
      Math.sqrt(dx * dx + dy * dy) < 35
    ) {

      coin.collected = true;
      coins++;

      coinsEl.textContent = coins;
    }
  });
}

function drawBackground() {

  const gradient =
    ctx.createLinearGradient(0, 0, 0, H);

  gradient.addColorStop(0, "#70c8ed");
  gradient.addColorStop(1, "#d7f2ff");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Clouds
  ctx.fillStyle = "rgba(255,255,255,.75)";

  for (let i = 0; i < 5; i++) {

    const x =
      (i * 230 - cameraX * 0.2) %
      (W + 250);

    const y = 45 + (i % 3) * 35;

    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 8, 28, 0, Math.PI * 2);
    ctx.arc(x + 55, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTerrain() {

  ctx.beginPath();

  ctx.moveTo(0, H);

  for (
    let screenX = 0;
    screenX <= W + 20;
    screenX += 20
  ) {

    const worldX =
      cameraX + screenX;

    const y =
      getGroundY(worldX);

    ctx.lineTo(screenX, y);
  }

  ctx.lineTo(W, H);
  ctx.closePath();

  ctx.fillStyle = "#4e9b52";
  ctx.fill();

  ctx.beginPath();

  for (
    let screenX = 0;
    screenX <= W + 20;
    screenX += 20
  ) {

    const worldX =
      cameraX + screenX;

    const y =
      getGroundY(worldX);

    if (screenX === 0) {
      ctx.moveTo(screenX, y);
    } else {
      ctx.lineTo(screenX, y);
    }
  }

  ctx.strokeStyle = "#285f32";
  ctx.lineWidth = 5;
  ctx.stroke();
}

function drawCoins() {

  coinObjects.forEach(coin => {

    if (coin.collected) return;

    const x = coin.x - cameraX;
    const y = coin.y;

    if (x < -30 || x > W + 30) {
      return;
    }

    ctx.fillStyle = "#ffd43b";

    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#9a6b00";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", x, y);
  });
}

function drawBike() {

  const x =
    bike.x - cameraX;

  const y =
    bike.y;

  ctx.save();

  ctx.translate(x, y);
  ctx.rotate(bike.angle);

  // Wheels
  ctx.strokeStyle = "#171717";
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.arc(-22, 17, 12, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(22, 17, 12, 0, Math.PI * 2);
  ctx.stroke();

  // Frame
  ctx.strokeStyle = "#ff3ea5";
  ctx.lineWidth = 4;

  ctx.beginPath();

  ctx.moveTo(-22, 17);
  ctx.lineTo(0, -5);
  ctx.lineTo(22, 17);
  ctx.lineTo(-5, 17);
  ctx.lineTo(-22, 17);
  ctx.moveTo(0, -5);
  ctx.lineTo(-5, 17);

  ctx.stroke();

  // Seat
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.lineTo(4, -8);
  ctx.stroke();

  // Handle
  ctx.beginPath();
  ctx.moveTo(17, 4);
  ctx.lineTo(25, -5);
  ctx.stroke();

  ctx.restore();
}

function drawGameOver() {

  if (!gameOver) return;

  ctx.fillStyle = "rgba(0,0,0,.55)";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";

  ctx.font = "bold 30px Arial";
  ctx.fillText(
    "BIKE FLIPPED!",
    W / 2,
    H / 2 - 20
  );

  ctx.font = "16px Arial";

  ctx.fillText(
    "Distance: " + distance,
    W / 2,
    H / 2 + 15
  );
}

function draw() {

  ctx.clearRect(0, 0, W, H);

  drawBackground();
  drawTerrain();
  drawCoins();
  drawBike();
  drawGameOver();
}

function loop() {

  if (!running) return;

  update();
  draw();

  if (running) {
    requestAnimationFrame(loop);
  }
}

function endGame() {

  running = false;
  gameOver = true;

  if (distance > best) {

    best = distance;

    localStorage.setItem(
      "playpopBikeBest",
      best
    );

    bestEl.textContent = best;
  }

  draw();
}

const keys = {
  left: false,
  right: false,
  forward: false,
  backward: false
};

document.addEventListener("keydown", e => {

  if (e.key === "ArrowRight") {
    keys.right = true;
    keys.forward = true;
    e.preventDefault();
  }

  if (e.key === "ArrowLeft") {
    keys.left = true;
    keys.backward = true;
    e.preventDefault();
  }

  if (e.key === " " && !running) {
    startGame();
  }
});

document.addEventListener("keyup", e => {

  if (e.key === "ArrowRight") {
    keys.right = false;
    keys.forward = false;
  }

  if (e.key === "ArrowLeft") {
    keys.left = false;
    keys.backward = false;
  }
});

function buttonHold(button, key) {

  button.addEventListener("pointerdown", () => {
    keys[key] = true;
  });

  button.addEventListener("pointerup", () => {
    keys[key] = false;
  });

  button.addEventListener("pointerleave", () => {
    keys[key] = false;
  });
}

buttonHold(
  document.getElementById("forwardBtn"),
  "forward"
);

buttonHold(
  document.getElementById("backBtn"),
  "backward"
);

let touchStartX = 0;

canvas.addEventListener("touchstart", e => {

  touchStartX =
    e.touches[0].clientX;
});

canvas.addEventListener("touchmove", e => {

  const currentX =
    e.touches[0].clientX;

  const difference =
    currentX - touchStartX;

  if (difference > 25) {
    keys.forward = true;
    keys.backward = false;
  }

  if (difference < -25) {
    keys.backward = true;
    keys.forward = false;
  }
});

canvas.addEventListener("touchend", () => {

  keys.forward = false;
  keys.backward = false;
});

startBtn.addEventListener(
  "click",
  startGame
);

draw();
