import { Server } from 'http';
import * as IO from 'socket.io';
import ShortUniqueId from 'short-unique-id';

const uid = new ShortUniqueId();

const sockets: Map<string, IO.Socket> = new Map();
const rooms: string[] = [];

let io: IO.Server;
let gameManagerInstance: GameManager = null;

class GameManager {

    constructor(server: Server) {
        io = IO(server);
        io.on('connection', this.onConnect);
    }

    private onConnect = (socket: IO.Socket) => {
        sockets.set(socket.id, socket);

        socket.emit('rooms', rooms);
        console.log('connected ' + socket.id);
        console.log(`Sockets live: ${sockets.size}`);

        socket.on('disconnect', () => {
            this.leaveRoom(socket);
            sockets.delete(socket.id);
            this.updateRooms();
            console.log(`Sockets left: ${sockets.size}`);
        });

        socket.on('create-room', () => {
            this.leaveRoom(socket);
            const newRoom = uid();            
            (socket as any).room = newRoom;
            this.updateRooms(newRoom);
        });
    };

    private updateRooms(newRoom?: string): void {

        if (newRoom) {
            rooms.push(newRoom);
        }

        io.emit('rooms', rooms);
    }

    private leaveRoom(socket: IO.Socket): void {
        const existingRoom = (socket as any).room;

        if (existingRoom) {
            socket.leave(existingRoom);
            rooms.splice(rooms.indexOf(existingRoom), 1);
        }
    }
}

export function initGameManager(server: Server): GameManager {
    return gameManagerInstance = gameManagerInstance || new GameManager(server);
}
