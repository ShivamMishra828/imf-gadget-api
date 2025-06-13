import http from 'http';
import logger from './config/logger-config';
import app from './app';
import ServerConfig from './config/server-config';
import prisma from './config/prisma-client';

// Initialize a variable to hold the HTTP server instance.
let server: http.Server | null = null;

/**
 * Starts the HTTP server and handles initial setup.
 * It listens on the port defined in ServerConfig and logs the server's status.
 */
async function startServer(): Promise<void> {
    // Start the Express application, making it listen for incoming HTTP requests.
    server = app.listen(ServerConfig.PORT, (): void => {
        logger.info(
            `Main-Server: Server started successfully at http://localhost:${ServerConfig.PORT}`,
        );
    });

    // Register an error listener for the server. If the server encounters an error
    // (e.g., port already in use), it will log the error and exit the process.
    server.on('error', (err: Error): void => {
        logger.error('Main-Server: Server encountered an error on startup:', err);
        process.exit(1); // Exit with a failure code.
    });
}

/**
 * Gracefully shuts down the server and closes database connections.
 * This function is called when the process receives termination signals or encounters unhandled exceptions/rejections.
 * @param signal Optional string indicating the signal that triggered the shutdown (e.g., 'SIGINT', 'SIGTERM').
 */
async function shutdownServer(signal?: string): Promise<void> {
    // Log the initiation of the shutdown process and the triggering signal.
    logger.info(`Main-Server: Shutting down server. Received signal: ${signal || 'N/A'}`);

    // Disconnect Prisma client from the database to ensure all pending operations are completed
    // and connections are cleanly closed.
    logger.info('Main-Server: Disconnecting Prisma Database Connection...');
    await prisma.$disconnect();
    logger.info('Main-Server: Prisma Database Connection disconnected.');

    // If the HTTP server instance exists, attempt to close it gracefully.
    if (server) {
        logger.info('Main-Server: Attempting to close HTTP server gracefully...');
        server.close((err?: Error): never => {
            // If an error occurs during server closing, log it and exit with failure.
            if (err) {
                logger.error('Main-Server: Error while closing HTTP server:', err);
                process.exit(1);
            } else {
                // If the server closes successfully, log it and exit with success.
                logger.info('Main-Server: HTTP server has been shut down gracefully!');
                process.exit(0);
            }
        });
    } else {
        // If the server was not running or already closed, log a warning and exit.
        logger.warn(
            'Main-Server: HTTP server was not running or already shut down. No action needed!',
        );
        process.exit(0);
    }
}

// Register listeners for process termination signals.
// SIGINT (Ctrl+C in terminal) and SIGTERM (graceful termination signal).
process.on('SIGINT', shutdownServer);
process.on('SIGTERM', shutdownServer);

// Handle uncaught exceptions (synchronous errors not caught by try/catch).
// These indicate serious programming errors and should lead to immediate shutdown.
process.on('uncaughtException', (err: Error): never => {
    logger.error('Main-Server: UNCAUGHT EXCEPTION! Shutting down...', err);
    // Exit with a failure code to indicate abnormal termination.
    process.exit(1);
});

// Handle unhandled promise rejections (asynchronous errors not caught by .catch()).
// Similar to uncaught exceptions, these indicate critical issues.
process.on('unhandledRejection', (reason: Error | any): never => {
    // Log the rejection reason. If it's an Error object, include its message.
    logger.error(
        'Main-Server: UNHANDLED REJECTION! Shutting down...',
        reason instanceof Error ? reason.message : reason,
    );
    // Exit with a failure code.
    process.exit(1);
});

// Initiate the server startup process.
// If an error occurs during startup, catch it, log it, and exit.
startServer().catch((err: Error): never => {
    logger.error('Main-Server: Critical error during server startup:', err);
    process.exit(1);
});
