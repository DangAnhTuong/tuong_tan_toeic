// PM2 Ecosystem Config — Tường Tận TOEIC Backend
// Usage: pm2 start ecosystem.config.js --env production

module.exports = {
  apps: [
    {
      name: 'tuong-tan-toeic-api',
      script: 'src/server.js',
      cwd: '/var/www/tuong-tan-toeic/backend',
      instances: 2,           // Use 'max' for all CPU cores, or set to number
      exec_mode: 'cluster',   // Load balancing between instances
      watch: false,           // Don't watch files in production
      max_memory_restart: '500M',

      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
        // All other secrets should come from .env file or system env vars
        // DO NOT hardcode JWT_SECRET or MONGODB_URI here
      },

      // Log rotation
      error_file: '/var/log/pm2/toeic-api-err.log',
      out_file: '/var/log/pm2/toeic-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Auto-restart config
      autorestart: true,
      restart_delay: 4000,
      max_restarts: 10,

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000
    }
  ]
};
