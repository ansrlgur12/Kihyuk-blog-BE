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
  } from '@nestjs/common';
  import { REDIS_CLIENT } from '../redis/redis.module';
  import type { RedisClientType } from 'redis';
  import { AuthService } from './auth.service';
  import { RegisterDto } from './dto/register.dto';
  import { LoginDto } from './dto/login.dto';
  import { RefreshDto } from './dto/refresh.dto';
  import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto)
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() refreshDto: RefreshDto) {
        return this.authService.refreshAccessToken(refreshDto.refreshToken)
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(@Request() req: any) {
        return this.authService.logout(req.user.userId)
    }
}


