import { io } from 'socket.io-client';

const serverUrl = (import.meta.env.VITE_SERVER_URL || '').trim();

export const socket = io(serverUrl || undefined, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});
