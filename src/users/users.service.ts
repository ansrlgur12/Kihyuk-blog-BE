import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { UploadService } from '../upload/upload.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * 닉네임 변경
   */
  async updateNickname(userId: number, updateNicknameDto: UpdateNicknameDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      const updatedUser = await this.prisma.user.update({
        where: { user_id: userId },
        data: {
          user_nickname: updateNicknameDto.user_nickname,
        },
        select: {
          user_id: true,
          user_email: true,
          user_nickname: true,
          user_image: true,
        },
      });

      return {
        success: true,
        message: '닉네임이 변경되었습니다.',
        user: updatedUser,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('닉네임 변경 중 오류가 발생했습니다.');
    }
  }

  /**
   * 프로필 이미지 업데이트
   */
  async updateProfileImage(userId: number, imagePath: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 기존 이미지가 있으면 삭제 (attaches 테이블 레코드와 파일 모두 삭제)
      if (user.user_image) {
        await this.deleteImageAttachment(user.user_image);
      }

      // 업로드된 이미지 경로를 user_image에 저장
      const updatedUser = await this.prisma.user.update({
        where: { user_id: userId },
        data: {
          user_image: imagePath,
        },
        select: {
          user_id: true,
          user_email: true,
          user_nickname: true,
          user_image: true,
        },
      });

      return {
        user: updatedUser,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('프로필 이미지 업데이트 중 오류가 발생했습니다.');
    }
  }

  /**
   * 프로필 이미지 삭제
   */
  async deleteProfileImage(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      if (!user.user_image) {
        throw new BadRequestException('프로필 이미지가 없습니다.');
      }

      // attaches 테이블 레코드와 파일 삭제
      await this.deleteImageAttachment(user.user_image);

      // DB에서 이미지 경로 제거
      const updatedUser = await this.prisma.user.update({
        where: { user_id: userId },
        data: {
          user_image: null,
        },
        select: {
          user_id: true,
          user_email: true,
          user_nickname: true,
          user_image: true,
        },
      });

      return {
        success: true,
        message: '프로필 이미지가 삭제되었습니다.',
        user: updatedUser,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('프로필 이미지 삭제 중 오류가 발생했습니다.');
    }
  }

  /**
   * 이미지 첨부파일 삭제 헬퍼 메서드 (attaches 테이블 레코드와 파일 모두 삭제)
   */
  private async deleteImageAttachment(imagePath: string): Promise<void> {
    try {
      // attaches 테이블에서 해당 경로를 가진 레코드 찾기
      const attachment = await this.prisma.attach.findFirst({
        where: {
          att_filepath: imagePath,
        },
      });

      if (attachment) {
        // UploadService의 deleteFile 메서드를 사용하여 파일과 레코드 모두 삭제
        await this.uploadService.deleteFile(attachment.att_idx);
      } else {
        // attaches 테이블에 레코드가 없으면 파일만 삭제
        await this.deleteImageFile(imagePath);
      }
    } catch (error) {
      // 삭제 실패는 로그만 남기고 계속 진행
      console.error('이미지 첨부파일 삭제 실패:', error);
    }
  }

  /**
   * 이미지 파일 삭제 헬퍼 메서드 (파일만 삭제)
   */
  private async deleteImageFile(imagePath: string): Promise<void> {
    try {
      // 경로가 /data/files로 시작하는 경우
      if (imagePath.startsWith('/data/files')) {
        const filePath = path.join(process.cwd(), imagePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } else {
        // 절대 경로인 경우
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    } catch (error) {
      // 파일 삭제 실패는 로그만 남기고 계속 진행
      console.error('이미지 파일 삭제 실패:', error);
    }
  }
}
