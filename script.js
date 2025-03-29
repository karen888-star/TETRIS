const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

let score = 0;
let gameOver = false;

const matrix = [
  [1, 1, 1],
  [0, 1, 0],
]

const player = {
  pos: { x: 4, y: 0 },
  matrix: matrix
};

const arena = createMatrix(12, 20);

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
           arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerReset() {
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    endGame();
  }
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    score += rowCount * 10;
    rowCount *= 2;
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = 'red';
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  if (gameOver) return;
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

function updateScore() {
  document.getElementById('score').innerText = score;
}

function endGame() {
  gameOver = true;
  document.getElementById('game-over').style.display = 'block';
  const name = prompt("Game Over. Ingresa tu nombre:");
  if (name) saveHighScore(name, score);
  showRanking();
}

function startGame() {
  Object.assign(player, { pos: { x: 4, y: 0 }, matrix });
  for (let y = 0; y < arena.length; y++) {
    arena[y].fill(0);
  }
  score = 0;
  gameOver = false;
  document.getElementById('game-over').style.display = 'none';
  updateScore();
  update();
}

function saveHighScore(name, score) {
  const highscore = JSON.parse(localStorage.getItem('tetrisHighScore')) || { name: '', score: 0 };
  if (score > highscore.score) {
    localStorage.setItem('tetrisHighScore', JSON.stringify({ name, score }));
  }
}

function showRanking() {
  const highscore = JSON.parse(localStorage.getItem('tetrisHighScore')) || { name: '-', score: 0 };
  const list = document.getElementById('ranking');
  list.innerHTML = '';
  const li = document.createElement('li');
  li.textContent = `${highscore.name} - ${highscore.score}`;
  list.appendChild(li);
}

showRanking();
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') playerMove(-1);
  else if (event.key === 'ArrowRight') playerMove(1);
  else if (event.key === 'ArrowDown') playerDrop();
});
