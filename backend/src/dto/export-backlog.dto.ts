import { IsEmail } from 'class-validator';

export class ExportBacklogDto {
  @IsEmail()
  email: string;
}