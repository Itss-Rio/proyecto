//****** GAME LOOP ********//

var time = new Date();
var deltaTime = 0;

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
var sueloY = 50; // La base del juego (altura del suelo en CSS)
var velY = 0;
var impulso = 1000; // Impulso de salto (fuerza inicial)
var gravedad = 6000; // Fuerza de gravedad (caída rápida)

var dinoPosX = 50;
var dinoPosY = sueloY; 

var sueloX = 0;
var velEscenario = 1800/3; // Aumentada para una pantalla de 1400px para sentir más velocidad
var gameVel = 1.2; // Velocidad base ligeramente mayor para movimiento inicial
var score = 0;

var parado = false;
var saltando = false;

// OBSTÁCULOS
var tiempoHastaObstaculo = 2;
var tiempoObstaculoMin = 0.7;
var tiempoObstaculoMax = 1.8;
var obstaculoPosY = 50; 
var obstaculos = [];

// NUBES
var tiempoHastaNube = 0.5;
var tiempoNubeMin = 0.7;
var tiempoNubeMax = 2.7;
var maxNubeY = 350; 
var minNubeY = 150; 
var nubes = [];
var velNube = 0.5;

// ELEMENTOS HTML
var contenedor;
var dino;
var textoScore;
var suelo;
var gameOver;

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
    var obstaculo = document.createElement("div");
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
    var nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth; // Aparece desde el borde derecho (1400px)
    nube.style.left = contenedor.clientWidth + "px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY - minNubeY) + "px";
    
    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax - tiempoNubeMin) / velNube;
}

function MoverObstaculos() {
    for (var i = obstaculos.length - 1; i >= 0; i--) {
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
    for (var i = nubes.length - 1; i >= 0; i--) {
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
    
    if(score == 10) contenedor.classList.add("mediodia");
    else if(score == 25) contenedor.classList.add("tarde");
    else if(score == 50) contenedor.classList.add("noche");
    
    if(score % 5 == 0) gameVel += 0.1;
}

function GameOver() {
    Estrellarse();
    gameOver.style.display = "block";
}

function DetectarColision() {
    for (var i = 0; i < obstaculos.length; i++) {
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
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

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
    contenedor.classList.remove("mediodia", "tarde", "noche");
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