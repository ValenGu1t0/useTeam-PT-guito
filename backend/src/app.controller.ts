// app.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { AppService } from './app.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ExportBacklogDto } from './dto/export-backlog.dto';
import { SocketGateway } from './gateways/socket.gateway';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly http: HttpService,
    private readonly socketGateway: SocketGateway,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Trigger para que N8N comience el workflow
  @Post('api/export/backlog')
  @HttpCode(202)
  async exportBacklog(@Body() body: ExportBacklogDto) {
    const email = body?.email;
    if (!email) {
      throw new BadRequestException('El campo "email" es requerido');
    }

    const n8nWebhookUrl =
      process.env.N8N_WEBHOOK_URL ||
      'http://localhost:5678/webhook-test/export-backlog';

    try {
      const response = await firstValueFrom(
        this.http.post(n8nWebhookUrl, { email }),
      );

      return {
        success: true,
        message: 'Solicitud de exportación enviada a N8N',
        n8nStatus: response.status,
        n8nData: response.data,
      };
    } catch (error) {
      const errMsg =
        (error as any)?.response?.data || (error as any)?.message || error;
      console.error('Error al llamar a N8N:', errMsg);
      return {
        success: false,
        error: errMsg,
      };
    }
  }

  // Confirmación desde N8N - exito o error
  @Post('export/confirm')
  @HttpCode(200)
  async confirmExport(@Body() body: { success: boolean; error?: string }) {
    console.log('Confirmación recibida desde N8N:', body);

    if (body.success) {
      this.socketGateway.server.emit('exportSuccess', {
        message: 'El backlog fue exportado correctamente! Revisa tu casilla de email.',
      });
    } else {
      this.socketGateway.server.emit('exportError', {
        message: 'Hubo un error al exportar el backlog, verifica que este bien tu correo o vuelve a intentarlo.',
        error: body.error,
      });
    }

    return { received: true };
  }
}