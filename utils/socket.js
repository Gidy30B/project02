// socket.js
import { io } from 'socket.io-client';

const socket = io('https://medplus-health.onrender.com', {
  transports: ['websocket'], // Ensure websocket-only connection
});

export default socket;
