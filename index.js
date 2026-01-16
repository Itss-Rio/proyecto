const express = require("express"); //importar librería
const app = express(); //objeto para llamar a los métodos
const mysql = require('mysql2');
const conexion = mysql.createConnection({
host: 'localhost',
user: 'root',
password: '1234', // mejor poner contraseña
database: 'ranking'
});

/*
app.get("/",function(req,res){
res.send("Ruta inicial con el servidor");
}); //petición y respuesta

app.use(express.static("public"));
*/

//Motor de plantillas EJS
app.set("view engine", "ejs");


app.get("/", function(req, res){
    res.render("registro");
});


app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.post("/register", function(req, res){
    const datos = req.body;
    console.log(datos);
//});




let username = datos.nombre;
let email = datos.email;
let password = datos.password;
let timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

let register = "INSERT INTO users (username	, email, password, creado_en) VALUES ('"+username+"', '"+email+"', '"+password+"', '"+timestamp+"'";

conexion.query(register, function(error){
    if(error){
        throw error;
    }else if (email === email){
        console.log('email existente')
        res.redirect("/");
    }else{
        console.log('Usuario registrado');
        res.redirect("/");
    }
});
});


conexion.connect(err => {
if (err) {
console.error('Error conexión:', err.message);
process.exit(1);
}
console.log('Conexión OK con mysql2');
});




//Final Siempre
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
//puerto 3000 u 8000