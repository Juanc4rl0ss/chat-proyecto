import './App.css'
import { io } from 'socket.io-client'
import { useState, useEffect } from 'react'
import { LiMensaje, ULMensajes, ULUsuarios } from './ui-components';

//la constante socket es la que se encarga de la conexion con el servidor
const socket = io('http://localhost:3000')

function App() {

  //Estados para saber si esta conectado y para guardar los mensajes
  const [isConnected, SetIsConnected] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [nick, setNick] = useState('');
  

  // useEffect para saber si esta conectado y para recibir los mensajes
  useEffect(() => {
    socket.on('connect', () =>SetIsConnected(true));
    setNick(prompt('Introduce tu nick'));
    if(nick == ''){
      setNick('Anonymous')
    }

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
    usuario: nick,
    mensaje: nuevoMensaje
  })

  setNuevoMensaje('')

}

  return (
    <main className="App">
      <header>
        <h2>{isConnected ? 'Conexión establecida' : 'NO CONECTADO'}</h2>
        <h1>Chat de prueba</h1>
      </header>

      <div className="escritura-usuarios">
        <ULMensajes>
          {mensajes.map((mensaje, index) => (
          <LiMensaje key={index}>{mensaje.usuario}:{mensaje.mensaje}</LiMensaje>

          ))}

        </ULMensajes>
        <ULUsuarios>
          <h3>Usuarios</h3>
          <li>Usuario 1</li>
          <li>Usuario 2</li>
          <li>Usuario 3</li>
        </ULUsuarios>
      </div>
      <div className="escritura-boton">
        <input
          className="escribir-texto"
          type="text"
          value={nuevoMensaje}
          onChange={e=>setNuevoMensaje(e.target.value)}
        />
        <button onClick={enviarMensaje}>Enviar</button>
      </div>
  
  
    </main>
  )
}

export default App
