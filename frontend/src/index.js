import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { io } from 'socket.io-client';

// 🔌 Create WebSocket connection
const socket = new WebSocket("ws://localhost:3333");// your backend server

// Make socket available throughout your app using React Context
export const SocketContext = React.createContext();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Provide the socket to all components */}
    <SocketContext.Provider value={socket}>
      <App />
    </SocketContext.Provider>
  </React.StrictMode>
);
