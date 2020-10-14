import openSocket from 'socket.io-client';

import env from '../environments/env';

export interface IMove {
  start: number;
  difference?: number;
  result: number;
}

const { URL } = env;

let socket: SocketIOClient.Socket;


export default class WSService {

  public static init(): SocketIOClient.Socket {
    return socket = socket || openSocket(URL);
  }

  public static joinRoom(room: string): void {
    socket.emit('join-room', room);
  }

  public static createRoom(): void {
    socket.emit('create-room');
  }

  public static startGame(): void {
    socket.emit('start');
  }

  public static sendMove(move: IMove): void {
    socket.emit('move', move);
  }
}
