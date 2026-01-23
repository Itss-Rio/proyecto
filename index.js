const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const path = require("path");
const nodemailer = require("nodemailer"); // <-- NUEVO
const app = express();

// --- CONFIGURACIÓN ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sesiones
app.use(session({
    secret: 'arcade_secret_key',
    resave: false,
    saveUninitialized: false
}));

// --- CONEXIÓN BD ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    port: 3308,
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

// Home
app.get("/", (req, res) => {
    res.render("main", { user: req.session.user || null });
});

// Registro
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.query(sql, [username, email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.send("<script>alert('Error: El email ya existe'); window.location.href='/';</script>");
        }

        req.session.user = {
            id: result.insertId,
            username,
            email
        };

        res.redirect("/");
    });
});

// Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error("Error en base de datos:", err);
            return res.send("<script>alert('Error en el servidor'); window.location.href='/';</script>");
        }

        if (results && results.length > 0) {
            req.session.user = {
                id: results[0].id,
                username: results[0].username,
                email: results[0].email
            };

            console.log("Sesion iniciada para:", req.session.user.username);
            res.redirect("/");
        } else {
            res.send("<script>alert('EMAIL O PASSWORD INCORRECTOS'); window.location.href='/';</script>");
        }
    });
});

// Ranking
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
            results
        });
    });
});

// Guardar puntuación
app.post("/api/save-score", (req, res) => {
    console.log(req.body);

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

    const sql = `UPDATE users SET ${column} = GREATEST(${column}, ?) WHERE id = ?`;

    db.query(sql, [score, userId], (err) => {
        if (err) {
            console.error("Error al guardar:", err);
            return res.status(500).json({ error: "Error de DB" });
        }
        res.json({ success: true });
    });
});

// BORRAR CUENTA
app.post("/delete-account", (req, res) => {
    if (!req.session.user) return res.redirect("/");

    const userId = req.session.user.id;

    db.query("DELETE FROM users WHERE id = ?", [userId], (err) => {
        if (err) {
            console.error("Error al borrar:", err);
            return res.send("<script>alert('Error al borrar la cuenta'); window.location.href='/';</script>");
        }

        req.session.destroy(() => {
            res.send("<script>alert('Cuenta eliminada correctamente'); window.location.href='/';</script>");
        });
    });
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

//FORMULARIO DE CONTACTO 
app.post("/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.send("<script>alert('Por favor completa todos los campos'); window.location.href='/HTML/contacto.html';</script>");
    }

    // Configura tu correo y contraseña
    let transporter = nodemailer.createTransport({
        service: "Gmail", // Cambia si no usas Gmail
        auth: {
            user: "arcademinigamewebweb@gmail.com",       // <-- Tu email
            pass: "vllygrfjoncqnypy" // <-- App password o contraseña
        }
    });

    let mailOptions = {
        from: `"${name}" <${email}>`,
        to: "arcademinigamewebweb@gmail.com", // <-- A dónde quieres recibir los mensajes
        subject: subject || "Nuevo mensaje desde tu web",
        text: `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.send("<script>alert('Mensaje enviado correctamente'); window.location.href='/HTML/contacto.html';</script>");
    } catch (err) {
        console.error(err);
        res.send("<script>alert('Error al enviar el mensaje'); window.location.href='/HTML/contacto.html';</script>");
    }
});

// --- INICIO ---
app.listen(3000, () => {
    console.log("Servidor activo en http://localhost:3000");
});
