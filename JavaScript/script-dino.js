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

//****** GAME LOGIC ********//

// --- FÍSICAS ESCALADAS PARA PANTALLA DOBLE ---
// Hemos duplicado aproximadamente la gravedad y el impulso 
// para que se sienta bien en una pantalla del doble de alto.
var sueloY = 42; 
var velY = 0;
var impulso = 1800; // Antes 900
var gravedad = 5000; // Antes 2500

var dinoPosX = 50;
var dinoPosY = sueloY; 

var sueloX = 0;
var velEscenario = 1280/3;
var gameVel = 1;
var score = 0;

var parado = false;
var saltando = false;

// Tiempos ajustados
var tiempoHastaObstaculo = 2.5; // Un poco más de tiempo inicial
var tiempoObstaculoMin = 0.7;
var tiempoObstaculoMax = 1.8;
var obstaculoPosY = 30; // Ajustado al nuevo suelo
var obstaculos = [];

var tiempoHastaNube = 0.5;
var tiempoNubeMin = 0.7;
var tiempoNubeMax = 2.7;
var maxNubeY = 520; // Altura máxima nube duplicada
var minNubeY = 200; // Altura mínima nube duplicada
var nubes = [];
var velNube = 0.5;

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
    if(parado) return; // Si está parado, no actualiza nada
    
    MoverDinosaurio();
    MoverSuelo();
    DecidirCrearObstaculos();
    DecidirCrearNubes();
    MoverObstaculos();
    MoverNubes();
    DetectarColision();

    velY -= gravedad * deltaTime;
}

// --- NUEVA LÓGICA DE TECLADO CON REINICIO ---
function HandleKeyDown(ev){
    if(ev.keyCode == 32){ // Barra espaciadora
        if(parado) {
            // Si el juego está parado (Game Over), reiniciamos
            ReiniciarJuego();
        } else {
            // Si no, saltamos normal
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
    dino.style.bottom = dinoPosY+"px";
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
    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth+"px";
    // Posición vertical ajustada en CSS, no es necesario tocar el bottom aquí si el CSS está bien

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo =
        tiempoObstaculoMin +
        Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin) / gameVel;
}

function CrearNube() {
    var nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth;
    nube.style.left = contenedor.clientWidth+"px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY-minNubeY)+"px";
    
    nubes.push(nube);
    tiempoHastaNube =
        tiempoNubeMin +
        Math.random() * (tiempoNubeMax - tiempoNubeMin) / gameVel;
}

function MoverObstaculos() {
    for (var i = obstaculos.length - 1; i >= 0; i--) {
        if(obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            GanarPuntos();
        }else{
            obstaculos[i].posX -= CalcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX+"px";
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
            nubes[i].style.left = nubes[i].posX+"px";
        }
    }
}

function GanarPuntos() {
    score++;
    textoScore.innerText = score;

    // Puntos ajustados para que tarde más en cambiar el cielo
    if(score == 10){ 
        gameVel = 1.3;
        contenedor.classList.add("mediodia");
    } else if(score == 25){
        gameVel = 1.7;
        contenedor.classList.add("tarde");
    } else if(score == 50){
        gameVel = 2.2;
        contenedor.classList.add("noche");
    }
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
            // Padding ajustado ligeramente
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

// --- NUEVA FUNCIÓN: REINICIAR EL JUEGO ---
function ReiniciarJuego() {
    // 1. Ocultar Game Over y resetear estado del dino
    gameOver.style.display = "none";
    dino.classList.remove("dino-estrellado");
    dino.classList.add("dino-corriendo");
    parado = false;
    saltando = false;

    // 2. Resetear variables de juego
    score = 0;
    textoScore.innerText = score;
    gameVel = 1;
    velY = 0;
    dinoPosY = sueloY;
    dino.style.bottom = dinoPosY + "px";
    
    // 3. Quitar clases de fondo (volver al inicio)
    contenedor.classList.remove("mediodia", "tarde", "noche");

    // 4. LIMPIEZA IMPORTANTE: Eliminar todos los obstáculos y nubes del HTML
    // Iteramos hacia atrás para eliminar elementos del array mientras lo recorremos
    for(let i = obstaculos.length - 1; i >= 0; i--) {
        obstaculos[i].remove(); // Elimina del HTML
    }
    obstaculos = []; // Vacía el array JS

    for(let i = nubes.length - 1; i >= 0; i--) {
        nubes[i].remove();
    }
    nubes = [];

    // 5. Resetear temporizadores
    tiempoHastaObstaculo = 2.5;
    tiempoHastaNube = 0.5;

    // El bucle Loop() sigue corriendo, así que al poner parado=false,
    // el Update volverá a ejecutar la lógica en el siguiente frame.
}