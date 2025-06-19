import winston, { format, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import ServerConfig from './server-config';

// Define the base directory for all log files.
const logDirectory: string = path.join(__dirname, '..', 'logs');

// Define the directory for 'combined' logs (info, warn, debug, etc.).
const combinedDir: string = path.join(logDirectory, 'combined');

// Define the directory for 'error' logs (only error level messages).
const errorDir: string = path.join(logDirectory, 'error');

/**
 * @constant logFormat
 * @description Defines the custom format for log messages.
 * This format ensures consistency and includes essential information like timestamp,
 * log level, message, and stack trace for errors.
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
 * @constant logger
 * @description Configures and creates a Winston logger instance.
 * This logger is responsible for handling all application logging, routing messages
 * to different files based on their level (e.g., all to combined, errors to error file).
 */
const logger: Logger = winston.createLogger({
    level: ServerConfig.LOG_LEVEL,
    format: logFormat,

    // Define the transports (where logs will be sent).
    transports: [
        /**
         * @description Transport for all 'info' level and above logs (combined logs).
         * These logs are written to daily rotating files in the 'combined' directory.
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
         * @description Transport for 'error' level logs.
         * These critical logs are written to daily rotating files specifically in the 'error' directory.
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

// Conditionally add a console transport if the environment is not production.
if (ServerConfig.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: format.combine(format.colorize(), logFormat),
        }),
    );
}

export default logger;
