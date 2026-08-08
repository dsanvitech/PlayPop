const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("startBtn");

let W = 300;
let H = 500;

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

let player;
let enemies;
let coins;
let score;
let speed;
let running;
let gameOver;

let best = Number(localStorage.getItem("playpopCarBest")) || 0;
bestEl.textContent = best;

function startGame() {
  player = {
    x: W / 2 - 20,
    y: H - 90,
    width: 40,
    height: 65,
    speed: 7
  };

  enemies = [];
  coins = [];

  score = 0;
  speed = 4;
  running = true;
  gameOver = false;

  scoreEl.textContent = "0";
  startBtn.textContent = "Restart";

  requestAnimationFrame(loop);
}

function roadBounds() {
  return {
    left: W * 0.15,
    right: W * 0.85
  };
}

function spawnEnemy() {
  const road = roadBounds();

  const width = 40;

  enemies.push({
    x: road.left + Math.random() * (road.right - road.left - width),
    y: -80,
    width: width,
    height: 65,
    speed: speed + Math.random() * 2
  });
}

function spawnCoin() {
  const road = roadBounds();

  coins.push({
    x: road.left + 15 + Math.random() * (road.right - road.left - 30),
    y: -20,
    size: 10,
    speed: speed
  });
}

let spawnTimer = 0;
let coinTimer = 0;

function update() {
  if (!running) return;

  speed += 0.0008;

  spawnTimer++;

  if (spawnTimer > Math.max(35, 75 - speed * 5)) {
    spawnEnemy();
    spawnTimer = 0;
  }

  coinTimer++;

  if (coinTimer > 70) {
    spawnCoin();
    coinTimer = 0;
  }

  enemies.forEach(enemy => {
    enemy.y += enemy.speed;
  });

  coins.forEach(coin => {
    coin.y += coin.speed;
  });

  enemies = enemies.filter(enemy => enemy.y < H + 100);
  coins = coins.filter(coin => coin.y < H + 50);

  score += 1;
  scoreEl.textContent = Math.floor(score / 5);

  checkCollisions();
}

function checkCollisions() {
  for (const enemy of enemies) {
    if (collision(player, enemy)) {
      endGame();
      return;
    }
  }

  coins = coins.filter(coin => {
    const hit =
      player.x < coin.x + coin.size &&
      player.x + player.width > coin.x - coin.size &&
      player.y < coin.y + coin.size &&
      player.y + player.height > coin.y - coin.size;

    if (hit) {
      score += 50;
      return false;
    }

    return true;
  });
}

function collision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function drawRoad() {
  ctx.fillStyle = "#1e7a42";
  ctx.fillRect(0, 0, W, H);

  const road = roadBounds();

  ctx.fillStyle = "#303038";
  ctx.fillRect(road.left, 0, road.right - road.left, H);

  ctx.fillStyle = "#eee";
  ctx.fillRect(road.left, 0, 5, H);
  ctx.fillRect(road.right - 5, 0, 5, H);

  ctx.fillStyle = "#f5f5f5";

  const laneWidth = (road.right - road.left) / 3;

  for (let lane = 1; lane < 3; lane++) {
    const x = road.left + lane * laneWidth;

    for (let y = -50; y < H; y += 80) {
      const offset = (performance.now() * speed / 20) % 80;

      ctx.fillRect(x - 2, y + offset, 4, 40);
    }
  }
}

function drawCar(car, color) {
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.roundRect(
    car.x,
    car.y,
    car.width,
    car.height,
    8
  );
  ctx.fill();

  ctx.fillStyle = "#9be7ff";

  ctx.fillRect(
    car.x + 7,
    car.y + 10,
    car.width - 14,
    17
  );

  ctx.fillStyle = "#111";

  ctx.fillRect(car.x - 4, car.y + 12, 5, 17);
  ctx.fillRect(car.x + car.width - 1, car.y + 12, 5, 17);

  ctx.fillRect(car.x - 4, car.y + 42, 5, 17);
  ctx.fillRect(car.x + car.width - 1, car.y + 42, 5, 17);
}

function drawCoin(coin) {
  ctx.fillStyle = "#ffd43b";

  ctx.beginPath();
  ctx.arc(coin.x, coin.y, coin.size, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#9a6b00";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", coin.x, coin.y);
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  drawRoad();

  coins.forEach(drawCoin);

  enemies.forEach(enemy => {
    drawCar(enemy, "#ff405c");
  });

  if (player) {
    drawCar(player, "#3ec6ff");
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,.65)";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";

    ctx.font = "bold 30px Arial";
    ctx.fillText("CRASH!", W / 2, H / 2 - 20);

    ctx.font = "16px Arial";
    ctx.fillText(
      "Score: " + Math.floor(score / 5),
      W / 2,
      H / 2 + 15
    );
  }
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

  const finalScore = Math.floor(score / 5);

  if (finalScore > best) {
    best = finalScore;
    localStorage.setItem("playpopCarBest", best);
    bestEl.textContent = best;
  }

  draw();
}

function moveLeft() {
  if (!player || !running) return;

  const road = roadBounds();

  player.x -= player.speed;

  if (player.x < road.left + 7) {
    player.x = road.left + 7;
  }
}

function moveRight() {
  if (!player || !running) return;

  const road = roadBounds();

  player.x += player.speed;

  if (player.x + player.width > road.right - 7) {
    player.x = road.right - player.width - 7;
  }
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    moveLeft();
  }

  if (e.key === "ArrowRight") {
    e.preventDefault();
    moveRight();
  }

  if (e.key === " " && !running) {
    startGame();
  }
});

document.getElementById("leftBtn").addEventListener("pointerdown", moveLeft);
document.getElementById("rightBtn").addEventListener("pointerdown", moveRight);

let touchStartX = 0;

canvas.addEventListener("touchstart", e => {
  touchStartX = e.touches[0].clientX;
});

canvas.addEventListener("touchend", e => {
  const touchEndX = e.changedTouches[0].clientX;
  const difference = touchEndX - touchStartX;

  if (Math.abs(difference) > 25) {
    if (difference > 0) {
      moveRight();
    } else {
      moveLeft();
    }
  }
});

startBtn.addEventListener("click", startGame);

draw();
