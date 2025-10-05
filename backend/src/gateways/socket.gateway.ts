import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TaskService } from '../modules/tasks/task.service';

@WebSocketGateway({ cors: true })
export class TaskGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly taskService: TaskService) {}

  @SubscribeMessage('createTask')
  async handleCreate(@MessageBody() payload) {
    const task = await this.taskService.create(payload);
    this.server.emit('taskCreated', task);
  }

  @SubscribeMessage('updateTask')
  async handleUpdate(@MessageBody() payload) {
    const updated = await this.taskService.update(payload.id, payload.data);
    this.server.emit('taskUpdated', updated);
  }

  @SubscribeMessage('deleteTask')
  async handleDelete(@MessageBody() id: string) {
    await this.taskService.delete(id);
    this.server.emit('taskDeleted', id);
  }
}