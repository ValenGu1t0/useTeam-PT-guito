import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Column, ColumnSchema } from '../../schemas/column.schema';
import { ColumnController } from './column.controller';
import { ColumnService } from './column.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Column.name, schema: ColumnSchema }])],
  controllers: [ColumnController],
  providers: [ColumnService],
  exports: [ColumnService],
})

export class ColumnModule {}