import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Column extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  position: number;

  @Prop({ type: Types.ObjectId, ref: 'Board' })
  boardId: string;
}

export const ColumnSchema = SchemaFactory.createForClass(Column);