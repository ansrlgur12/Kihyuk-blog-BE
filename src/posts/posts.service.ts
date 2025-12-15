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


    async getPosts(page: number = 1, userId?: number) {
        try {
            const pageSize = 8;
            const skip = (page - 1) * pageSize;

            // where 조건 동적 생성
            const whereCondition: any = {
                post_status: 'Y', 
            };

            // userId가 있으면 해당 유저의 게시글만 조회
            if (userId) {
                whereCondition.post_author_id = userId;
            }

            // 활성 상태인 게시글만 조회
            const [posts, totalCount] = await Promise.all([
                this.prisma.post.findMany({
                    where: whereCondition,
                    skip: skip,
                    take: pageSize,
                    orderBy: {
                        post_created_at: 'desc', 
                    },
                    include: {
                        author: {
                            select: {
                                user_id: true,
                                user_nickname: true,
                                user_image: true,
                            },
                        },
                    },
                }),
                this.prisma.post.count({
                    where: whereCondition,
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

    async getPostById(postId: string) {
        try {
            const post = await this.prisma.post.findUnique({
                where: {
                    post_id: parseInt(postId, 10),
                },
                include: {
                    author: {
                        select: {
                            user_id: true,
                            user_nickname: true,
                            user_image: true,
                        },
                    },
                },
            });

            if (!post) {
                throw new NotFoundException('게시글을 찾을 수 없습니다.');
            }

            return {
                success: true,
                message: '게시글 조회 완료',
                post: post,
            };

        } catch (err) {
            console.error('❌ 게시글 조회 실패:', err);
            throw new InternalServerErrorException('게시글 조회 실패');
        }
    }

}
