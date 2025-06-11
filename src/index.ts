import http from 'http';
import logger from './config/logger-config';
import app from './app';
import ServerConfig from './config/server-config';

let server: http.Server | null = null;

async function startServer(): Promise<void> {
    server = app.listen(ServerConfig.PORT, (): void => {
        logger.info(`Server started at http://localhost:${ServerConfig.PORT}`);
    });

    server.on('error', (err: Error): void => {
        logger.error('Server Error:', err);
        process.exit(1);
    });
}

async function shutdownServer(signal?: string): Promise<void> {
    logger.info(`Shutting down server, Received: ${signal || 'N/A'} request`);

    if (server) {
        logger.info('Closing HTTP server...');
        server.close((err?: Error): never => {
            if (err) {
                logger.error('Error while closing HTTP server:', err);
                process.exit(1);
            } else {
                logger.info('HTTP server has been shut down gracefully!');
                process.exit(0);
            }
        });
    } else {
        logger.warn('HTTP server was not running or already shut down. No action needed!');
        process.exit(0);
    }
}

process.on('SIGINT', shutdownServer);
process.on('SIGTERM', shutdownServer);

process.on('uncaughtException', (err: Error): never => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
    process.exit(1);
});

process.on('unhandledRejection', (err: Error): never => {
    logger.error('UNHANDLED REJECTION! Shutting down...', err);
    process.exit(1);
});

startServer().catch((err: Error): never => {
    logger.error('Error starting the server', err);
    process.exit(1);
});
