window.addEventListener("DOMContentLoaded", () => {
    // CONFIGURACIÓN DEL CANVAS
    const gameArea = document.getElementById("game-area-snake");
    const canvas = document.createElement("canvas");
    canvas.width = 500; canvas.height = 500; canvas.style.borderRadius = "10px";
    gameArea.innerHTML = ""; gameArea.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    // VARIABLES DEL JUEGO
    const box = 20;
    let snake = [{ x: 100, y: 100 }];
    let spawnDIR = Math.floor(Math.random() * 4) + 1;
    let direction;
    switch (spawnDIR) {
        case 1: direction = "UP"; break;
        case 2: direction = "RIGHT"; break;
        case 3: direction = "DOWN"; break;
        default: direction = "LEFT";
    }

    let food = randomFood();
    let score = 0;
    let game = null;
    let running = false;

    // CONTROLES DE TECLADO
    document.addEventListener("keydown", (e) => {
        switch (e.code) {
            case "Space": toggleGame(); break;
            case "ArrowLeft": case "KeyA": if (direction !== "RIGHT") direction = "LEFT"; break;
            case "ArrowUp": case "KeyW": if (direction !== "DOWN") direction = "UP"; break;
            case "ArrowRight": case "KeyD": if (direction !== "LEFT") direction = "RIGHT"; break;
            case "ArrowDown": case "KeyS": if (direction !== "UP") direction = "DOWN"; break;
        }
    });

    function toggleGame() {
        if (running) { clearInterval(game); running = false; }
        else { game = setInterval(draw, 100); running = true; }
    }

    function drawGrid() {
        ctx.strokeStyle = "#006600";
        for (let x = 0; x < canvas.width; x += box) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
        for (let y = 0; y < canvas.height; y += box) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    }

    function draw() {
        ctx.fillStyle = "#004d00"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGrid();

        // Comida
        ctx.fillStyle = "red"; ctx.shadowColor = "#ff0000"; ctx.shadowBlur = 15;
        ctx.fillRect(food.x, food.y, box, box); ctx.shadowBlur = 0;

        // Serpiente
        for (let i = 0; i < snake.length; i++) {
            ctx.fillStyle = i === 0 ? "#00ffc8" : "#00b38f";
            ctx.shadowColor = "#00ffc8"; ctx.shadowBlur = 10;
            ctx.fillRect(snake[i].x, snake[i].y, box, box); ctx.shadowBlur = 0;
        }

        let headX = snake[0].x; let headY = snake[0].y;
        if (direction === "LEFT") headX -= box;
        if (direction === "UP") headY -= box;
        if (direction === "RIGHT") headX += box;
        if (direction === "DOWN") headY += box;

        if (headX === food.x && headY === food.y) {
            score++; food = randomFood();
        } else {
            snake.pop();
        }

        const newHead = { x: headX, y: headY };

        // COLISIONES Y GUARDADO
        if (headX < 0 || headY < 0 || headX >= canvas.width || headY >= canvas.height || snake.some(seg => seg.x === headX && seg.y === headY)) {
            clearInterval(game); running = false;
            enviarPuntuacion('score_snake', score); // Cambiado para tu BD
            setTimeout(() => { alert("Perdiste! Puntuación: " + score); resetGame(); }, 100);
            return;
        }

        snake.unshift(newHead);
        ctx.fillStyle = "#00ffc8"; ctx.font = "16px 'Press Start 2P', monospace";
        ctx.fillText("SCORE: " + score, 10, canvas.height - 10);
    }

    function resetGame() { snake = [{ x: 200, y: 200 }]; direction = "RIGHT"; score = 0; food = randomFood(); }

    function randomFood() {
        let newFood; let collision;
        do {
            collision = false;
            newFood = { x: Math.floor(Math.random() * (canvas.width / box)) * box, y: Math.floor(Math.random() * (canvas.height / box)) * box };
            for (let i = 1; i < snake.length; i++) { if (snake[i].x === newFood.x && snake[i].y === newFood.y) collision = true; }
        } while (collision);
        return newFood;
    }

    ctx.fillStyle = "#00ffc8"; ctx.font = "16px 'Press Start 2P', monospace";
    ctx.fillText("Presiona ESPACIO para jugar", 25, canvas.height / 2);
});

function enviarPuntuacion(columnaBD, puntos) {
    fetch('/api/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: columnaBD, score: puntos })
    })
    .then(res => res.json())
    .catch(err => console.error(err));
}