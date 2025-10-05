import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // genera createdAt y updatedAt automáticamente
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  assignedTo: string;

  @Prop()
  dueDate: Date;

  @Prop({ default: 'To Do' }) // estado inicial por defecto
  status: string; // 'To Do' | 'In Progress' | 'Done'
}

export const TaskSchema = SchemaFactory.createForClass(Task);
