const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { usuarios } = require('../index');

// Ruta para registrar un nuevo usuario
router.post('/registrar', (req, res) => {
    console.log('Ruta /registrar fue accedida');
    console.log('Datos recibidos:', req.body);

    const { nickname: nickname, contraseña, correo } = req.body;

    // Validación de los datos recibidos si no se reciben los datos necesarios
    if (!nickname || !contraseña || !correo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Verificar si el nick ya existe en la base de datos
    db.query('SELECT * FROM usuarios WHERE nickname = ?', [nickname], (err, resultados) => {
        if (err) {
            console.error('Error en la base de datos al buscar el nick:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (resultados.length > 0) {
            return res.status(400).json({ error: 'El nick ya existe' });
        }

        // Encriptar la contraseña
        const saltRounds = 10;
        const contraseñaEncriptada = bcrypt.hashSync(contraseña, saltRounds);


        // Insertar el nuevo usuario en la base de datos
        db.query('INSERT INTO usuarios (nickname, contraseña, correo) VALUES (?, ?, ?)',
            [nickname, contraseñaEncriptada, correo], (err, resultados) => {
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


    // Verificar si el nick existe en la base de datos p si la contraseña es correcta
    db.query('SELECT * FROM usuarios WHERE nickname = ?', [nickname], (err, resultados) => {
        if (err) {
            console.error('Error en la base de datos al verificar las credenciales:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        // Si no se encontró el usuario entonces se envía un mensaje de error
        if (resultados.length === 0) {
            return res.status(400).json({ error: 'Nick o contraseña incorrectos' });
        }

        // Verificar si la contraseña es correcta
        const usuario = resultados[0];

        // Comparar la contraseña encriptada con la contraseña recibida
        const contraseñaCorrecta = bcrypt.compareSync(contraseña, usuario.contraseña);

        // Si la contraseña no es correcta entonces se envía un mensaje de error
        if (!contraseñaCorrecta) {
            return res.status(400).json({ error: 'Nick o contraseña incorrectos' });
        }

        console.log('Usuario autenticado con éxito:', nickname);
        res.status(200).json({ mensaje: 'Usuario autenticado con éxito' });
    });
}
);
// Ruta para verificar si el nick ya existe antes de permitir entrar como invitado
router.get('/verificar', (req, res) => {
    const { nickname } = req.query;

    if (!nickname) {
        return res.status(400).json({ error: 'El nickname es obligatorio' });
    }

    // Verificar si el nickname existe en la base de datos
    db.query('SELECT * FROM usuarios WHERE nickname = ?', [nickname], (err, resultados) => {
        if (err) {
            console.error('Error al verificar el nickname:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        const existeEnBD = resultados.length > 0;
        const estaEnUso = usuarios.some(user => user.nombre.toLowerCase() === nickname.toLowerCase());

        res.json({ existe: existeEnBD, enUso: estaEnUso });
    });
});

// Ruta para obtener los datos de un usuario
module.exports = router;