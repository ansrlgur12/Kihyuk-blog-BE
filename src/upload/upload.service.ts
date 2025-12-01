import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import md5 from 'md5';
import randomstring from 'randomstring';

@Injectable()
export class UploadService {
  private readonly uploadRoot: string;
  private readonly validImageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
  private readonly validVideoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // 프로젝트 루트 경로 설정
    this.uploadRoot = path.join(process.cwd(), 'data', 'files');
  }

  /**
   * 파일 업로드 처리
   */
  async uploadFiles(
    files: Express.Multer.File[],
    directory: string,
    attTargetType: string = 'ETC',
    attTarget: string = '0',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('파일 확인 실패');
    }

    const upPath = path.posix.join(directory);
    const uploadPath = path.join(this.uploadRoot, upPath);

    // 디렉토리 생성
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const resultArray: Array<{ att_idx: number; att_filepath: string }> = [];

    for (const file of files) {
      const originalName = file.originalname;
      const ext = path.extname(originalName);
      const fileName = this.generateFileName(originalName, ext);
      const filePath = path.join(uploadPath, fileName);
      const fileUrl = path.posix.join('/data/files', upPath, fileName);

      // 파일 저장
      fs.writeFileSync(filePath, file.buffer);

      // 데이터베이스에 메타데이터 저장
      try {
        const fileData = await this.prisma.attach.create({
          data: {
            att_target_type: attTargetType,
            att_target: attTarget,
            att_origin: originalName,
            att_filepath: `/data/files/${upPath}/${fileName}`,
            att_ext: ext.substring(1), // 점 제거
            att_is_image: this.isImageFile(ext) ? 'Y' : 'N',
          },
        });

        resultArray.push({
          att_idx: fileData.att_idx,
          att_filepath: fileUrl,
        });
      } catch (error) {
        // DB 저장 실패 시 파일 삭제
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw new InternalServerErrorException('파일 메타데이터 저장 실패');
      }
    }

    return resultArray;
  }

  /**
   * 단일 파일 업로드
   */
  async uploadSingleFile(file: Express.Multer.File, targetPath: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    const upPath = path.posix.join(targetPath, year, month);
    const uploadPath = path.join(process.cwd(), 'src', 'assets', upPath);

    // 디렉토리 생성
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const originalName = file.originalname;
    let fileName = this.generateFileName(originalName, ext);
    let filePath = path.join(uploadPath, fileName);

    // 파일명 중복 체크
    while (fs.existsSync(filePath)) {
      fileName = this.generateFileName(originalName, ext);
      filePath = path.join(uploadPath, fileName);
    }

    // 파일 저장
    fs.writeFileSync(filePath, file.buffer);

    return filePath;
  }

  /**
   * 여러 파일 업로드 및 정보 반환 (이미지/비디오만 허용)
   */
  async uploadFilesAndGetInfo(
    files: Express.Multer.File[],
    targetPath: string,
  ) {
    const uploadedFiles: Array<{
      originalName: string;
      path: string;
      ext: string;
      isVideo: boolean;
    }> = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();

      // 이미지와 비디오 파일 확장자 확인
      if (!this.validImageExtensions.includes(ext) && !this.validVideoExtensions.includes(ext)) {
        throw new BadRequestException('Invalid file type. Only image or video files are allowed.');
      }

      const uploadedFilePath = await this.uploadSingleFile(file, targetPath);
      if (uploadedFilePath) {
        uploadedFiles.push({
          originalName: file.originalname,
          path: uploadedFilePath,
          ext: ext,
          isVideo: this.validVideoExtensions.includes(ext),
        });
      }
    }

    return uploadedFiles;
  }

  /**
   * 파일 삭제
   */
  async deleteFile(attIdx: number) {
    try {
      // 데이터베이스에서 파일 정보 조회
      const fileInfo = await this.prisma.attach.findUnique({
        where: { att_idx: attIdx },
      });

      if (!fileInfo) {
        throw new BadRequestException('File not found in database');
      }

      // 파일 경로 생성
      const filePath = path.normalize(path.join(process.cwd(), fileInfo.att_filepath));
      
      // 파일 삭제
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // 데이터베이스에서 레코드 삭제
      await this.prisma.attach.delete({
        where: { att_idx: attIdx },
      });

      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('파일 삭제 실패');
    }
  }

  /**
   * 파일명 생성
   */
  private generateFileName(originalName: string, ext: string): string {
    return md5(`${Date.now()}_${originalName}`) + randomstring.generate(5) + ext;
  }

  /**
   * 이미지 파일 여부 확인
   */
  private isImageFile(ext: string): boolean {
    return this.validImageExtensions.includes(ext.toLowerCase());
  }

  /**
   * 업로드 디렉토리 경로 생성
   */
  getUploadPath(directory: string): string {
    const upPath = path.posix.join(directory);
    return path.join(this.uploadRoot, upPath);
  }
}
