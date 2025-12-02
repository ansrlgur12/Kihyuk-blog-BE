import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostDto } from './dto/post.dto';

@Injectable()
export class PostsService {

    constructor(
        private prisma: PrismaService
    ) { }

    async createPost(postDto: PostDto, userId: number) {
        try {
            const post = await this.prisma.post.create({
                data: {
                    post_title: postDto.post_title,
                    post_content: postDto.post_content,
                    post_author_id: userId,
                    post_thumbnail: postDto.post_thumbnail,
                    post_status: postDto.post_status || 'Y',
                },
            });

            if (!post) {
                throw new InternalServerErrorException('게시글 생성 실패');
            }

            return {
                success: true,
                message: '게시글 생성 완료',
            };
        } catch (err) {
            console.error('❌ 게시글 생성 실패:', err);
            throw new InternalServerErrorException('게시글 생성 실패');
        }
    }

    async tempSavePost(postDto: PostDto, userId: number) {
        try {
            const post = await this.prisma.post.create({
                data: {
                    post_title: postDto.post_title,
                    post_content: postDto.post_content || '',
                    post_author_id: userId,
                    post_thumbnail: postDto.post_thumbnail || '',
                    post_status: 'T', // 임시저장
                },
            });

            if (!post) {
                throw new InternalServerErrorException('임시저장 실패');
            }

            return {
                success: true,
                message: '임시저장 완료',
                data: post,
            };
        } catch (err) {
            console.error('❌ 임시저장 실패:', err);
            throw new InternalServerErrorException('임시저장 실패');
        }
    }


    async getPosts(page: number = 1) {
        try {
            const pageSize = 8;
            const skip = (page - 1) * pageSize;

            // 활성 상태인 게시글만 조회
            const [posts, totalCount] = await Promise.all([
                this.prisma.post.findMany({
                    where: {
                        post_status: 'Y', // 활성 상태만
                    },
                    skip: skip,
                    take: pageSize,
                    orderBy: {
                        post_created_at: 'desc', // 최신순
                    },
                    include: {
                        author: {
                            select: {
                                user_id: true,
                                user_nickname: true,
                            },
                        },
                    },
                }),
                this.prisma.post.count({
                    where: {
                        post_status: 'Y',
                    },
                }),
            ]);

            const totalPages = Math.ceil(totalCount / pageSize);

            return {
                posts,
                pagination: {
                    currentPage: page,
                    pageSize: pageSize,
                    totalCount,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            };
        } catch (err) {
            console.error('❌ 게시글 조회 실패:', err);
            throw new InternalServerErrorException('게시글 조회 실패');
        }
    }
}
