import { io, Socket } from 'socket.io-client';

// Socket.IO client instance
let socket: Socket | null = null;

/**
 * Initialize Socket.IO connection
 * @param {string} token - JWT token for authentication
 * @returns {Socket} Socket.IO client instance
 */
export const initializeSocket = (token: string): Socket => {
  // If we already have a socket instance, disconnect it
  if (socket) {
    socket.disconnect();
  }

  // Create a new socket instance
  const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
  socket = io(socketURL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // When connected, authenticate with the server
  socket.on('connect', () => {
    console.log('Connected to socket server');
    // Authenticate with token
    socket.emit('authenticate', { token });
  });

  // Handle various socket events
  socket.on('authenticated', (data) => {
    console.log('Authenticated with socket server', data);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from socket server:', reason);
  });

  return socket;
};

/**
 * Get the current socket instance
 * @returns {Socket|null} Socket.IO client instance or null if not initialized
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Disconnect the socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};

// Create a named object for default export
const socketService = {
  initializeSocket,
  getSocket,
  disconnectSocket,
};

export default socketService;
