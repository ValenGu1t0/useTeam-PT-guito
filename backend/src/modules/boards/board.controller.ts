import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { BoardService } from './board.service';
import { Board } from '../../schemas/board.schema';

@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(@Body() body: Partial<Board>) {
    return this.boardService.create(body);
  }

  @Get()
  findAll() {
    return this.boardService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.boardService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Board>) {
    return this.boardService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.boardService.delete(id);
  }
}