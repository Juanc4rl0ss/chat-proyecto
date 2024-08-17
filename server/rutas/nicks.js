const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Asegúrate de que la ruta a db.js es correcta

// Ruta para registrar un nuevo usuario
router.post('/registrar', (req, res) => {
    console.log('Ruta /registrar fue accedida');
    console.log('Datos recibidos:', req.body);

    const { apodo: nickname, contraseña, correo } = req.body; // Usar 'apodo' y asignarlo a 'nickname'

    if (!nickname || !contraseña || !correo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    db.query('SELECT * FROM usuarios WHERE nickname = ?', [nickname], (err, resultados) => {
        if (err) {
            console.error('Error en la base de datos al buscar el nick:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (resultados.length > 0) {
            return res.status(400).json({ error: 'El nick ya existe' });
        }

        db.query('INSERT INTO usuarios (nickname, contraseña, correo) VALUES (?, ?, ?)', 
        [nickname, contraseña, correo], (err, resultados) => {
            if (err) {
                console.error('Error al registrar el usuario:', err);
                return res.status(500).json({ error: 'Error al registrar el usuario' });
            }

            console.log('Usuario registrado con éxito:', nickname);
            res.status(200).json({ mensaje: 'Usuario registrado con éxito' });
        });
    });
});

// Ruta para iniciar sesión de un usuario
router.post('/iniciar-sesion', (req, res) => {
    console.log('Ruta /iniciar-sesion fue accedida');
    console.log('Datos recibidos:', req.body);

    const { nickname, contraseña } = req.body;

    // Validación de los datos recibidos
    if (!nickname || !contraseña) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    db.query('SELECT * FROM usuarios WHERE nickname = ? AND contraseña = ?', [nickname, contraseña], 
    (err, resultados) => {
        if (err) {
            console.error('Error en la base de datos al verificar las credenciales:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (resultados.length === 0) {
            return res.status(400).json({ error: 'Nick o contraseña incorrectos' });
        }

        console.log('Usuario autenticado con éxito:', nickname);
        res.status(200).json({ mensaje: 'Usuario autenticado con éxito' });
    });
});

module.exports = router;