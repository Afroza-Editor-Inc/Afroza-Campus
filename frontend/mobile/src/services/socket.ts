import { Socket } from 'phoenix';
import { PHOENIX_SOCKET_ENDPOINT } from './api';

let socket: any = null;
export function connectSocket(token?: string){
  if (socket) return socket;
  const params: any = {};
  if (token) params.token = token;
  socket = new Socket(PHOENIX_SOCKET_ENDPOINT, { params });
  socket.connect();
  return socket;
}

export function joinRoom(roomId: string){
  if (!socket) connectSocket();
  const channel = socket.channel(`chat:${roomId}`);
  channel.join()
    .receive('ok', () => console.log('joined', roomId))
    .receive('error', () => console.log('failed to join', roomId));
  return channel;
}
