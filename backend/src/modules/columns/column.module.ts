import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Column, ColumnSchema } from '../../schemas/column.schema';
import { Task, TaskSchema } from '../../schemas/task.schema';
import { ColumnController } from './column.controller';
import { ColumnService } from './column.service';
import { SocketGateway } from '../../gateways/socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Column.name, schema: ColumnSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
  ],
  controllers: [ColumnController],
  providers: [ColumnService, SocketGateway],
  exports: [ColumnService],
})
export class ColumnModule {}