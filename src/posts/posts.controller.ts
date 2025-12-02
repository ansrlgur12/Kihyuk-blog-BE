import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostDto } from './dto/post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async createPost(
        @Body() postDto: PostDto,
        @CurrentUser() user: { userId: number; email: string; nickname: string },
    ) {
        return this.postsService.createPost(postDto, user.userId);
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
    async getPosts(@Query('page') page?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        return this.postsService.getPosts(pageNumber);
    }
}
