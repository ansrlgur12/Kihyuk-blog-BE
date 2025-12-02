import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
    constructor(
        private prisma: PrismaService
    ) { }

    async createComment(commentDto: CommentDto) {
        try {
            const comment = await this.prisma.comment.create({
                data: {
                    comment_content: commentDto.comment_content,
                    comment_author_id: commentDto.comment_author_id,
                    comment_post_id: commentDto.comment_post_id,
                    comment_status: commentDto.comment_status || 'Y',
                },
            });

            if (!comment) {
                throw new InternalServerErrorException('댓글 생성 실패');
            }

            return {
                success: true,
                message: '댓글 생성 완료',
            };
        } catch (err) {
            console.error('❌ 댓글 생성 실패:', err);
            throw new InternalServerErrorException('댓글 생성 실패');
        }
    }
}
