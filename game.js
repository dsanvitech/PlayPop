(function () {
  const SIZE = 4;
  const boardEl = document.getElementById('board');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlaySub = document.getElementById('overlaySub');
  const newGameBtn = document.getElementById('newGame');
  const overlayRestart = document.getElementById('overlayRestart');

  const TILE_COLORS = {
    2: '#2B2458', 4: '#3E3480', 8: '#5D4FB0', 16: '#7B5EFF',
    32: '#FF5D9E', 64: '#FF3EA5', 128: '#FF8A5B', 256: '#FFB43E',
    512: '#FFD23E', 1024: '#3EFFC0', 2048: '#3EC6FF', 4096: '#B8ADFF'
  };

  let grid, score, best, gameOver, won, wonAcknowledged;

  function loadBest() {
    return parseInt(localStorage.getItem('sd-2048-best') || '0', 10);
  }
  function saveBest(v) {
    localStorage.setItem('sd-2048-best', String(v));
  }

  function emptyGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function randomEmptyCell(g) {
    const cells = [];
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (g[r][c] === 0) cells.push([r, c]);
    if (!cells.length) return null;
    return cells[Math.floor(Math.random() * cells.length)];
  }

  function spawnTile(g) {
    const cell = randomEmptyCell(g);
    if (!cell) return;
    const [r, c] = cell;
    g[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  function newGame() {
    grid = emptyGrid();
    score = 0;
    gameOver = false;
    won = false;
    wonAcknowledged = false;
    spawnTile(grid);
    spawnTile(grid);
    overlay.classList.remove('show');
    render(true);
  }

  function cloneGrid(g) {
    return g.map(row => row.slice());
  }

  function gridsEqual(a, b) {
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (a[r][c] !== b[r][c]) return false;
    return true;
  }

  // Compress + merge a single row to the left
  function slideRowLeft(row) {
    const vals = row.filter(v => v !== 0);
    const merged = [];
    let gained = 0;
    for (let i = 0; i < vals.length; i++) {
      if (i < vals.length - 1 && vals[i] === vals[i + 1]) {
        const mergedVal = vals[i] * 2;
        merged.push(mergedVal);
        gained += mergedVal;
        i++;
      } else {
        merged.push(vals[i]);
      }
    }
    while (merged.length < SIZE) merged.push(0);
    return { row: merged, gained };
  }

  function rotateGridLeft(g) {
    // returns new grid rotated 90deg counter-clockwise
    const out = emptyGrid();
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        out[SIZE - 1 - c][r] = g[r][c];
    return out;
  }

  function move(direction) {
    if (gameOver) return;
    let working = cloneGrid(grid);
    let rotations = 0;
    // normalize every direction to "left" by rotating
    if (direction === 'up') rotations = 3;
    else if (direction === 'right') rotations = 2;
    else if (direction === 'down') rotations = 1;

    for (let i = 0; i < rotations; i++) working = rotateGridLeft(working);

    let gainedTotal = 0;
    for (let r = 0; r < SIZE; r++) {
      const { row, gained } = slideRowLeft(working[r]);
      working[r] = row;
      gainedTotal += gained;
    }

    // rotate back
    const backRotations = (4 - rotations) % 4;
    for (let i = 0; i < backRotations; i++) working = rotateGridLeft(working);

    if (gridsEqual(working, grid)) return; // no-op move

    grid = working;
    score += gainedTotal;
    spawnTile(grid);

    if (score > best) {
      best = score;
      saveBest(best);
    }

    render();

    if (!won && grid.some(row => row.some(v => v >= 2048))) {
      won = true;
    }
    if (won && !wonAcknowledged) {
      wonAcknowledged = true;
      showOverlay('You hit 2048!', 'Keep going, or start a fresh board.');
      return;
    }
    if (!hasMovesLeft()) {
      gameOver = true;
      showOverlay('Game over', 'No more moves left.');
    }
  }

  function hasMovesLeft() {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) return true;
        const v = grid[r][c];
        if (c < SIZE - 1 && grid[r][c + 1] === v) return true;
        if (r < SIZE - 1 && grid[r + 1][c] === v) return true;
      }
    }
    return false;
  }

  function showOverlay(title, sub) {
    overlayTitle.textContent = title;
    overlaySub.textContent = sub;
    overlay.classList.add('show');
  }

  function render(fresh) {
    scoreEl.textContent = score;
    bestEl.textContent = best;

    boardEl.innerHTML = '';

    // background cells
    for (let i = 0; i < SIZE * SIZE; i++) {
      const bg = document.createElement('div');
      bg.className = 'cell-bg';
      boardEl.appendChild(bg);
    }

    const frameRect = boardEl.getBoundingClientRect();
    const cellSize = (frameRect.width - 10 * (SIZE - 1)) / SIZE;

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const v = grid[r][c];
        if (!v) continue;
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.textContent = v;
        tile.dataset.pop = fresh ? '0' : '1';
        tile.style.width = cellSize + 'px';
        tile.style.height = cellSize + 'px';
        tile.style.left = c * (cellSize + 10) + 'px';
        tile.style.top = r * (cellSize + 10) + 'px';
        tile.style.background = TILE_COLORS[v] || '#B8ADFF';
        tile.style.color = v <= 4 ? '#F4F1FF' : '#100C1E';
        tile.style.fontSize = (v >= 1024 ? cellSize * 0.32 : cellSize * 0.42) + 'px';
        boardEl.appendChild(tile);
      }
    }
  }

  // ---- input handling ----
  window.addEventListener('keydown', (e) => {
    const map = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right'
    };
    if (map[e.key]) {
      e.preventDefault();
      move(map[e.key]);
    }
  });

  let touchStartX = 0, touchStartY = 0;
  const frame = document.querySelector('.board-frame');
  frame.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  frame.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const absX = Math.abs(dx), absY = Math.abs(dy);
    const threshold = 24;
    if (Math.max(absX, absY) < threshold) return;
    if (absX > absY) {
      move(dx > 0 ? 'right' : 'left');
    } else {
      move(dy > 0 ? 'down' : 'up');
    }
  }, { passive: true });

  newGameBtn.addEventListener('click', newGame);
  overlayRestart.addEventListener('click', newGame);
  window.addEventListener('resize', () => render(true));

  // ---- init ----
  best = loadBest();
  newGame();
})();
