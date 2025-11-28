import { Injectable, UnauthorizedException, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { REDIS_CLIENT } from '../redis/redis.module';
import type { RedisClientType } from 'redis';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        @Inject(REDIS_CLIENT) private redisClient: RedisClientType,
    ) { }


    async register(registerDto: RegisterDto) {

        const existingUser = await this.prisma.user.findUnique({
            where: {
                user_email: registerDto.user_email,
            }
        });

        if (existingUser) {
            throw new UnauthorizedException('이미 존재하는 이메일입니다.');
        }

        // 비밀번호 암호화 (bcrypt)
        const hashedPassword = await bcrypt.hash(registerDto.user_password, 10);

        const user = await this.prisma.user.create({
            data: {
                user_email: registerDto.user_email,
                user_password: hashedPassword,
                user_nickname: registerDto.user_nickname,
            },
        })

        const { user_password, ...result } = user;
        return {
            message: '회원가입이 완료되었습니다.',
            user: result,
        };
    }

    async login(loginDto: LoginDto) {

        const user = await this.prisma.user.findUnique({
            where: {
                user_email: loginDto.user_email,
            }
        });

        if (!user) {
            throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다.')
        }


        const isPasswordVaild = await bcrypt.compare(
            loginDto.user_password,
            user.user_password,
        )

        if (!isPasswordVaild) {
            throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다.')
        }

        // JWT 토큰 생성
        const tokens = await this.generateTokens(user.user_id, user.user_email);

        const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
        const redisKey = `refresh_token:${user.user_id}`;

        try {
            await this.redisClient.setEx(redisKey, 604800, hashedRefreshToken);

        } catch (error) {
            console.error('❌ Redis 저장 실패:', error);
        }

        return {
            ...tokens,
            user: {
                user_id: user.user_id,
                user_email: user.user_email,
                user_nickname: user.user_nickname,
            },
        };

    }

    async generateTokens(userId: number, email: string) {
        const payload = {
            sub: userId,
            email: email
        }

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m',
        });

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
        })

        return {
            accessToken,
            refreshToken,
        }
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken);

            const redisKey = `refresh_token:${payload.sub}`
            const storedHashedToken = await this.redisClient.get(redisKey);

            if (!storedHashedToken) {
                throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
            }

            const isRefreshTokenVaild = await bcrypt.compare(
                refreshToken,
                storedHashedToken,
            );

            if (!isRefreshTokenVaild) {
                throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
            }

            const newAccessToken = this.jwtService.sign(
                {
                    sub: payload.sub,
                    email: payload.email,
                },
                {
                    expiresIn: '15m',
                }
            )

            return {
                accessToken: newAccessToken,
            }
        } catch (error) {
            throw new UnauthorizedException('리프레시 토큰이 만료되었거나 유효하지 않습니다.');
        }
    }

    async logout(userId: number) {
        const redisKey = `refresh_token:${userId}`;
        await this.redisClient.del(redisKey);

        return {
            message: '로그아웃이 완료되었습니다.',
        }
    }

    async getUserById(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { user_id: userId },
            select: {
                user_id: true,
                user_email: true,
                user_nickname: true,
            },
        });

        if (!user) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }

        return user;
    }

}
