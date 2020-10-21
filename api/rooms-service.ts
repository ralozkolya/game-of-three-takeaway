import * as IO from 'socket.io';
import ShortUniqueId from 'short-unique-id';

import getOtherSocket from './get-other-socket';
import { Event } from "../src/enums/events";

const uid = new ShortUniqueId();

export default class RoomsService {

  public static updateRooms(io: IO.Server): void {
    io.emit(Event.ROOMS, RoomsService.getRooms(io));
  }
  
  private static getRooms(io: IO.Server): string[] {
    return Object.entries(io.sockets.adapter.rooms)
      .filter(([key, value]) => key.startsWith('.') && value.length < 2)
      .map(([key]) => key);
  }

  constructor(
    private io: IO.Server,
    private socket: IO.Socket
  ) {
    socket.on(Event.CREATE_ROOM, () => this.onCreateRoom());
    socket.on(Event.JOIN_ROOM, room => this.onJoinRoom(room));
  }

  public leaveExistingRooms(socket: IO.Socket): void {
    Object.keys(socket.rooms).forEach(room => {
      if (room.startsWith('.')) {
        socket.leave(room);
      }
    });
  }

  private onCreateRoom(): void {
    this.leaveExistingRooms(this.socket);
    // Auto-generated ID is guaranteed not to contain a dot,
    // so it's safe to differentiate based on the room ID
    const room = `.${uid()}`;
    this.socket.join(room, () => {
      this.socket.emit(Event.JOINED_ROOM, room);
      RoomsService.updateRooms(this.io);
    });
  };

  private onJoinRoom(room: string): void {

    if (this.getRoomSockets(room) > 1) {
      // Only 2 players can play
      return;
    }

    this.leaveExistingRooms(this.socket);
    this.socket.join(room);
    RoomsService.updateRooms(this.io);
    this.io.to(room).emit(Event.START);
    getOtherSocket(this.io, this.socket, room).emit(Event.INIT);
  }

  private getRoomSockets(room: string): number {
    return this.io.sockets.adapter.rooms[room]?.length;
  }
}
