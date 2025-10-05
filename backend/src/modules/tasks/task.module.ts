import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from '../../schemas/task.schema';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { SocketGateway } from '../../gateways/socket.gateway';

@Module({
  imports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }])],
  controllers: [TaskController],
  providers: [TaskService, SocketGateway],
  exports: [TaskService],
})
export class TaskModule {}