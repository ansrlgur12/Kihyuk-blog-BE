module.exports = {
    apps: [
      {
        name: 'blog-backend',
        script: './dist/main.js',
        instances: 1,
        exec_mode: 'fork',
        
        // 환경변수
        env_production: {
          NODE_ENV: 'production',
          PORT: 3000,
        },
        
        // .env 파일 사용
        env_file: '.env',
        
        // 재시작 설정
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',
        
        // 로그
        error_file: './logs/error.log',
        out_file: './logs/output.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true,
        
        // 크론 재시작 (매일 새벽 4시)
        cron_restart: '0 4 * * *',
        
        // 시간대
        time: true,
      },
    ],
  };