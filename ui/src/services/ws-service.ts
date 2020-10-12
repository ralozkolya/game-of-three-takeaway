import openSocket from 'socket.io-client';

import env from '../environments/env';

const { URL } = env;

let socket: SocketIOClient.Socket;


export default class WSService {

    public static init(): SocketIOClient.Socket {
        return socket = socket || openSocket(URL);
    }

    public static sendMessage(message: string): void {
        socket.emit('message', message);
    }
}
