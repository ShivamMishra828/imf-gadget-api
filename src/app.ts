import express, { Express, Request, Response } from 'express';
import ServerConfig from './config/server-config';
import logger from './config/logger-config';
import { StatusCodes } from 'http-status-codes';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import requestLogger from './middlewares/request-logger-middleware';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './middlewares/global-error-handler';

/**
 * @constant app
 * @description The main Express application instance.
 * This is where all middleware and routes are configured.
 */
const app: Express = express();

/**
 * @constant limiter
 * @description Configures the API rate limiter middleware.
 * This helps protect the API from brute-force attacks or excessive requests
 * by limiting the number of requests from a single IP address within a defined time window.
 */
const limiter: RateLimitRequestHandler = rateLimit({
    windowMs: ServerConfig.RATE_LIMIT.WINDOW_MS,
    limit: ServerConfig.RATE_LIMIT.MAX,
    message: 'Too many requests from this IP, please try again after some time.',

    /**
     * @function handler
     * @description Custom handler function executed when a client exceeds the rate limit.
     * This allows for custom logging and a more detailed response to the client.
     */
    handler: (req: Request, res: Response): void => {
        logger.warn(
            `[RATE_LIMIT] Rate limit exceeded for IP: ${req.ip || 'N/A'}, User-Agent: ${req.get('User-Agent') || 'N/A'}, Path: ${req.originalUrl}`,
        );

        // Send a 429 Too Many Requests status code with a descriptive JSON response.
        res.status(StatusCodes.TOO_MANY_REQUESTS).json({
            success: false,
            message:
                'You have sent too many requests. Please wait a few minutes before trying again.',
        });
    },
});

// --- Express Middleware Configuration ---

// Parses incoming JSON payloads with a size limit to prevent large payloads.
app.use(express.json({ limit: '10kb' }));

// Parses incoming URL-encoded payloads. 'extended: true' allows for rich objects and arrays.
app.use(express.urlencoded({ extended: true }));

// Applies the rate limiting middleware to all incoming requests.
app.use(limiter);

// Applies various security HTTP headers.
app.use(helmet());

// Custom middleware to log details of every incoming request and outgoing response.
app.use(requestLogger);

// Parses cookies attached to the request, making them available in req.cookies.
app.use(cookieParser());

// Configures Cross-Origin Resource Sharing (CORS) rules.
app.use(
    cors({
        origin: ServerConfig.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    }),
);

/**
 * @route GET /status
 * @description A simple health check endpoint to verify if the server is running.
 * This endpoint provides basic server status information like uptime and memory usage,
 * which is useful for monitoring and deployment health checks.
 * @returns {object} JSON response with server status.
 */
app.get('/status', (_req: Request, res: Response): void => {
    // Send a 200 OK status code.
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Server is up and running smoothly!',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString(),
    });
});

// Global error handling middleware.
app.use(globalErrorHandler);

export default app;
