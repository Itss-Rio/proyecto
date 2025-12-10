//****** GAME LOOP ********//

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

//****** LÓGICA DEL JUEGO ********//

// --- FÍSICA AJUSTADA (SALTO CORTO Y RÁPIDO) ---
var sueloY = 50; // La base del juego (altura del suelo en CSS)
var velY = 0;
var impulso = 1500; // Impulso de salto (fuerza inicial)
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

/*Funcion para inicializar los elementos del juego*/
function Start() {
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    dino = document.querySelector(".dino");
    
    document.addEventListener("keydown", HandleKeyDown);
}

/*Funcion para actualizar el estado del juego en cada frame*/
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

/*Funcion para manejar la pulsación de teclas*/
function HandleKeyDown(ev){
    if(ev.keyCode == 32){ // ESPACIO
        if(parado){
            ReiniciarJuego();
        } else {
            Saltar();
        }
    }
}

/*Funcion para que el dinosaurio salte*/
function Saltar(){
    if(dinoPosY === sueloY){
        saltando = true;
        velY = impulso;
        dino.classList.remove("dino-corriendo");
    }
}

/*Funcion para mover el dinosaurio en el eje Y*/
function MoverDinosaurio() {
    dinoPosY += velY * deltaTime;
    if(dinoPosY < sueloY){
        TocarSuelo();
    }
    dino.style.bottom = dinoPosY + "px";
}

/*Funcion para detectar cuando el dino toca el suelo y ajustar su estado*/
function TocarSuelo() {
    dinoPosY = sueloY;
    velY = 0;
    if(saltando){
        dino.classList.add("dino-corriendo");
    }
    saltando = false;
}
/*Funcion para que el suelo se mueva y cree la ilusión de desplazamiento*/
function MoverSuelo() {
    sueloX += CalcularDesplazamiento();
    // Usamos contenedor.clientWidth (1400px) para asegurar que el suelo se repita correctamente
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}
/*Funcion para poder calcular como debe moverse las cosas en el escenario para cuadrar todo*/
function CalcularDesplazamiento() {
    return velEscenario * deltaTime * gameVel;
}
/*Funcion utilizada para manejar la colision del dino con un obstaculo y asi poder tener posteriormente la animacion y la forma de derrota*/
function Estrellarse() {
    dino.classList.remove("dino-corriendo");
    dino.classList.add("dino-estrellado");
    parado = true;
}
/*Funcion que hace o decide cuando debe crearse un obstaculo*/
function DecidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if(tiempoHastaObstaculo <= 0) {
        CrearObstaculo();
    }
}
/*Funcion que hace o decide cuando debe crearse una nube, y este es utilizado para forzar a crear una nube*/
function DecidirCrearNubes() {
    tiempoHastaNube -= deltaTime;
    if(tiempoHastaNube <= 0) {
        CrearNube();
    }
}

/*Funcion utilizada para que los obstaculos se puedan ir creando*/
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

/*Funcion utilizada para que las nubes se puedan ir creando*/
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

/*Duncion utilizada para que los obstaculos se muevan segun como se mueve el escenario / Dino*/
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
/*Aqui tenemos una forma de ver como es que las nubes estan moviendose*/
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
    /* Lo que esta pasando aquí es que al alcanzar ciertos puntajes,
    se añade una clase específica al contenedor para cambiar el fondo.
    Esto crea la ilusión de que el juego avanza a diferentes momentos del día. */
    if(score == 10) contenedor.classList.add("mañana");
    else if(score == 25) contenedor.classList.add("mediodia");
    else if(score == 50) contenedor.classList.add("tarde");
    else if(score == 75) contenedor.classList.add("anochecer");
    else if(score == 100) contenedor.classList.add("noche");
    
    if(score % 5 == 0) gameVel += 0.1;
}
/*Condicion que tenemos para que e juego termine 
  En este caso tenemos que Estrellarnos*/
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

    /*Funcion para detectar colisiones entre dos elementos con padding ajustable*/
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

 /*Funcion para reiniciar el juego*/
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
