const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { getUsuarios } = require('../models/usuarios');

// Ruta para registrar un nuevo usuario
router.post('/registrar', (req, res) => {
    console.log('Ruta /registrar fue accedida');
    console.log('Datos recibidos:', req.body);

    // Extraer datos del cuerpo de la solicitud
    const { nickname, contraseña, correo, avatar } = req.body;

    // Asegurar que avatar sea NULL si está vacío o indefinido
    const avatarFinal = (avatar && typeof avatar === 'string') ? avatar.trim() : null;


    // Validación de los datos recibidos
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

        // Insertar el nuevo usuario en la base de datos con avatar (si existe)
        db.query(
            'INSERT INTO usuarios (`nickname`, `contrasena`, `correo`, `avatar`) VALUES (?, ?, ?, ?)',
            [nickname, contraseñaEncriptada, correo, avatarFinal],
            (err, resultados) => {

                if (err) {
                    console.error('Error al registrar el usuario:', err);
                    return res.status(500).json({ error: 'Error al registrar el usuario' });
                }

                console.log('Usuario registrado con éxito:', nickname);
                res.status(200).json({ mensaje: 'Usuario registrado con éxito' });
            }
        );
    });
});


// Ruta para iniciar sesión de un usuario
router.post('/iniciar-sesion', (req, res) => {

    const { nickname, contraseña } = req.body;
    // Validación de los datos recibidos
    if (!nickname || !contraseña) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Seleccionar solo `id`, `nickname` y `contraseña` para mejorar eficiencia
    db.query('SELECT id, nickname, contrasena FROM usuarios WHERE nickname = ?', [nickname], (err, resultados) => {
        if (err) {
            console.error(' Error en la base de datos al verificar las credenciales:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        // Si no se encontró el usuario, enviar error
        if (resultados.length === 0) {
            return res.status(400).json({ error: 'Nick o contraseña incorrectos' });
        }

        const usuario = resultados[0]; // 🔹 Contiene `id`, `nickname` y `contraseña`

        // Comparar la contraseña encriptada con la recibida
        const contraseñaCorrecta = bcrypt.compareSync(contraseña, usuario.contraseña);

        // Si la contraseña es incorrecta, enviar error
        if (!contraseñaCorrecta) {
            return res.status(400).json({ error: 'Nick o contraseña incorrectos' });
        }

        console.log(`Usuario autenticado con éxito: ${usuario.nickname}, ID: ${usuario.id}`);

        // Enviar `id` en la respuesta para que el frontend lo almacene
        res.status(200).json({
            mensaje: 'Usuario autenticado con éxito',
            id: usuario.id
        });
    });
});

// Ruta para verificar si el nick ya existe antes de permitir entrar como invitado
router.get('/verificar', (req, res) => {
    const { nickname } = req.query;

    console.log('Ruta /verificar fue accedida');
    console.log('Datos recibidos:', req.query);

    if (!nickname) {
        return res.status(400).json({ error: 'El nickname es obligatorio' });
    }
    // Obtenemos los usuarios conectados al chat
    const usuarios = getUsuarios();

    // Verificar si el nick ya existe en la base de datos
    db.query('SELECT * FROM usuarios WHERE nickname = ?', [nickname], (err, resultados) => {
        if (err) {
            console.error('Error al verificar el nickname:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        // Si el nickname existe en la base de datos y no está en uso, enviar `existe: true`
        // Si el nickname no existe en la base de datos, enviar `existe: false`
        const existeEnBD = resultados.length > 0; 
        const estaEnUso = usuarios.some(user => user.nombre.toLowerCase() === nickname.toLowerCase());

        res.json({ existe: existeEnBD, enUso: estaEnUso });
    });
});


// Ruta para obtener los datos de un usuario
module.exports = router;