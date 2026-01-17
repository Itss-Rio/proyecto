const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const path = require("path");
const app = express();

// --- CONFIGURACIÓN ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Archivos estáticos (CSS, Imágenes, JS de los juegos)
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configuración de Sesiones
app.use(session({
    secret: 'arcade_secret_key',
    resave: false,
    saveUninitialized: false
}));

// --- CONEXIÓN BD ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234', // Tu contraseña
    port: 3308,       // Tu puerto
    database: 'ranking'
});

db.connect((err) => {
    if (err) {
        console.error("Error conectando a la base de datos:", err);
    } else {
        console.log("Conectado a la base de datos MySQL");
    }
});

// --- RUTAS ---

// 1. Dashboard Principal
app.get("/", (req, res) => {
    res.render("main", { user: req.session.user || null });
});

// 2. Registro de Usuario (Añadido)
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    
    db.query(sql, [username, email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.send("<script>alert('Error: El email ya existe'); window.location.href='/';</script>");
        }
        // Iniciamos sesión automáticamente tras registrarse
        req.session.user = { id: result.insertId, username, email };
        res.redirect("/");
    });
});

// 3. Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error("Error en base de datos:", err);
            return res.send("<script>alert('Error en el servidor'); window.location.href='/';</script>");
        }

        if (results && results.length > 0) {
            req.session.user = results[0];
            console.log("Sesion iniciada para:", req.session.user.username);
            res.redirect("/");
        } else {
            res.send("<script>alert('EMAIL O PASSWORD INCORRECTOS'); window.location.href='/';</script>");
        }
    });
});

// 4. Página de Ranking (Página nueva)
app.get("/ranking/:game", (req, res) => {
    const game = req.params.game.toLowerCase();
    
    let column = "";
    if (game === 'snake') column = 'score_snake';
    else if (game === 'tetris') column = 'score_tetris';
    else if (game === 'dino') column = 'score_dino';

    if (!column) return res.redirect("/");

    const sql = `SELECT username, ${column} AS score FROM users ORDER BY ${column} DESC LIMIT 10`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.redirect("/");
        }
        res.render("ranking", { 
            game: game.toUpperCase(), 
            results: results 
        });
    });
});

// 5. API Guardar Puntuación (Desde los juegos)
app.post("/api/save-score", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "No has iniciado sesión" });
    }

    const { game, score } = req.body;
    const userId = req.session.user.id;

    let column = "";
    if (game === 'snake') column = 'score_snake';
    else if (game === 'tetris') column = 'score_tetris';
    else if (game === 'dino') column = 'score_dino';

    if (!column) return res.status(400).json({ error: "Juego no válido" });

    // Actualiza solo si la nueva puntuación es mayor
    const sql = `UPDATE users SET ${column} = GREATEST(${column}, ?) WHERE id = ?`;

    db.query(sql, [score, userId], (err, result) => {
        if (err) {
            console.error("Error al guardar:", err);
            return res.status(500).json({ error: "Error de DB" });
        }
        res.json({ success: true, message: "Puntuación guardada" });
    });
});

// 6. Logout
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

// --- INICIO ---
app.listen(3000, () => {
    console.log("-----------------------------------------");
    console.log(" ¡LISTO! Servidor Arcade en funcionamiento");
    console.log(" Entra en: http://localhost:3000");
    console.log("-----------------------------------------");
});