import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    constructor(private socket: Socket) { }

    /**
     * Connect to the socket server explicitly.
     * Useful if autoConnect is false.
     */
    connect(): void {
        this.socket.connect();
    }

    /**
     * Disconnect from the socket server.
     */
    disconnect(): void {
        this.socket.disconnect();
    }

    /**
     * Emit an event to the server.
     * @param eventName Name of the event
     * @param data Payload to send
     */
    emit(eventName: string, data: any): void {
        this.socket.emit(eventName, data);
    }

    /**
     * Listen for an event from the server.
     * Returns an Observable that emits the data payload.
     * @param eventName Name of the event to listen for
     */
    listen<T>(eventName: string): Observable<T> {
        return this.socket.fromEvent(eventName) as Observable<T>;
    }

    /**
     * Check connection status
     */
    get id(): string | undefined {
        return this.socket.ioSocket.id;
    }
}
