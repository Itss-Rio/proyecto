const express = require("express"); //importar librería
const app = express(); //objeto para llamar a los métodos
const mysql = require('mysql2');
const conexion = mysql.createConnection({
host: 'localhost',
user: 'root',
password: '1234', // mejor poner contraseña
database: 'ranking'
});

app.get("/",function(req,res){
res.send("Ruta inicial con el servidor");
}); //petición y respuesta

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});