import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Column } from '../../schemas/column.schema';
import { Task } from '../../schemas/task.schema';
import { Model } from 'mongoose';
import { SocketGateway } from '../../gateways/socket.gateway';

@Injectable()
export class ColumnService {
  constructor(
    @InjectModel(Column.name) private readonly columnModel: Model<Column>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    private readonly socketGateway: SocketGateway,
  ) {}

  async create(data: Partial<Column>): Promise<Column> {
    const column = new this.columnModel(data);
    const saved = await column.save();
    this.socketGateway.columnUpdated(saved);
    return saved;
  }

  async findAll() {
    const columns = await this.columnModel.find().sort({ position: 1 });
    const tasks = await this.taskModel.find().sort({ createdAt: 1 }).lean();

    const result = columns.map((column) => {
      const columnId = (column._id as any).toString();
      const columnTasks = tasks.filter(
        (task) => task.columnId?.toString() === columnId,
      );
      return { ...column.toObject(), tasks: columnTasks as any };
    });

    return result;
  }

  async findById(id: string): Promise<any> {
    const column = await this.columnModel.findById(id);
    if (!column) return null;

    const tasks = await this.taskModel
      .find({ columnId: column._id })
      .sort({ createdAt: 1 })
      .lean();

    return { ...column.toObject(), tasks: tasks as any };
  }

  async update(id: string, updates: Partial<Column>): Promise<Column | null> {
    const updated = await this.columnModel
      .findByIdAndUpdate(id, updates, { new: true })
      .exec();
    if (updated) this.socketGateway.columnUpdated(updated);
    return updated;
  }

  async delete(id: string): Promise<Column | null> {
    const deleted = await this.columnModel.findByIdAndDelete(id).exec();
    if (deleted) this.socketGateway.columnUpdated(deleted);
    return deleted;
  }
}