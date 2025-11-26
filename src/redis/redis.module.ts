import { Module, Global } from '@nestjs/common';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const client = createClient({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT')
          },
          password: configService.get('REDIS_PASSWORD'),
        });

        client.on('error', (err) => console.error('❌ Redis Error:', err));
        client.on('connect', () => console.log('✅ Redis Connected!'));

        await client.connect();
        
        // 연결 테스트
        await client.set('connection-test', 'success', { EX: 10 });
        console.log('📝 Redis Test: 연결 성공');
        
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}