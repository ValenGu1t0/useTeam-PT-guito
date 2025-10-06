import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from '../../schemas/task.schema';
import { SocketGateway } from '../../gateways/socket.gateway';

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly socketGateway: SocketGateway,
  ) {}

  @Get()
  async getAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Post()
  async create(@Body() body: Partial<Task>) {
    const task = await this.taskService.create(body);
    this.socketGateway.taskCreated(task);
    return task;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Task>) {
    const task = await this.taskService.update(id, body);
    if (task) this.socketGateway.taskUpdated(task);
    return task;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.taskService.delete(id);
    if (deleted) this.socketGateway.taskDeleted(id);
    return deleted;
  }
}