const mysql = require('mysql2');

const conexion = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'proyectochat',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Ejecutamos la configuración inicial
conexion.query('SET GLOBAL max_allowed_packet=67108864', (err) => {
  if (err) {
    console.warn('No se pudo aumentar max_allowed_packet (global):', err.message);
  } else {
    console.log('Conectado a la base de datos y max_allowed_packet configurado');
  }
});

module.exports = conexion;
