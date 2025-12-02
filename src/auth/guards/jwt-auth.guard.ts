import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // OPTIONS 요청(Preflight)은 통과
    if (request.method === 'OPTIONS') {
      return true;
    }
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      if (info && info.message === 'No auth token') {
        throw new UnauthorizedException('JWT 토큰이 없습니다. Authorization 헤더에 "Bearer <token>" 형식으로 토큰을 포함해주세요.');
      }
      
      if (info && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('JWT 토큰이 만료되었습니다. /auth/refresh 엔드포인트를 사용하여 토큰을 갱신해주세요.');
      }
      
      if (info && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('유효하지 않은 JWT 토큰입니다.');
      }
      
      throw err || new UnauthorizedException('인증에 실패했습니다.');
    }
    
    return super.handleRequest(err, user, info, context);
  }
}