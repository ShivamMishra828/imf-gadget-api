import express, { Express, Request, Response } from 'express';
import ServerConfig from './config/server-config';
import logger from './config/logger-config';
import { StatusCodes } from 'http-status-codes';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import requestLogger from './middlewares/request-logger-middleware';

const app: Express = express();

const limiter: RateLimitRequestHandler = rateLimit({
    windowMs: ServerConfig.RATE_LIMIT.WINDOW_MS,
    limit: ServerConfig.RATE_LIMIT.MAX,
    message: 'Too many requests, try again later',
    handler: (req: Request, res: Response): void => {
        logger.warn(
            `Rate limit exceeded for IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}, Path: ${req.originalUrl}`,
        );
        res.status(StatusCodes.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Too many requests, try again later. Please wait a few minutes.',
        });
    },
});

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use(helmet());
app.use(requestLogger);
app.use(
    cors({
        origin: ServerConfig.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    }),
);

app.get('/status', (_req: Request, res: Response): void => {
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Server is up and running smoothly!',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString(),
    });
});

export default app;
