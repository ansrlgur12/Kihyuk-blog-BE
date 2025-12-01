import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { memoryStorage } from 'multer';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post(':directory')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
      },
    }),
  )
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('directory') directory: string,
    @Body() uploadFileDto: UploadFileDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('파일이 없습니다.');
    }

    return this.uploadService.uploadFiles(
      files,
      directory,
      uploadFileDto.att_target_type || 'ETC',
      uploadFileDto.att_target || '0',
    );
  }

  @Delete(':att_idx')
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param('att_idx') attIdx: string) {
    const attIdxNum = parseInt(attIdx, 10);
    if (isNaN(attIdxNum)) {
      throw new BadRequestException('Invalid attachment ID');
    }

    return this.uploadService.deleteFile(attIdxNum);
  }
}
