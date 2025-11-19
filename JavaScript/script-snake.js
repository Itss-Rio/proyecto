window.addEventListener("DOMContentLoaded", () => {
    const gameArea = document.getElementById("game-area-snake");
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    canvas.style.borderRadius = "10px";
    gameArea.innerHTML = "";
    gameArea.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    //Cuadrados
    const box = 20;
    //Spawn inicial
    let snake = [{ x: 125, y: 100 }];
    let meganum = Math.floor(Math.random() * 4) + 1;
    let direction;

    // Direccion inicial del snake
    switch (meganum){
        case 1:
            direction = "UP";
            break;

        case 2:
            direction = "RIGHT";
            break;

        case 3:
            direction = "DOWN";
            break;

        default:
            direction = "LEFT";
    }

    let food = randomFood();
    let score = 0;
    let game = null;
    let running = false;

    function randomFood() {
        return {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box
        };
    }

    // Controles
    document.addEventListener("keydown", (e) => {
        switch (e.code){
            case "Space":
                toggleGame();
                break;

            // Movimiento con flechas
            case "ArrowLeft":
                if (direction === "RIGHT") {break;}
                direction = "LEFT";
                break;

            case "ArrowUp":
                if (direction === "DOWN") {break;}
                direction = "UP";
                break;

            case "ArrowRight":
                if (direction === "LEFT") {break;}
                direction = "RIGHT";
                break;

            case "ArrowDown":
                if (direction === "UP") {break;}
                direction = "DOWN";
                break;
            
            // Movimiento con letras
            case "KeyA":
                if (direction === "RIGHT") {break;}
                direction = "LEFT";
                break;

            case "KeyW":
                if (direction === "DOWN") {break;}
                direction = "UP";
                break;

            case "KeyD":
                if (direction === "LEFT") {break;}
                direction = "RIGHT";
                break;

            case "KeyS":
                if (direction === "UP") {break;}
                direction = "DOWN";
                break;
        };
    });

    // Deshabilitar el click derecho, para que no molesten mis compañeros en las pruebas
    document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    });

    function toggleGame() {
        if (running) {
            clearInterval(game);
            running = false;
        } else {
            game = setInterval(draw, 100);
            running = true;
        }
    }

    function drawGrid() {
        ctx.strokeStyle = '#006600';
        for(let x=0; x<canvas.width; x+=box){
            ctx.beginPath();
            ctx.moveTo(x,0);
            ctx.lineTo(x,canvas.height);
            ctx.stroke();
        }
        for(let y=0; y<canvas.height; y+=box){
            ctx.beginPath();
            ctx.moveTo(0,y);
            ctx.lineTo(canvas.width,y);
            ctx.stroke();
        }
    }

    function draw() {
        // Fondo y grid
        ctx.fillStyle = "#004d00";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGrid();

        // Comida con neón
        ctx.fillStyle = "red";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 15;
        ctx.fillRect(food.x, food.y, box, box);
        ctx.shadowBlur = 0;

        // Serpiente con neón
        for (let i = 0; i < snake.length; i++) {
            ctx.fillStyle = i === 0 ? "#00ffc8" : "#00b38f";
            ctx.shadowColor = "#00ffc8";
            ctx.shadowBlur = 10;
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
            ctx.shadowBlur = 0;
        }

        // Movimiento
        let headX = snake[0].x;
        let headY = snake[0].y;

        switch (direction){
            case "LEFT":
                headX -= box;
                break;
            
            case "UP":
                headY -= box;
                break;
            
            case "RIGHT":
                headX += box;
                break;

            case "DOWN":
                headY += box;
                break;
        }

        // Comer
        if (headX === food.x && headY === food.y) {
            score++;
            food = randomFood();
        } else {
            snake.pop();
        }

        const newHead = { x: headX, y: headY };

        // Colisiones
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

        snake.unshift(newHead);

        // Puntuación con glow
        ctx.fillStyle = "#00ffc8";
        ctx.font = "16px 'Press Start 2P', monospace";
        ctx.shadowColor = "#00ffc8";
        ctx.shadowBlur = 10;
        ctx.fillText("SCORE: " + score, 10, canvas.height - 10);
        ctx.shadowBlur = 0;
    }

    function resetGame() {
        snake = [{ x: 200, y: 200 }];
        direction = "RIGHT";
        score = 0;
        food = randomFood();
    }

    function randomFood() {
        let newFood;
        let collision;
        do {
            collision = false;
            newFood = {
                x: Math.floor(Math.random() * (canvas.width / box)) * box,
                y: Math.floor(Math.random() * (canvas.height / box)) * box
            };
            // Revisar si la nueva posición coincide con alguna parte de la serpiente
            for (let i = 1; i < snake.length; i++) {
                if (snake[i].x === newFood.x && snake[i].y === newFood.y) {
                    collision = true;
                    break;
                }
            }
        } while (collision);
        return newFood;
    }

    // Mensaje inicial
    ctx.fillStyle = "#00ffc8";
    ctx.font = "16px 'Press Start 2P', monospace";
    ctx.shadowColor = "#00ffc8";
    ctx.shadowBlur = 10;
    ctx.fillText("Presiona ESPACIO para jugar", 25, canvas.height / 2);
    ctx.shadowBlur = 0;
});
