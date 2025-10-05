import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ColumnService } from './column.service';
import { Column } from '../../schemas/column.schema';

@Controller('columns')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Post()
  create(@Body() body: Partial<Column>) {
    return this.columnService.create(body);
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
  update(@Param('id') id: string, @Body() body: Partial<Column>) {
    return this.columnService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.columnService.delete(id);
  }
}