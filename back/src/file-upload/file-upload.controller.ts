import { Controller, Param, Post, UploadedFile, UseInterceptors, BadRequestException, UseGuards } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TrainerGuard } from 'src/guards/trainer.guards';
import { AuthGuard } from 'src/guards/auth.guards';

@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @ApiBearerAuth()
  @Post(':exerciseId')
  @UseGuards(AuthGuard, TrainerGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('exerciseId') exerciseId: string
  ) {
    
    if (!file) {
      throw new BadRequestException('No se ha enviado ningún archivo.');
    }
    
    if (!exerciseId) {
      throw new BadRequestException('Falta el ID del ejercicio.');
    }
    try {
      const result = await this.fileUploadService.uploadFile(file, exerciseId);
      return {
        message: 'Archivo subido y ejercicio actualizado correctamente.',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Error al subir el archivo.');
    }
  }
}
