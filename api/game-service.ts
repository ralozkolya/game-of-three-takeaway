import * as IO from 'socket.io';
import { Event } from '../src/enums/events';
import { getNextMove, IMove } from '../src/util/move';
import getOtherSocket from './get-other-socket';
import RoomsService from './rooms-service';

export default class GameService {

  constructor(
    private io: IO.Server,
    private socket: IO.Socket,
    private roomsService: RoomsService
  ) {
    socket.on(Event.MOVE, (move: IMove) => this.onMove(socket, move));
    socket.on(Event.START, () => this.onStart(socket));
  }

  private onMove(socket: IO.Socket, move: IMove): void {

    if (this.getRoom()) {
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

    const room = this.getRoom();

    socket.to(room).emit(Event.MOVE, move);

    if (move.result <= 1) {
      this.roomsService.leaveExistingRooms(getOtherSocket(this.io, socket, room));
      this.roomsService.leaveExistingRooms(socket);
    }
  }

  private onStart(socket: IO.Socket): void {
    this.roomsService.leaveExistingRooms(socket);
    RoomsService.updateRooms(this.io);
    socket.emit(Event.START);
    socket.emit(Event.INIT);
  }

  private getRoom(): string {
    return Object.keys(this.socket.rooms).find(room => room.startsWith('.'));
  }
}
