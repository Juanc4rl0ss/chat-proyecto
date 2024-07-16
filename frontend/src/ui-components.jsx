//Utilizamos la librería styled-components para darle estilo a los componentes
import styled from 'styled-components';

//Le damos estilos a la etiqueta ul
const ULMensajes = styled.ul`
  max-width: 1000px;
  margin: 10px auto;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

//Le damos estilos a la etiqueta li
const LiMensaje = styled.li`
  background-color: white;
  color: black;
  border: 2px solid dodgerblue;
  padding: 10px 20px;
`;

export { ULMensajes, LiMensaje };