import { LoggerModule } from 'nestjs-pino';

export default LoggerModule.forRoot({
  pinoHttp: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: { colorize: true },
          }
        : undefined,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
        };
      },
    },
  },
});
