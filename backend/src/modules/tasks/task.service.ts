import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../../schemas/task.schema';
import { SocketGateway } from '../../gateways/socket.gateway';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    private readonly socketGateway: SocketGateway,
  ) {}

  async findAll(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }

  async create(taskData: Partial<Task>): Promise<Task> {
    const task = new this.taskModel(taskData);
    const saved = await task.save();
    this.socketGateway.taskUpdated(saved);
    return saved;
  }

  async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    const updated = await this.taskModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    if (updated) this.socketGateway.taskUpdated(updated);
    return updated;
  }

  async delete(id: string): Promise<Task | null> {
    const deleted = await this.taskModel.findByIdAndDelete(id).exec();
    if (deleted) this.socketGateway.taskUpdated(deleted);
    return deleted;
  }
}