import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from '../../schemas/task.schema';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Post()
  async create(@Body() body: Partial<Task>) {
    return this.taskService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Task>): Promise<Task | null> {
    return this.taskService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<Task | null> {
    return this.taskService.delete(id);
  }

}