import dotenv from 'dotenv';

// Load environment variables from the .env file.
dotenv.config();

/**
 * @interface RateLimitConfig
 * @description Defines the structure for rate limiting configuration.
 * This helps ensure type safety when accessing rate limit properties.
 */
interface RateLimitConfig {
    WINDOW_MS: number;
    MAX: number;
}

/**
 * @interface ServerConfig
 * @description Defines the comprehensive structure for all server-related configurations.
 * Using an interface ensures all expected configuration properties are present
 * and have the correct type, which is crucial for maintainability and avoiding runtime errors.
 */
interface ServerConfig {
    PORT: number;
    RATE_LIMIT: RateLimitConfig;
    CORS_ORIGIN: string;
    DATABASE_URL: string;
    LOG_LEVEL: string;
    NODE_ENV: string;
    JWT_SECRET: string;
}

/**
 * @function getEnvOrThrow
 * @description Helper function to retrieve an environment variable.
 * If the variable is not set, it throws an error.
 * This is a robust way to ensure that critical environment variables
 * are always present before the application starts, preventing unexpected behavior later.
 * @param {string} key The name of the environment variable to retrieve.
 * @returns {string} The value of the environment variable.
 * @throws {Error} If the environment variable is not found.
 */
function getEnvOrThrow(key: string): string {
    const value: string | undefined = process.env[key];
    if (!value) {
        throw new Error(
            `[Config Error]: Environment variable '${key}' is required but not set. Please ensure it is defined in your .env file or environment.`,
        );
    }
    return value;
}

/**
 * @constant ServerConfig
 * @description An object containing all the parsed and validated server configuration settings.
 * This is the main export of this file, providing a centralized and type-safe
 * way to access all application configurations.
 */
const ServerConfig: ServerConfig = {
    PORT: parseInt(process.env.PORT || '3000'),
    RATE_LIMIT: {
        WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '600000'),
        MAX: parseInt(process.env.RATE_LIMIT_MAX || '20'),
    },
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    DATABASE_URL: getEnvOrThrow('DATABASE_URL'),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: getEnvOrThrow('JWT_SECRET'),
};

export default ServerConfig;
