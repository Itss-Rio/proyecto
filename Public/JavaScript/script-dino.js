// GAME LOOP
var time = new Date();
var deltaTime = 0;

if(document.readyState === "complete" || document.readyState === "interactive"){
    setTimeout(Init, 1);
}else{
    document.addEventListener("DOMContentLoaded", Init); 
}

 /*Funcion para inicializar los elementos del juego*/
function Init() {
    time = new Date();
    Start();
    Loop();
}

 /*Funcion para ejecutar el bucle principal del juego*/
function Loop() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    Update();
    requestAnimationFrame(Loop);
}

// LÓGICA DEL JUEGO
// FÍSICA AJUSTADA (SALTO CORTO Y RÁPIDO) 
var sueloY = 50; 
var velY = 0;
var impulso = 1500; 
var gravedad = 6000; 

var dinoPosX = 50;
var dinoPosY = sueloY; 

var sueloX = 0;
var velEscenario = 1800/3; 
var gameVel = 1.2; 
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
var contenedor, dino, textoScore, suelo, gameOver;

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
    velY -= gravedad * deltaTime;
}

function HandleKeyDown(ev){
    if(ev.keyCode == 32){ 
        if(parado) ReiniciarJuego();
        else Saltar();
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
    if(dinoPosY < sueloY) TocarSuelo();
    dino.style.bottom = dinoPosY + "px";
}

function TocarSuelo() {
    dinoPosY = sueloY;
    velY = 0;
    if(saltando) dino.classList.add("dino-corriendo");
    saltando = false;
}

function MoverSuelo() {
    sueloX += CalcularDesplazamiento();
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
    if(tiempoHastaObstaculo <= 0) CrearObstaculo();
}

function DecidirCrearNubes() {
    tiempoHastaNube -= deltaTime;
    if(tiempoHastaNube <= 0) CrearNube();
}

function CrearObstaculo() {
    var obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("cactus");
    if(Math.random() > 0.5) obstaculo.classList.add("cactus2");
    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth + "px";
    obstaculo.style.bottom = obstaculoPosY + "px";
    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin) / gameVel;
}

function CrearNube() {
    var nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth;
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
    if(score == 10) contenedor.classList.add("mañana");
    else if(score == 25) contenedor.classList.add("mediodia");
    else if(score == 50) contenedor.classList.add("tarde");
    else if(score == 75) contenedor.classList.add("anochecer");
    else if(score == 100) contenedor.classList.add("noche");
    if(score % 5 == 0) gameVel += 0.1;
}

/* Condicion para que el juego termine */
function GameOver() {
    Estrellarse();
    gameOver.style.display = "block";
    enviarPuntuacion('dino', score); // Cambiado para coincidir con tu BD
}

function DetectarColision() {
    for (var i = 0; i < obstaculos.length; i++) {
        if(obstaculos[i].posX > dinoPosX + dino.clientWidth) break; 
        else if(IsCollision(dino, obstaculos[i], 10, 25, 15, 20)) GameOver();
    }
}

function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();
    return !(((aRect.top + aRect.height - paddingBottom) < (bRect.top)) || (aRect.top + paddingTop > (bRect.top + bRect.height)) || ((aRect.left + aRect.width - paddingRight) < bRect.left) || (aRect.left + paddingLeft > (bRect.left + bRect.width)));
}

function ReiniciarJuego() {
    score = 0; gameVel = 1.2; textoScore.innerText = score; parado = false; saltando = false;
    tiempoHastaObstaculo = 2; gameOver.style.display = "none";
    contenedor.classList.remove("mañana","mediodia", "tarde", "anochecer","noche");
    dino.classList.remove("dino-estrellado"); dino.classList.add("dino-corriendo");
    dinoPosY = sueloY; velY = 0; dino.style.bottom = dinoPosY + "px";
    obstaculos.forEach(obs => obs.remove()); obstaculos = [];
    nubes.forEach(nube => nube.remove()); nubes = [];
}

document.addEventListener('contextmenu', function(e) { e.preventDefault(); });

function enviarPuntuacion(game, puntos) {
    fetch('/api/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: game, score: puntos })
    })
    .then(res => res.json())
    .then(data => console.log(data.success ? "Puntuación guardada" : "Error: " + data.error))
    .catch(err => console.error("Error conexión:", err));
}