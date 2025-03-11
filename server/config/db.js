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

    // Aumentar el tamaño de max_allowed_packet en la sesión actual
    conexion.query("SET GLOBAL max_allowed_packet=67108864", (err) => {
        if (err) {
            console.error('Error al aumentar max_allowed_packet: ' + err);
        } else {
            console.log('max_allowed_packet aumentado correctamente.');
        }
    });
});

// Exportar la conexión
module.exports = conexion;
