import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Column } from '../../schemas/column.schema';
import { Model } from 'mongoose';

@Injectable()
export class ColumnService {
  constructor(@InjectModel(Column.name) private columnModel: Model<Column>) {}

  async create(data: Partial<Column>): Promise<Column> {
    const column = new this.columnModel(data);
    return column.save();
  }

  async findAll(): Promise<Column[]> {
    return this.columnModel.find().exec();
  }

  async findById(id: string): Promise<Column | null> {
    return this.columnModel.findById(id).exec();
  }

  async update(id: string, updates: Partial<Column>): Promise<Column | null> {
    return this.columnModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async delete(id: string): Promise<Column | null> {
    return this.columnModel.findByIdAndDelete(id).exec();
  }
}