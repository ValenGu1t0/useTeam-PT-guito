import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ColumnService } from './column.service';
import { Column } from '../../schemas/column.schema';
import { SocketGateway } from '../../gateways/socket.gateway';

@Controller('columns')
export class ColumnController {
  constructor(
    private readonly columnService: ColumnService,
    private readonly socketGateway: SocketGateway,
  ) {}

  @Post()
  async create(@Body() body: Partial<Column>) {
    const column = await this.columnService.create(body);
    this.socketGateway.columnUpdated(column); // 🚀 notifica nueva columna
    return column;
  }

  @Get()
  findAll() {
    return this.columnService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.columnService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Column>) {
    const column = await this.columnService.update(id, body);
    if (column) this.socketGateway.columnUpdated(column); // 🚀 notifica edición
    return column;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.columnService.delete(id);
    if (deleted) this.socketGateway.columnUpdated({ deleted: id }); // podrías emitir un evento específico si querés
    return deleted;
  }
}