const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 200;

const game = {
    score: 0,
    gameOver: false,
    gameSpeed: 6
};

const dino = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    dy: 0,
    jumpPower: 15,
    iJumping: false,
    draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update() {
        if (this.iJumping) {
            this.dy += 0.6;
            this.y += this.dy;
            if (this.y >= 150) {
                this.y = 150;
                this.iJumping = false;
                this.dy = 0;
            }
        }
    },
    jump() {
        if (!this.iJumping) {
            this.iJumping = true;
            this.dy = -this.jumpPower;
        }
    }
};

const obstacles = [];

class Obstacle {
    constructor() {
        this.x = canvas.width;
        this.y = 160;
        this.width = 15;
        this.height = 40;
    }
    draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    update() {
        this.x -= game.gameSpeed;
    }
}

function spawnObstacle() {
    obstacles.push(new Obstacle());
}

function update() {
    dino.update();
    obstacles.forEach((obs, i) => {
        obs.update();
        if (obs.x < -obs.width) obstacles.splice(i, 1);
        if (collision(dino, obs)) {
            game.gameOver = true;
        }
    });
    game.score++;
}

function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
                 rect1.x + rect1.width > rect2.x &&
                 rect1.y < rect2.y + rect2.height &&
                 rect1.y + rect1.height > rect2.y;
}

function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${game.score}`, 10, 30);
    dino.draw();
    obstacles.forEach(obs => obs.draw());
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px Arial';
        ctx.fillText('GAME OVER', canvas.width / 2 - 100, canvas.height / 2);
    }
}

function gameLoop() {
    if (!game.gameOver) {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

    // Controles
    document.addEventListener("keydown", (e) => {
        switch (e.code){
            case "Space":
                toggleGame();
                break;

        case (e.key === 'ArrowUp' || e.key === 'w'):
            dino.jump();
            e.preventDefault();
            break;
        
        case (e.key === 'r' && game.gameOver):
            location.reload();
            e.preventDefault();
            break;
}    });

setInterval(() => {
    if (!game.gameOver) spawnObstacle();
}, 3000);

    let running = false;

gameLoop();

    function toggleGame() {
        if (running) {
            clearInterval(game);
            running = false;
        } else {
            game = setInterval(draw, 100);
            running = true;
        }
    }
