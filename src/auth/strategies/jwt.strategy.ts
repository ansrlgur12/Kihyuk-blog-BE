import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {

        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('환경변수 JWT_SECRET이 설정되지 않았습니다.');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret
        });
    }

    async validate(payload: any) {
        // DB에서 사용자 확인
        const user = await this.prisma.user.findUnique({
            where: { user_id: payload.sub },
        });

        if (!user) {
            throw new UnauthorizedException('사용자를 찾을 수 없습니다');
        }

        // 반환된 객체는 @Request() req.user로 접근 가능
        return {
            userId: user.user_id,
            email: user.user_email,
            nickname: user.user_nickname,
            userImage: user.user_image,
        };
    }
}