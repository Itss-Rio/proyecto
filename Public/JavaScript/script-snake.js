// Espera a que el DOM esté completamente cargado
window.addEventListener("DOMContentLoaded", () => {

    // CONFIGURACIÓN DEL CANVAS

    const gameArea = document.getElementById("game-area-snake");
    const canvas = document.createElement("canvas");

    // Tamaño del área de juego
    canvas.width = 500;
    canvas.height = 500;
    canvas.style.borderRadius = "10px";

    // Limpiar el contenedor y añadir el canvas
    gameArea.innerHTML = "";
    gameArea.appendChild(canvas);

    // Contexto 2D para dibujar
    const ctx = canvas.getContext("2d");

    // VARIABLES DEL JUEGO

    // Tamaño de cada casilla
    const box = 20;

    // Serpiente (empieza con un solo segmento)
    let snake = [{ x: 100, y: 100 }];

    // Dirección inicial aleatoria
    let spawnDIR = Math.floor(Math.random() * 4) + 1;
    let direction;

    // Asignar dirección inicial
    switch (spawnDIR) {
        case 1: direction = "UP"; break;
        case 2: direction = "RIGHT"; break;
        case 3: direction = "DOWN"; break;
        default: direction = "LEFT";
    }

    // Comida inicial
    let food = randomFood();

    // Puntuación
    let score = 0;

    // Control del juego
    let game = null;
    let running = false;

    // CONTROLES DE TECLADO

    document.addEventListener("keydown", (e) => {
        switch (e.code) {

            // Pausar / reanudar con espacio
            case "Space":
                toggleGame();
                break;

            // Flechas
            case "ArrowLeft":
            case "KeyA":
                if (direction !== "RIGHT") direction = "LEFT";
                break;

            case "ArrowUp":
            case "KeyW":
                if (direction !== "DOWN") direction = "UP";
                break;

            case "ArrowRight":
            case "KeyD":
                if (direction !== "LEFT") direction = "RIGHT";
                break;

            case "ArrowDown":
            case "KeyS":
                if (direction !== "UP") direction = "DOWN";
                break;
        }
    });

    
      // INICIAR / PAUSAR JUEGO

    function toggleGame() {
        if (running) {
            clearInterval(game);
            running = false;
        } else {
            game = setInterval(draw, 100);
            running = true;
        }
    }

    // DIBUJAR LA CUADRÍCULA

    function drawGrid() {
        ctx.strokeStyle = "#006600";

        // Líneas verticales
        for (let x = 0; x < canvas.width; x += box) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // Líneas horizontales
        for (let y = 0; y < canvas.height; y += box) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    // FUNCIÓN PRINCIPAL DEL JUEGO


    function draw() {

        // Fondo
        ctx.fillStyle = "#004d00";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGrid();

        // Dibujar comida (con efecto neón)
        ctx.fillStyle = "red";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 15;
        ctx.fillRect(food.x, food.y, box, box);
        ctx.shadowBlur = 0;

        // Dibujar serpiente
        for (let i = 0; i < snake.length; i++) {
            ctx.fillStyle = i === 0 ? "#00ffc8" : "#00b38f";
            ctx.shadowColor = "#00ffc8";
            ctx.shadowBlur = 10;
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
            ctx.shadowBlur = 0;
        }

        // Posición actual de la cabeza
        let headX = snake[0].x;
        let headY = snake[0].y;

        // Movimiento según dirección
        switch (direction) {
            case "LEFT": headX -= box; break;
            case "UP": headY -= box; break;
            case "RIGHT": headX += box; break;
            case "DOWN": headY += box; break;
        }

        // Comer comida
        if (headX === food.x && headY === food.y) {
            score++;
            food = randomFood();
        } else {
            // Eliminar último segmento si no come
            snake.pop();
        }

        const newHead = { x: headX, y: headY };

        // Colisiones (pared o consigo misma)
        if (
            headX < 0 || headY < 0 ||
            headX >= canvas.width || headY >= canvas.height ||
            snake.some(seg => seg.x === headX && seg.y === headY)
        ) {
            clearInterval(game);
            running = false;

            setTimeout(() => {
                alert("Perdiste! Puntuación: " + score);
                resetGame();
            }, 100);
            return;
        }

        // Añadir nueva cabeza
        snake.unshift(newHead);

        // Mostrar puntuación
        ctx.fillStyle = "#00ffc8";
        ctx.font = "16px 'Press Start 2P', monospace";
        ctx.shadowColor = "#00ffc8";
        ctx.shadowBlur = 10;
        ctx.fillText("SCORE: " + score, 10, canvas.height - 10);
        ctx.shadowBlur = 0;
    }

    // REINICIAR JUEGO

    function resetGame() {
        snake = [{ x: 200, y: 200 }];
        direction = "RIGHT";
        score = 0;
        food = randomFood();
    }


//       GENERAR COMIDA ALEATORIA


    function randomFood() {
        let newFood;
        let collision;

        do {
            collision = false;
            newFood = {
                x: Math.floor(Math.random() * (canvas.width / box)) * box,
                y: Math.floor(Math.random() * (canvas.height / box)) * box
            };

            // Evitar que aparezca sobre la serpiente
            for (let i = 1; i < snake.length; i++) {
                if (snake[i].x === newFood.x && snake[i].y === newFood.y) {
                    collision = true;
                    break;
                }
            }
        } while (collision);

        return newFood;
    }

      // MENSAJE INICIAL

    ctx.fillStyle = "#00ffc8";
    ctx.font = "16px 'Press Start 2P', monospace";
    ctx.shadowColor = "#00ffc8";
    ctx.shadowBlur = 10;
    ctx.fillText("Presiona ESPACIO para jugar", 25, canvas.height / 2);
    ctx.shadowBlur = 0;
});

// Deshabilitar clic derecho (para evitar molestias en pruebas)
document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});
