const mysql = require('mysql2');

// Conexión a la base de datos
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'proyectochat'
});

// Verificar la conexión
conexion.connect((error) => {
    if (error) {
        console.error('El error de conexión es: ' + error);
        return;
    }
    console.log('¡Conectado a la base de datos!');
});

// Exportar la conexión
module.exports = conexion;