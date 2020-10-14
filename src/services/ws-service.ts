import openSocket from 'socket.io-client';

import env from '../environments/env';
import { Event } from '../enums/events';
import { IMove } from '../util/move';

const { URL } = env;

let socket: SocketIOClient.Socket;

export default class WSService {

  public static init(): SocketIOClient.Socket {
    return socket = socket || openSocket(URL);
  }

  public static joinRoom(room: string): void {
    socket.emit(Event.JOIN_ROOM, room);
  }

  public static createRoom(): void {
    socket.emit(Event.CREATE_ROOM);
  }

  public static startGame(): void {
    socket.emit(Event.START);
  }

  public static sendMove(move: IMove): void {
    socket.emit(Event.MOVE, move);
  }
}
