import winston, { format, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import ServerConfig from './server-config';

const logDirectory: string = path.join(__dirname, '..', 'logs');
const combinedDir: string = path.join(logDirectory, 'combined');
const errorDir: string = path.join(logDirectory, 'error');

const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }): string => {
        const logMessage = `${timestamp} [${level}]: ${message}`;
        return stack ? `${logMessage} - ${stack}` : logMessage;
    }),
);

const logger: Logger = winston.createLogger({
    level: ServerConfig.LOG_LEVEL,
    format: logFormat,
    transports: [
        new DailyRotateFile({
            dirname: combinedDir,
            filename: 'combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            zippedArchive: true,
            level: 'info',
        }),
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

if (ServerConfig.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: format.combine(format.colorize(), logFormat),
        }),
    );
}

export default logger;
