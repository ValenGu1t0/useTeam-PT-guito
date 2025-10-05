import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Column', required: true })
  columnId: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);