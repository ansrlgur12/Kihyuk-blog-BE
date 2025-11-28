import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Inject,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { REDIS_CLIENT } from '../redis/redis.module';
import type { RedisClientType } from 'redis';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
    @Inject(REDIS_CLIENT) private redisClient: RedisClientType,
  ) { }

  // @Get('test-redis')
  // async testRedis() {
  //     try {
  //         await this.cacheManager.set('test-key', 'test-value', 60);
  //         const value = await this.cacheManager.get('test-key');
  //         return { success: true, value };
  //     } catch (error) {
  //         return { success: false, error: error.message };
  //     }
  // }

  @Get('redis-keys')
  async getRedisKeys() {
    try {
      const keys = await this.redisClient.keys('*');

      const data = {};
      for (const key of keys) {
        data[key] = await this.redisClient.get(key);
      }

      return {
        success: true,
        count: keys.length,
        keys: keys,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('redis-check/:userId')
  async checkRedisKey(@Param('userId') userId: string) {
    try {
      const key = `refresh_token:${userId}`;
      const value = await this.redisClient.get(key);
      const ttl = await this.redisClient.ttl(key);

      return {
        success: true,
        key: key,
        exists: value !== null,
        has_value: !!value,
        ttl: ttl,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }




  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }


  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res() res: any) {
    const token = await this.authService.login(loginDto)

    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      secure: true,
      // sameSite: 'strict',
      sameSite: 'none',  // 크로스 도메인 쿠키 전송을 위해 필요

      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.json({
      accessToken: token.accessToken,
      user: token.user,
    })
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: any) {
    // 쿠키에서 refreshToken 추출
    const refreshToken = req.cookies['refreshToken'];
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard) // JWT 검증
  async getMe(@CurrentUser() user: any) {
    // JWT에서 추출한 user 정보 반환
    return this.authService.getUserById(user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.userId)
  }


}


