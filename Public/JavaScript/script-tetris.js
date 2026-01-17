const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const mensaje = document.getElementById("mensaje");

const BLOCK_SIZE = 30;
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
const COLS = 10; const ROWS = 20;

const COLORS = [null, "#00ffc8", "#6c5ce7", "#ff7675", "#fdcb6e", "#74b9ff", "#55efc4", "#fab1a0"];
const PIECES = [[[1, 1, 1, 1]], [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 1], [1, 1, 0]], [[0, 1, 0], [1, 1, 1]], [[1, 1, 0], [0, 1, 1]]];

let board = createBoard();
let score = 0;
let gameStarted = false;
let player = { pos: { x: 0, y: 0 }, shape: null, color: null };

function createBoard() { return Array.from({ length: ROWS }, () => Array(COLS).fill(0)); }

function resetPlayer() {
    const index = Math.floor(Math.random() * PIECES.length);
    player.shape = PIECES[index]; player.color = COLORS[index + 1];
    player.pos.y = 0; player.pos.x = Math.floor(COLS / 2) - Math.floor(player.shape[0].length / 2);
    if (collide(board, player)) gameOver();
}

function collide(board, player) {
    const [m, o] = [player.shape, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) return true;
        }
    }
    return false;
}

function merge(board, player) {
    player.shape.forEach((row, y) => {
        row.forEach((value, x) => { if (value !== 0) board[y + player.pos.y][x + player.pos.x] = player.color; });
    });
}

function rotate(matrix) { return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse()); }

function playerRotate() {
    const pos = player.pos.x; let offset = 1; const oldShape = player.shape;
    player.shape = rotate(player.shape);
    while (collide(board, player)) {
        player.pos.x += offset; offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.shape[0].length) { player.shape = oldShape; player.pos.x = pos; return; }
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(board, player)) { player.pos.y--; merge(board, player); resetPlayer(); clearLines(); }
    dropCounter = 0;
}

function playerMove(dir) { player.pos.x += dir; if (collide(board, player)) player.pos.x -= dir; }

function clearLines() {
    let rowCount = 1;
    outer: for (let y = board.length - 1; y >= 0; --y) {
        for (let x = 0; x < board[y].length; ++x) { if (board[y][x] === 0) continue outer; }
        const row = board.splice(y, 1)[0].fill(0); board.unshift(row); ++y;
        score += rowCount * 10; rowCount *= 2;
    }
    scoreEl.innerText = score;
}

function draw() {
    ctx.fillStyle = "#111"; ctx.fillRect(0, 0, COLS, ROWS);
    drawMatrix(board, { x: 0, y: 0 });
    drawMatrix(player.shape, player.pos, player.color);
}

function drawMatrix(matrix, offset, color = null) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => { if (value !== 0) { ctx.fillStyle = color || value; ctx.fillRect(x + offset.x, y + offset.y, 1, 1); } });
    });
}

let dropCounter = 0; let dropInterval = 1000; let lastTime = 0;

function update(time = 0) {
    if (!gameStarted) return;
    const deltaTime = time - lastTime; lastTime = time;
    dropCounter += deltaTime; if (dropCounter > dropInterval) playerDrop();
    draw(); requestAnimationFrame(update);
}

function gameOver() {
    gameStarted = false;
    mensaje.style.display = "flex";
    mensaje.innerHTML = "GAME OVER<br><span>ESPACIO PARA REINTENTAR</span>";
    enviarPuntuacion('score_tetris', score); // Cambiado para tu BD
}

function startGame() {
    board = createBoard(); score = 0; scoreEl.innerText = score;
    mensaje.style.display = "none"; resetPlayer(); gameStarted = true;
    lastTime = 0; update();
}

document.addEventListener("keydown", event => {
    if (event.code === "Space" && !gameStarted) startGame();
    if (!gameStarted) return;
    if (event.code === "ArrowLeft") playerMove(-1);
    else if (event.code === "ArrowRight") playerMove(1);
    else if (event.code === "ArrowDown") playerDrop();
    else if (event.code === "ArrowUp") playerRotate();
});

draw();

function enviarPuntuacion(columnaBD, puntos) {
    fetch('/api/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: columnaBD, score: puntos })
    })
    .then(res => res.json())
    .catch(err => console.error(err));
}