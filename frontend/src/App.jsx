import './App.css'
import { io } from 'socket.io-client'
import { useState, useEffect } from 'react'
import { LiMensaje, ULMensajes } from './ui-components';

//la constante socket es la que se encarga de la conexion con el servidor
const socket = io('http://localhost:3000')

function App() {

  //Estados para saber si esta conectado y para guardar los mensajes
  const [isConnected, SetIsConnected] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [mostrarIconos, SetMostrarIconos] = useState(false);

  // useEffect para saber si esta conectado y para recibir los mensajes
  useEffect(() => {
    socket.on('connect', () =>SetIsConnected(true));

    socket.on('chat_message', (data) => {
      //Añadimos el mensaje al array de mensajes
      setMensajes(mensajes => [...mensajes , data])
    })

    return() => {
      socket.off('connect')
      socket.off('chat_message')
    }
  }, [])


const enviarMensaje = () => {
  //El método emit envía un mensaje al servidor
  socket.emit('chat_message', {
    usuario: socket.id,
    mensaje: nuevoMensaje
  })
}

  return (
    <div className="App">
      <h2>{isConnected ? 'CONECTADO' : 'NO CONECTADO'}</h2>
      <ULMensajes>
        {mensajes.map((mensaje, index) => (
        <LiMensaje key={index}>{mensaje.usuario}:{mensaje.mensaje}</LiMensaje>

        ))}

      </ULMensajes>

      <input 
        type="text"
        onChange={e=>setNuevoMensaje(e.target.value)}
      />
      <button onClick={enviarMensaje}>Enviar</button>
      <button onClick={() => SetMostrarIconos(!mostrarIconos)}></button>
    </div>
  )
}

export default App
