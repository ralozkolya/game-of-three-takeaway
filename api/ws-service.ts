import { Server } from 'http';
import * as IO from 'socket.io';
import ShortUniqueId from 'short-unique-id';

import { Event } from '../src/enums/events';
import RoomsService from './rooms-service';
import GameService from './game-service';

const uid = new ShortUniqueId();

let instance: WSService = null;

class WSService {

  private readonly io: IO.Server;

  constructor(server: Server) {
    this.io = IO(server);
    this.io.on(Event.CONNECTION, socket => this.onConnect(socket));
  }

  private onConnect(socket: IO.Socket): void {

    console.log(`Connected: ${socket.id}`);

    const roomService = new RoomsService(this.io, socket);
    new GameService(this.io, socket, roomService);

    socket.on(Event.DISCONNECT, () => this.onDisconnect(socket));
    socket.on(Event.DISCONNECTING, () => this.beforeDisconnect(socket));

    RoomsService.updateRooms(this.io);
  };

  private beforeDisconnect(socket: IO.Socket): void {
    Object.keys(socket.rooms).forEach(room => this.io.to(room).emit('reset'));
  }

  private onDisconnect(socket: IO.Socket): void {
    RoomsService.updateRooms(this.io);
    console.log(`Disconnected: ${socket.id}`);
  }
}

export function initWSService(server: Server): WSService {
  return instance = instance || new WSService(server);
}
