import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) 
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  assignedTo: string;

  @Prop()
  dueDate: Date;

  @Prop({ default: 'To Do' }) 
  status: string; // Puede ser 'To Do' | 'In Progress' | 'Done'
}

export const TaskSchema = SchemaFactory.createForClass(Task);