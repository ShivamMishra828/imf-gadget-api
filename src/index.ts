import http from 'http';
import logger from './config/logger-config';
import app from './app';
import ServerConfig from './config/server-config';

// Declare a variable to hold the HTTP server instance.
let server: http.Server | null = null;

/**
 * @async
 * @function startServer
 * @description Asynchronously starts the HTTP server.
 * This function binds the Express application to a specific port and sets up
 * error handling for the server startup process. It's the entry point for the application.
 */
async function startServer(): Promise<void> {
    // Start the Express application, making it listen for incoming requests on the configured port.
    server = app.listen(ServerConfig.PORT, (): void => {
        logger.info(
            `[SERVER] Server started successfully at http://localhost:${ServerConfig.PORT}`,
        );
    });

    // Attach an 'error' event listener to the server.
    server.on('error', (err: Error): void => {
        logger.error('Main-Server: Server encountered an error on startup:', err);
        // Exit the process with a non-zero code to indicate an error.
        process.exit(1);
    });
}

/**
 * @async
 * @function shutdownServer
 * @description Asynchronously gracefully shuts down the HTTP server.
 * This function handles various shutdown signals (SIGINT, SIGTERM) to ensure
 * ongoing requests are completed before the server fully exits,
 * preventing abrupt disconnections and data loss.
 * @param {string} [signal] - The signal that triggered the shutdown (e.g., 'SIGINT', 'SIGTERM'). Optional.
 */
async function shutdownServer(signal?: string): Promise<void> {
    logger.info(`[SERVER] Initiating server shutdown. Received signal: ${signal || 'N/A'}`);

    // Check if the server instance exists (i.e., if the server was successfully started).
    if (server) {
        logger.info('[SERVER] Attempting to close HTTP server gracefully...');

        // Attempt to close the server. `server.close()` stops the server from accepting new connections
        server.close((err?: Error): never => {
            if (err) {
                // If an error occurs during server closing (e.g., some connections are stuck), log it.
                logger.error(
                    '[SERVER] Error encountered while gracefully closing HTTP server. Forcing exit...',
                    err,
                );
                // Exit with an error code.
                process.exit(1);
            } else {
                // If the server closes successfully, log a success message.
                logger.info('[SERVER] HTTP server has been shut down gracefully!');
                // Exit with a success code.
                process.exit(0);
            }
        });
    } else {
        // If the server instance is null, it means the server was not running or already shut down.
        logger.warn(
            'Main-Server: HTTP server was not running or already shut down. No action needed!',
        );
        // Exit with a success code as the desired state (server off) is achieved.
        process.exit(0);
    }
}

// Listen for SIGINT signal (e.g., Ctrl+C in terminal).
process.on('SIGINT', shutdownServer);

// Listen for SIGTERM signal (used by process managers like Docker, Kubernetes).
process.on('SIGTERM', shutdownServer);

// Catch any uncaught exceptions (synchronous errors not handled).
process.on('uncaughtException', (err: Error): never => {
    logger.error('[FATAL ERROR] UNCAUGHT EXCEPTION! Application is crashing. Exiting...', err);
    process.exit(1);
});

// Catch any unhandled promise rejections (asynchronous errors not handled).
process.on('unhandledRejection', (reason: Error | any): never => {
    logger.error(
        '[FATAL ERROR] UNHANDLED REJECTION! Application is crashing. Exiting...',
        reason instanceof Error ? reason.message : reason,
    );
    process.exit(1);
});

// Start the server and catch any immediate errors from the startup process.
startServer().catch((err: Error): never => {
    logger.error('[SERVER] Critical error during initial server startup. Exiting...', err);
    process.exit(1);
});
