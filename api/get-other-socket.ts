import * as IO from 'socket.io';

export default function getOtherSocket(io: IO.Server, socket: IO.Socket, room: string): IO.Socket {
  const id = Object.keys(io.sockets.adapter.rooms[room].sockets)
    .find(id => socket.id !== id);
  return io.sockets.sockets[id];
}
