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
      console.error('❌ Error de conexión:', error.message);
      setTimeout(conectar, 2000); // Intenta reconectar cada 2 segundos
    } else {
      console.log('✅ ¡Conectado a la base de datos!');
    }
  });
}

conectar();

module.exports = conexion;
