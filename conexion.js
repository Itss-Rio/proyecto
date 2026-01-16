const mysql = require('mysql2');
const conexion = mysql.createConnection({
host: 'localhost',
user: 'root',
password: '1234', // mejor poner contraseña
database: 'ranking',
port: 3308
});
conexion.connect(err => {
if (err) {
console.error('Error conexión:', err.message);
process.exit(1);
}
console.log('Conexión OK con mysql2');
});
/*conexion.end();
*/

const usuario = "SELECT * FROM usuarios";
conexion.query(usuario,function(error,rows){
if(error){
throw error;
}else{
console.log(rows)
}
});
const nuevoreg = "INSERT INTO usuarios (id, Nombre, creado_en) VALUES ('1','Pedro','2026-01-10 14:30:00')";
conexion.query(nuevoreg, function(error,rows){
if(error){
throw error;
}else{
console.log('Datos registrados')
}
});
conexion.end();