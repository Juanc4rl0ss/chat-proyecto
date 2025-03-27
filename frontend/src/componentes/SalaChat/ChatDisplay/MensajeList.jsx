import { useEffect, useState } from "react";
import "./MensajeList.css"; // Importamos el archivo CSS

const MensajeList = ({
  mensajes,
  fontSize,
  fontFamily,
  nick,
  mensajesRef,
  usuarios,
}) => {
  // Estado para almacenar los colores de los usuarios
  const [userColors, setUserColors] = useState({});

  // Actualizar el scroll de mensajes al final, en caso de que haya nuevos mensajes
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Asignar un color aleatorio a los usuarios que no tengan uno
  useEffect(() => {
    setUserColors((prevColors) => {
      const newColors = { ...prevColors };
      usuarios.forEach((user) => {
        if (!newColors[user.nombre]) {
          // Agregamos color solo si el usuario no tiene uno asignado
          newColors[user.nombre] = getRandomColor();
        }
      });
      return newColors;
    });
  }, [usuarios]);

  // Función para obtener un color aleatorio de la paleta
  const colorPalette = [
    "#1F77B4",
    "#FF7F0E",
    "#2CA02C",
    "#D62728",
    "#9467BD",
    "#8C564B",
    "#E377C2",
    "#7F7F7F",
    "#BCBD22",
    "#17BECF",
  ];
  const getRandomColor = () =>
    colorPalette[Math.floor(Math.random() * colorPalette.length)];

  return (
    <div className="escritura-usuarios">
      {/* Renderiza la lista de mensajes */}
      <ul className="ul-mensajes" ref={mensajesRef}>
        {mensajes.map((mensaje, index) => {
          const userColor =
            mensaje.usuario === "INFO"
              ? "#FF7F0E"
              : userColors[mensaje.usuario] || getRandomColor();

          const usuarioData = usuarios.find(
            (user) => user.nombre === mensaje.usuario
          );
          const avatarSrc = usuarioData?.avatar || null;

          return (
            <li
              key={index}
              className={`li-mensaje ${mensaje.usuario === nick || mensaje.tipo === "bienvenida"
                  ? "own"
                  : ""
                }`}
              style={{ fontSize: fontSize, fontFamily: fontFamily }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                {mensaje.usuario !== "INFO" &&
                  (avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={mensaje.usuario}
                      width="30"
                      height="30"
                      style={{ borderRadius: "50%", marginRight: "10px" }}
                    />
                  ) : (
                    <span
                      style={{
                        display: "inline-block",
                        width: "30px",
                        height: "30px",
                        fontSize: "20px",
                        lineHeight: "30px",
                        textAlign: "center",
                        marginRight: "10px",
                      }}
                    >
                      👤
                    </span>
                  ))}

                <div className="mensaje-nombre" style={{ color: userColor }}>
                  {mensaje.usuario}:
                </div>
                <div className="mensaje-texto">
                  {mensaje.tipo === "audio" ? (
                    <audio controls style={{ width: "250px", height: "30px" }}>
                    <source
                        src={`data:audio/webm;base64,${mensaje.mensaje}`}
                        type="audio/webm"
                      />
                      Tu navegador no soporta el elemento de audio.
                    </audio>
                  ) : mensaje.tipo === "imagen" ? (
                    <img
                      src={`data:image/jpeg;base64,${mensaje.mensaje}`}
                      alt="imagen enviada"
                      style={{ maxWidth: "200px", maxHeight: "200px" }}
                    />
                  ) : (
                    mensaje.mensaje
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Renderiza la lista de usuarios conectados */}
      <ul className="ul-usuarios">
        <h3>Usuarios Conectados</h3>
        {usuarios.map((usuario, index) => (
          <li
            key={index}
            style={{ color: userColors[usuario.nombre] || getRandomColor() }}
          >
            <span className="user-icon">
              {usuario.avatar ? (
                <img
                  src={usuario.avatar}
                  alt={usuario.nombre}
                  width="30"
                  height="30"
                  style={{ borderRadius: "50%" }}
                />
              ) : (
                <span className="default-avatar">👤</span>
              )}
            </span>
            {usuario.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MensajeList;