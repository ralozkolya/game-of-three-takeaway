import { Server } from 'http';
import * as IO from 'socket.io';
import ShortUniqueId from 'short-unique-id';

interface IMove {
  start: number;
  difference: number;
  result: number;
}

const uid = new ShortUniqueId();

let instance: GameService = null;

class GameService {

  private io: IO.Server;

  constructor(server: Server) {
    this.io = IO(server);
    this.io.on('connection', socket => this.onConnect(socket));
  }

  private onConnect(socket: IO.Socket): void {

    console.log(`Connected: ${socket.id}`);

    socket.on('disconnect', () => this.onDisconnect(socket));
    socket.on('disconnecting', () => this.beforeDisconnect(socket));

    socket.on('create-room', () => this.onCreateRoom(socket));
    socket.on('join-room', room => this.onJoinRoom(socket, room));
    socket.on('move', (move: IMove) => this.onMove(socket, move));

    this.updateRooms();
  };

  private onCreateRoom(socket: IO.Socket): void {
    this.leaveExistingRooms(socket);
    // Auto-generated ID is guaranteed not to contain a dot,
    // so it's safe to differentiate based on the room ID
    const room = `.${uid()}`;
    socket.join(room, () => {
      socket.emit('joined-room', room);
      this.updateRooms();
    });
  };

  private onJoinRoom(socket: IO.Socket, room: string): void {
    
    if (this.getRoomSockets(room) > 1) {
      // Only 2 players can play
      return;
    }

    this.leaveExistingRooms(socket);
    socket.join(room);
    this.updateRooms();
    this.io.to(room).emit('start');
    this.getOtherSocket(socket, room).emit('init');
  }

  private onMove(socket: IO.Socket, move: IMove): void {
    socket.to(this.getRoom(socket)).emit('move', move);

    if (move.result <= 1) {
      const room = this.getRoom(socket);
      this.leaveExistingRooms(this.getOtherSocket(socket, room));
      this.leaveExistingRooms(socket);
    }
  }

  private beforeDisconnect(socket: IO.Socket): void {
    Object.keys(socket.rooms).forEach(room => this.io.to(room).emit('reset'));
  }

  private onDisconnect(socket: IO.Socket): void {
    this.updateRooms();
    console.log(`Disconnected: ${socket.id}`);
  }

  private updateRooms(): void {
    this.io.emit('rooms', this.getRooms(this.io));
  }

  private getRooms(io: IO.Server): string[] {
    return Object.entries(io.sockets.adapter.rooms)
      .filter(([key, value]) => key.startsWith('.') && value.length < 2)
      .map(([key]) => key);
  }

  private leaveExistingRooms(socket: IO.Socket): void {
    Object.keys(socket.rooms).forEach(room => {
      if (room.startsWith('.')) {
        socket.leave(room);
      }
    });
  }

  private getOtherSocket(socket: IO.Socket, room: string): IO.Socket {
    const id = Object.keys(this.io.sockets.adapter.rooms[room].sockets)
      .find(id => socket.id !== id);
    return this.io.sockets.sockets[id];
  }

  private getRoom(socket: IO.Socket): string {
    return Object.keys(socket.rooms).find(room => room.startsWith('.'));
  }

  private getRoomSockets(room: string): number {
    return this.io.sockets.adapter.rooms[room]?.length;
  }
}

export function initGameService(server: Server): GameService {
  return instance = instance || new GameService(server);
}
