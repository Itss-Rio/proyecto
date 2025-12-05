//****** GAME LOOP ********//

let time = new Date();
let deltaTime = 0;

if(document.readyState === "complete" || document.readyState === "interactive"){
    setTimeout(Init, 1);
}else{
    document.addEventListener("DOMContentLoaded", Init); 
}

function Init() {
    time = new Date();
    Start();
    Loop();
}

function Loop() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    Update();
    requestAnimationFrame(Loop);
}

//****** LÓGICA DEL JUEGO ********//

// --- FÍSICA AJUSTADA (SALTO CORTO Y RÁPIDO) ---
let sueloY = 50; // La base del juego (altura del suelo en CSS)
let velY = 0;
let impulso = 1500; // Impulso de salto (fuerza inicial)
let gravedad = 6000; // Fuerza de gravedad (caída rápida)

let dinoPosX = 50;
let dinoPosY = sueloY; 

let sueloX = 0;
let velEscenario = 1800/3; // Aumentada para una pantalla de 1400px para sentir más velocidad
let gameVel = 1.2; // Velocidad base ligeramente mayor para movimiento inicial
let score = 0;

let parado = false;
let saltando = false;

// OBSTÁCULOS
let tiempoHastaObstaculo = 2;
let tiempoObstaculoMin = 0.7;
let tiempoObstaculoMax = 1.8;
let obstaculoPosY = 50; 
let obstaculos = [];

// NUBES
let tiempoHastaNube = 0.5;
let tiempoNubeMin = 0.7;
let tiempoNubeMax = 2.7;
let maxNubeY = 350; 
let minNubeY = 150; 
let nubes = [];
let velNube = 0.5;

// ELEMENTOS HTML
let contenedor;
let dino;
let textoScore;
let suelo;
let gameOver;

function Start() {
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    dino = document.querySelector(".dino");
    
    document.addEventListener("keydown", HandleKeyDown);
}

function Update() {
    if(parado) return; 
    
    MoverDinosaurio();
    MoverSuelo();
    DecidirCrearObstaculos();
    DecidirCrearNubes();
    MoverObstaculos();
    MoverNubes();
    DetectarColision();

    // Aplicar gravedad
    velY -= gravedad * deltaTime;
}

function HandleKeyDown(ev){
    if(ev.keyCode == 32){ // ESPACIO
        if(parado){
            ReiniciarJuego();
        } else {
            Saltar();
        }
    }
}

function Saltar(){
    if(dinoPosY === sueloY){
        saltando = true;
        velY = impulso;
        dino.classList.remove("dino-corriendo");
    }
}

function MoverDinosaurio() {
    dinoPosY += velY * deltaTime;
    if(dinoPosY < sueloY){
        TocarSuelo();
    }
    dino.style.bottom = dinoPosY + "px";
}

function TocarSuelo() {
    dinoPosY = sueloY;
    velY = 0;
    if(saltando){
        dino.classList.add("dino-corriendo");
    }
    saltando = false;
}

function MoverSuelo() {
    sueloX += CalcularDesplazamiento();
    // Usamos contenedor.clientWidth (1400px) para asegurar que el suelo se repita correctamente
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

function CalcularDesplazamiento() {
    return velEscenario * deltaTime * gameVel;
}

function Estrellarse() {
    dino.classList.remove("dino-corriendo");
    dino.classList.add("dino-estrellado");
    parado = true;
}

function DecidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if(tiempoHastaObstaculo <= 0) {
        CrearObstaculo();
    }
}

function DecidirCrearNubes() {
    tiempoHastaNube -= deltaTime;
    if(tiempoHastaNube <= 0) {
        CrearNube();
    }
}

function CrearObstaculo() {
    let obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("cactus");
    if(Math.random() > 0.5) obstaculo.classList.add("cactus2");
    obstaculo.posX = contenedor.clientWidth; // Aparece desde el borde derecho (1400px)
    obstaculo.style.left = contenedor.clientWidth + "px";
    obstaculo.style.bottom = obstaculoPosY + "px";

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin) / gameVel;
}

function CrearNube() {
    let nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth; // Aparece desde el borde derecho (1400px)
    nube.style.left = contenedor.clientWidth + "px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY - minNubeY) + "px";
    
    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax - tiempoNubeMin) / velNube;
}

function MoverObstaculos() {
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        if(obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            GanarPuntos();
        }else{
            obstaculos[i].posX -= CalcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX + "px";
        }
    }
}

function MoverNubes() {
    for (let i = nubes.length - 1; i >= 0; i--) {
        if(nubes[i].posX < -nubes[i].clientWidth) {
            nubes[i].parentNode.removeChild(nubes[i]);
            nubes.splice(i, 1);
        }else{
            nubes[i].posX -= CalcularDesplazamiento() * velNube;
            nubes[i].style.left = nubes[i].posX + "px";
        }
    }
}

function GanarPuntos() {
    score++;
    textoScore.innerText = score;
    
    if(score == 10) contenedor.classList.add("mañana");
    else if(score == 25) contenedor.classList.add("mediodia");
    else if(score == 50) contenedor.classList.add("tarde");
    else if(score == 75) contenedor.classList.add("anochecer");
    else if(score == 100) contenedor.classList.add("noche");
    
    if(score % 5 == 0) gameVel += 0.1;
}

function GameOver() {
    Estrellarse();
    gameOver.style.display = "block";
}

function DetectarColision() {
    for (let i = 0; i < obstaculos.length; i++) {
        if(obstaculos[i].posX > dinoPosX + dino.clientWidth) {
            break; 
        }else{
            // Ajustar los márgenes de colisión para ser más permisivos (los números están en px)
            if(IsCollision(dino, obstaculos[i], 10, 25, 15, 20)) {
                GameOver();
            }
        }
    }
}

function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}

function ReiniciarJuego() {
    score = 0;
    gameVel = 1.2; // Reiniciar a la velocidad base ajustada
    textoScore.innerText = score;
    parado = false;
    saltando = false;
    tiempoHastaObstaculo = 2;
    
    gameOver.style.display = "none";
    contenedor.classList.remove("mañana","mediodia", "tarde", "anochecer","noche");
    dino.classList.remove("dino-estrellado");
    dino.classList.add("dino-corriendo");
    
    dinoPosY = sueloY;
    velY = 0;
    dino.style.bottom = dinoPosY + "px";
    
    // BORRAR OBSTACULOS VIEJOS
    obstaculos.forEach(obs => obs.remove());
    obstaculos = [];
    
    // BORRAR NUBES VIEJAS
    nubes.forEach(nube => nube.remove());
    nubes = [];
}

    // Deshabilitar el click derecho, para que no molesten mis compañeros en las pruebas
    document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    });
