import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 쿠키 파서 미들웨어 설정
  app.use(cookieParser());
  
  // 정적 파일 서빙 설정 - data/files 디렉토리를 /data/files 경로로 서빙
  app.useStaticAssets(join(process.cwd(), 'data', 'files'), {
    prefix: '/data/files',
  });
  
  app.enableCors({
    origin: [
      'http://localhost:5173',  // 개발 환경
      'https://blog.kihyuk.site',  // 프로덕션 프론트엔드 도메인
    ],
    credentials: true,  // JWT 토큰 전송을 위해 필요
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
