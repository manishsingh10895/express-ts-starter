import { Server } from 'http';
import socket from 'socket.io'

export class Socket {
    public io: socket.Server
    public socket: socket.Socket;

    constructor(http) {
        this.io = socket(http)
        this.connect()
    }

    public connect() {
        this.io.on('connection', (client: socket.Socket) => {
            // tslint:disable-next-line: no-console
            console.info(` connected : ${client.id}`)
            this.handlers(client)
        })
    }

    public emit(event: string, data: any) {
        this.socket.emit(event, data);
    }

    public subscribe(event: string, listener: Function) {
        this.socket.on(event, (...args) => {
            console.log(args);

            listener(args);
        });
    }

    public handlers(client: socket.Socket) {

        this.socket = client;

        client.on('disconnect', () => {
            // tslint:disable-next-line: no-console
            console.info(`Socket disconnected : ${client.id}`)
        })
    }
}
