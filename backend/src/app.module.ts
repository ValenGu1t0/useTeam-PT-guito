import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskModule } from './modules/tasks/task.module';
import { ColumnModule } from './modules/columns/column.module';
import { BoardModule } from './modules/boards/board.module';
import { SocketGateway } from './gateways/socket.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    TaskModule,
    ColumnModule,
    BoardModule,
  ],
  controllers: [AppController],
  providers: [AppService, SocketGateway],
})
export class AppModule {}