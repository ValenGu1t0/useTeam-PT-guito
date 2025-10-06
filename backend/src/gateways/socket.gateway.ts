import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log('Cliente conectado:', client.id);
  }

  handleDisconnect(client: any) {
    console.log('Cliente desconectado:', client.id);
  }

  // --- Tasks ---
  taskCreated(task: any) {
    this.server.emit('taskCreated', task);
  }

  taskUpdated(task: any) {
    this.server.emit('taskUpdated', task);
  }

  taskDeleted(id: string) {
    this.server.emit('taskDeleted', id);
  }

  // --- Columns ---
  columnCreated(column: any) {
    this.server.emit('columnCreated', column);
  }

  columnUpdated(column: any) {
    this.server.emit('columnUpdated', column);
  }

  columnDeleted(id: string) {
    this.server.emit('columnDeleted', id);
  }
}