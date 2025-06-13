import express, { Express, Request, Response } from 'express';
import ServerConfig from './config/server-config';
import logger from './config/logger-config';
import { StatusCodes } from 'http-status-codes';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import requestLogger from './middlewares/request-logger-middleware';
import globalErrorHandler from './middlewares/global-error-handler';
import apiRoutes from './routes';
import cookieParser from 'cookie-parser';

// Initialize the Express application.
const app: Express = express();

/**
 * Configure API rate limiting to protect against brute-force attacks and abuse.
 * - `windowMs`: Defines the time window (in milliseconds) for which requests are counted.
 * - `limit`: The maximum number of requests allowed within the `windowMs` time frame.
 * - `message`: A generic message sent when the limit is exceeded.
 * - `handler`: Custom handler function when the rate limit is hit, allowing for specific logging.
 */
const limiter: RateLimitRequestHandler = rateLimit({
    windowMs: ServerConfig.RATE_LIMIT.WINDOW_MS,
    limit: ServerConfig.RATE_LIMIT.MAX,
    message: 'Too many requests, try again later',
    handler: (req: Request, res: Response): void => {
        // Log a warning when an IP exceeds the rate limit, including relevant request details.
        logger.warn(
            `Rate limit exceeded for IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}, Path: ${req.originalUrl}`,
        );

        // Send a 429 Too Many Requests status with a user-friendly message.
        res.status(StatusCodes.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Too many requests, try again later. Please wait a few minutes.',
        });
    },
});

/**
 * Global Express middleware configurations.
 * These middlewares are applied to all incoming requests.
 */

// Parses incoming JSON requests with a payload limit.
app.use(express.json({ limit: '10kb' }));

// Parses incoming URL-encoded form data. `extended: true` allows for rich objects and arrays to be encoded.
app.use(express.urlencoded({ extended: true }));

// Apply the configured rate limiting to all requests.
app.use(limiter);

// Apply Helmet to set various HTTP headers for enhanced security.
app.use(helmet());

// Custom middleware to log details of incoming requests and outgoing responses.
app.use(requestLogger);

// Parses cookies attached to the request object.
app.use(cookieParser());

/**
 * Configure CORS (Cross-Origin Resource Sharing) based on `ServerConfig`.
 * `origin`: Specifies allowed origins. `credentials`: Allows cookies to be sent with cross-origin requests.
 * `methods`: Defines allowed HTTP methods.
 */
app.use(
    cors({
        origin: ServerConfig.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    }),
);

/**
 * Health check endpoint.
 * GET /status
 * Provides basic server health information.
 */
app.get('/status', (_req: Request, res: Response): void => {
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Server is up and running smoothly!',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString(),
    });
});

/**
 * Mount the main API routes under the '/api' prefix.
 * All versioned API routes (e.g., /api/v1/auth, /api/v1/gadgets) will be handled here.
 */
app.use('/api', apiRoutes);

/**
 * Global error handling middleware.
 * This should always be the last middleware added, to catch errors from all preceding middlewares and routes.
 */
app.use(globalErrorHandler);

export default app;
