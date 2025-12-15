import { Controller, Post, Get, Body, Query, UseGuards, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostDto } from './dto/post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createPost(
        @Body() postDto: PostDto,
        @CurrentUser() user: { userId: number; email: string; nickname: string },
    ) {
        return this.postsService.createPost(postDto, user.userId);
    }

    @Post('update/:post_id')
    @UseGuards(JwtAuthGuard)
    async updatePost(
        @Param('post_id') postId: string,
        @Body() postDto: PostDto,
        @CurrentUser() user: { userId: number; email: string; nickname: string },
    ) {
        return this.postsService.updatePost(postId, postDto, user.userId);
    }

    @Post('delete/:post_id')
    @UseGuards(JwtAuthGuard)
    async deletePost(@Param('post_id') postId: string, @CurrentUser() user: { userId: number; email: string; nickname: string }) {
        return this.postsService.deletePost(postId, user.userId);
    }

    @Post('temp')
    @UseGuards(JwtAuthGuard)
    async tempSavePost(
        @Body() postDto: PostDto,
        @CurrentUser() user: { userId: number; email: string; nickname: string },
    ) {
        return this.postsService.tempSavePost(postDto, user.userId);
    }

    @Get()
    async getPosts(@Query('page') page?: string, @Query('user_id') user_id?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const userId = user_id ? parseInt(user_id, 10) : undefined;
        return this.postsService.getPosts(pageNumber, userId);
    }

    @Get(':post_id')
    async getPostById(@Param('post_id') postId: string) {
        return this.postsService.getPostById(postId);
    }

    @Get('mypage/temp')
    async getTempPosts(@Query('page') page?: string, @Query('user_id') user_id?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const userId = user_id ? parseInt(user_id, 10) : undefined;
        return this.postsService.getTempPosts(pageNumber, userId);
    }
}
