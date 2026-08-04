import { io } from 'socket.io-client';

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
  }
  return socket;
};

// Disconnect the current socket and clear it (call on logout)
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
