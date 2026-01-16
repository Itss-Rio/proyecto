const express = require("express"); //importar librería
const app = express(); //objeto para llamar a los métodos
const mysql = require('mysql2');
const conexion = mysql.createConnection({
host: 'localhost',
user: 'root',
password: '1234', // mejor poner contraseña
port: 3308,
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




let username = datos.username;
let email = datos.email;
let password = datos.password;
let timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

let checkEmail = "SELECT * FROM users WHERE email = '"+email+"'";

conexion.query(checkEmail, function(error, rows){
    if(error){
        throw error;
    }

        if (rows.length > 0){
            console.log('El email ya existe');
            res.redirect("/");
            return;
        }
            else{
            let register = "INSERT INTO users (username, email, password, creado_en) VALUES ('"+username+"', '"+email+"', '"+password+"', '"+timestamp+"')";

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
        }   
        });
    });






//Final Siempre
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
//puerto 3000 u 8000