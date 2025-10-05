import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Board } from '../../schemas/board.schema';
import { Model } from 'mongoose';

@Injectable()
export class BoardService {
  constructor(@InjectModel(Board.name) private boardModel: Model<Board>) {}

  async create(data: Partial<Board>): Promise<Board> {
    const board = new this.boardModel(data);
    return board.save();
  }

  async findAll(): Promise<Board[]> {
    return this.boardModel.find().exec();
  }

  async findById(id: string): Promise<Board | null> {
    return this.boardModel.findById(id).exec();
  }

  async update(id: string, updates: Partial<Board>): Promise<Board | null> {
    return this.boardModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async delete(id: string): Promise<Board | null> {
    return this.boardModel.findByIdAndDelete(id).exec();
  }
}