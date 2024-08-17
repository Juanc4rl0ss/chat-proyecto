import { useEffect } from 'react';
import { LiMensaje, ULMensajes, ULUsuarios } from './ui-components';

const MensajeList = ({ mensajes, userColors, colorPalette, fontSize, fontFamily, nick, mensajesRef, usuarios }) => {

  useEffect(() => {
    // Desplaza la lista de mensajes hacia abajo cuando se actualizan los mensajes
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]); // Ejecuta este efecto cada vez que 'mensajes' cambie

  return (
    <div className="escritura-usuarios">
      {/* Renderiza la lista de mensajes */}
      <ULMensajes ref={mensajesRef}>
        {mensajes.map((mensaje, index) => {
          const userColor = userColors[mensaje.usuario] || colorPalette[Math.floor(Math.random() * colorPalette.length)];
          return (
            <LiMensaje
              key={index}
              style={{
                fontSize: fontSize,
                fontFamily: fontFamily,
                backgroundColor: 'white',
                color: 'black',
                alignSelf: mensaje.usuario === nick ? 'flex-end' : 'flex-start',
              }}
              className={mensaje.usuario === nick ? 'own' : ''}
            >
              <span style={{ color: userColor }}>{mensaje.usuario}</span>:{' '}
              {mensaje.tipo === 'audio' ? (
                <audio controls>
                  <source src={`data:audio/webm;base64,${mensaje.mensaje}`} type="audio/webm" />
                  Tu navegador no soporta el elemento de audio.
                </audio>
              ) : mensaje.tipo === 'imagen' ? (
                <img
                  src={`data:image/jpeg;base64,${mensaje.mensaje}`}
                  alt="imagen enviada"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
              ) : (
                mensaje.mensaje
              )}
            </LiMensaje>
          );
        })}
      </ULMensajes>

      {/* Renderiza la lista de usuarios */}
      <ULUsuarios>
        <h3>Usuarios Conectados</h3>
        {usuarios.map((usuario, index) => (
          <li 
            key={index} 
            style={{
              color: userColors[usuario] || '#000000'
            }}
          >
            {usuario}
          </li>
        ))}
      </ULUsuarios>
    </div>
  );
};

export default MensajeList;
