import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Task } from './task.schema';

@Schema({ timestamps: true })
export class Column extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  position: number;

  @Prop({ type: Types.ObjectId, ref: 'Board' })
  boardId: Types.ObjectId;

  // 👇 Agregamos el campo virtual para que TypeScript lo reconozca
  tasks?: Task[];
}

export const ColumnSchema = SchemaFactory.createForClass(Column);

// 🔗 Relación virtual: una columna tiene muchas tareas
ColumnSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'columnId',
});

ColumnSchema.set('toObject', { virtuals: true });
ColumnSchema.set('toJSON', { virtuals: true });