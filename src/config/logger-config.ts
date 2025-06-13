import winston, { format, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import ServerConfig from './server-config';

// Define log file directories
const logDirectory: string = path.join(__dirname, '..', 'logs');
const combinedDir: string = path.join(logDirectory, 'combined'); // For all logs
const errorDir: string = path.join(logDirectory, 'error'); // For error logs

/**
 * Defines the custom log format.
 * - Adds timestamp.
 * - Includes stack for errors.
 * - Formats output: `TIMESTAMP [LEVEL]: MESSAGE - STACK (if exists)`.
 */
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }): string => {
        const logMessage = `${timestamp} [${level}]: ${message}`;
        return stack ? `${logMessage} - ${stack}` : logMessage;
    }),
);

/**
 * Creates a Winston logger instance.
 * - Sets log level from `ServerConfig`.
 * - Applies custom `logFormat`.
 * - Configures file transports.
 */
const logger: Logger = winston.createLogger({
    level: ServerConfig.LOG_LEVEL,
    format: logFormat,
    transports: [
        /**
         * Daily rotated file transport for combined logs.
         * - Stores logs in `combinedDir`.
         * - Rotates daily, keeps 14 days, zips old files.
         * - Logs `info` level and above.
         */
        new DailyRotateFile({
            dirname: combinedDir,
            filename: 'combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            zippedArchive: true,
            level: 'info',
        }),

        /**
         * Daily rotated file transport for error logs.
         * - Stores logs in `errorDir`.
         * - Rotates daily, keeps 14 days, zips old files.
         * - Logs `error` level only.
         */
        new DailyRotateFile({
            dirname: errorDir,
            filename: 'error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            zippedArchive: true,
            level: 'error',
        }),
    ],
});

/**
 * Adds console transport in non-production environments.
 * - Colorizes console output for readability.
 * - Applies the same custom log format.
 */
if (ServerConfig.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: format.combine(format.colorize(), logFormat),
        }),
    );
}

export default logger;
