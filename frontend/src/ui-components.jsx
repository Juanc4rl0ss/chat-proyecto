import styled from 'styled-components';

//Le damos estilos a la etiqueta ul
const ULMensajes = styled.ul`
  list-style-type: none;
  padding: 20px;
  background: #DAC2C2;
  border-radius: 10px;
  height: 60vh; 
  width: 80%;
  overflow-y: auto;
  display: flex;
  flex-direction: column; 
  margin-bottom: 20px;
`;

//le damos estilos a la lista de usuarios
const ULUsuarios = styled.ul`
  list-style-type: none;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 10px;
  height: 60vh;
  border:1px solid #0084ff;
  margin-left:10px;
  background: white;
  color:black;
  font-weight: bold;
`;
//Le damos estilos a la etiqueta li
const LiMensaje = styled.li`
  background-color: #0084ff; 
  color: white; 
  padding: 10px 20px;
  margin: 5px 0; 
  border-radius: 10px;
  max-width: 70%;
  word-wrap: break-word; 
  align-self: flex-start;
  
  /* Si el mensaje es del usuario actual, alinearlo a la derecha */
  &.own {
    background-color: #e0e0e0; /* Fondo gris claro para los mensajes del usuario */
    color: black; /* Texto negro */
    align-self: flex-end; /* Alinear mensajes del usuario a la derecha */
  }
`;


export { ULMensajes, LiMensaje, ULUsuarios };