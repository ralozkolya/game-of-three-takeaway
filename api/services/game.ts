import { Server } from 'http';
import * as IO from 'socket.io';
import ShortUniqueId from 'short-unique-id';

import { IMove, getNextMove } from '../../src/util/move';
import { Event } from '../../src/enums/events';

const uid = new ShortUniqueId();

let instance: GameService = null;

class GameService {

  private io: IO.Server;

  constructor(server: Server) {
    this.io = IO(server);
    this.io.on(Event.CONNECTION, socket => this.onConnect(socket));
  }

  private onConnect(socket: IO.Socket): void {

    console.log(`Connected: ${socket.id}`);

    socket.on(Event.DISCONNECT, () => this.onDisconnect(socket));
    socket.on(Event.DISCONNECTING, () => this.beforeDisconnect(socket));

    socket.on(Event.CREATE_ROOM, () => this.onCreateRoom(socket));
    socket.on(Event.JOIN_ROOM, room => this.onJoinRoom(socket, room));
    socket.on(Event.MOVE, (move: IMove) => this.onMove(socket, move));
    
    socket.on(Event.START, () => this.onStart(socket));

    this.updateRooms();
  };

  private onCreateRoom(socket: IO.Socket): void {
    this.leaveExistingRooms(socket);
    // Auto-generated ID is guaranteed not to contain a dot,
    // so it's safe to differentiate based on the room ID
    const room = `.${uid()}`;
    socket.join(room, () => {
      socket.emit(Event.JOINED_ROOM, room);
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
    this.io.to(room).emit(Event.START);
    this.getOtherSocket(socket, room).emit(Event.INIT);
  }

  private onMove(socket: IO.Socket, move: IMove): void {

    if (this.getRoom(socket)) {
      return this.handleMultiplayer(socket, move);
    }
    
    this.handleSinglePlayer(socket, move);
  }

  private handleSinglePlayer(socket: IO.Socket, move: IMove): void {
    if (move.result > 1) {
      const nextMove = getNextMove(move.result);
      socket.emit(Event.MOVE, nextMove);
    }
  }

  private handleMultiplayer(socket: IO.Socket, move: IMove): void {

    socket.to(this.getRoom(socket)).emit(Event.MOVE, move);

    if (move.result <= 1) {
      const room = this.getRoom(socket);
      this.leaveExistingRooms(this.getOtherSocket(socket, room));
      this.leaveExistingRooms(socket);
    }
  }

  private onStart(socket: IO.Socket): void {
    this.leaveExistingRooms(socket);
    this.updateRooms();
    socket.emit(Event.START);
    socket.emit(Event.INIT);
  }

  private beforeDisconnect(socket: IO.Socket): void {
    Object.keys(socket.rooms).forEach(room => this.io.to(room).emit('reset'));
  }

  private onDisconnect(socket: IO.Socket): void {
    this.updateRooms();
    console.log(`Disconnected: ${socket.id}`);
  }

  private updateRooms(): void {
    this.io.emit(Event.ROOMS, this.getRooms(this.io));
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
