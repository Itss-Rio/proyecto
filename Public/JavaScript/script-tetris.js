    // Deshabilitar el click derecho, para que no molesten mis compañeros en las pruebas
    document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    });
const board = document.getElementById("tetris-board");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const gameOverEl = document.getElementById("game-over");

const COLS = 10;
const ROWS = 20;

let grid = [];
let currentPiece;
let posX = 3;
let posY = 0;

let score = 0;
let level = 1;
let dropInterval = 700;
let lastTime = 0;
let gameOver = false;

// PIEZAS
const PIECES = [
    [[1,1,1,1]],                  // I
    [[1,1],[1,1]],                // O
    [[0,1,0],[1,1,1]],            // T
    [[1,0,0],[1,1,1]],            // L
    [[0,0,1],[1,1,1]],            // J
    [[1,1,0],[0,1,1]],            // S
    [[0,1,1],[1,1,0]]             // Z
];

// INICIALIZAR
function init() {
    board.innerHTML = "";
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

    for (let i = 0; i < ROWS * COLS; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        board.appendChild(cell);
    }

    score = 0;
    level = 1;
    dropInterval = 700;
    gameOver = false;

    scoreEl.textContent = score;
    levelEl.textContent = level;
    gameOverEl.style.display = "none";

    newPiece();
    requestAnimationFrame(loop);
}

// GAME LOOP
function loop(time = 0) {
    if (gameOver) return;

    if (time - lastTime > dropInterval) {
        moveDown();
        lastTime = time;
    }

    draw();
    requestAnimationFrame(loop);
}

// PIEZA NUEVA
function newPiece() {
    currentPiece = PIECES[Math.floor(Math.random() * PIECES.length)];
    posX = 3;
    posY = 0;

    if (collision()) {
        gameOver = true;
        gameOverEl.style.display = "block";
    }
}

// DIBUJAR
function draw() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => cell.className = "cell");

    grid.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                cells[y * COLS + x].classList.add("filled");
            }
        });
    });

    currentPiece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const index = (posY + y) * COLS + (posX + x);
                cells[index]?.classList.add("active");
            }
        });
    });
}

// MOVIMIENTO
function moveDown() {
    posY++;
    if (collision()) {
        posY--;
        merge();
        clearLines();
        newPiece();
    }
}

function move(dir) {
    posX += dir;
    if (collision()) posX -= dir;
}

function rotate() {
    const rotated = currentPiece[0].map((_, i) =>
        currentPiece.map(row => row[i]).reverse()
    );

    const backup = currentPiece;
    currentPiece = rotated;
    if (collision()) currentPiece = backup;
}

// COLISION
function collision() {
    return currentPiece.some((row, y) =>
        row.some((value, x) => {
            if (!value) return false;
            const newX = posX + x;
            const newY = posY + y;
            return (
                newX < 0 ||
                newX >= COLS ||
                newY >= ROWS ||
                grid[newY]?.[newX]
            );
        })
    );
}

// FIJAR PIEZA
function merge() {
    currentPiece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) grid[posY + y][posX + x] = 1;
        });
    });
}

// LIMPIAR LINEAS
function clearLines() {
    let lines = 0;

    grid = grid.filter(row => {
        if (row.every(cell => cell)) {
            lines++;
            return false;
        }
        return true;
    });

    while (grid.length < ROWS) {
        grid.unshift(Array(COLS).fill(0));
    }

    if (lines > 0) {
        score += lines * 10;
        scoreEl.textContent = score;

        if (score % 50 === 0) {
            level++;
            levelEl.textContent = level;
            dropInterval = Math.max(150, dropInterval - 80);
        }
    }
}

// CONTROLES
document.addEventListener("keydown", e => {
    if (gameOver && e.code === "Space") init();

    if (e.code === "ArrowLeft") move(-1);
    if (e.code === "ArrowRight") move(1);
    if (e.code === "ArrowDown") moveDown();
    if (e.code === "ArrowUp") rotate();
});

// BLOQUEAR CLICK DERECHO
document.addEventListener("contextmenu", e => e.preventDefault());

// START
init();
