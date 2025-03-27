const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'proyectochat'
});

function conectar() {
  conexion.connect((error) => {
    if (error) {
      console.error('Error de conexión:', error.message);
      setTimeout(conectar, 2000);
    } else {
      console.log('Conectado a la base de datos');

      // aumentar el límite de paquete global
      conexion.query('SET GLOBAL max_allowed_packet=67108864', (err) => {
        if (err) {
          console.warn('No se pudo aumentar max_allowed_packet (global):', err.message);
        } else {
          console.log('max_allowed_packet (global) aumentado a 64MB');
        }
      });

      // Intentar aumentar el límite para la sesión actual
      conexion.query('SET SESSION max_allowed_packet=67108864', (err) => {
        if (err) {
          console.warn('No se pudo aumentar max_allowed_packet (session):', err.message);
        } else {
          console.log('max_allowed_packet (session) aumentado a 64MB');
        }
      });
    }
  });
}

conectar();

module.exports = conexion;
