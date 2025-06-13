import dotenv from 'dotenv';

// Load environment variables from a .env file into process.env.
dotenv.config();

/**
 * Defines the structure for rate limiting configuration.
 * - WINDOW_MS: The time window in milliseconds for which requests are counted.
 * - MAX: The maximum number of requests allowed within the window.
 */
interface RateLimitConfig {
    WINDOW_MS: number;
    MAX: number;
}

/**
 * Defines the overall structure for the server's configuration.
 * All essential application settings are defined here.
 */
interface ServerConfig {
    PORT: number; // Port on which the server will listen.
    RATE_LIMIT: RateLimitConfig; // Configuration for API rate limiting.
    CORS_ORIGIN: string; // Allowed origins for Cross-Origin Resource Sharing.
    DATABASE_URL: string; // Connection string for the database.
    LOG_LEVEL: string; // Minimum level for logging messages (e.g., 'info', 'debug', 'error').
    NODE_ENV: string; // Current operational environment (e.g., 'development', 'production', 'test').
    JWT_SECRET: string; // Secret key for signing and verifying JSON Web Tokens.
}

/**
 * Helper function to retrieve an environment variable or throw an error if it's not set.
 * This ensures that critical environment variables are always present at runtime,
 * preventing unexpected application behavior or security vulnerabilities.
 * @param key The name of the environment variable.
 * @returns The value of the environment variable.
 * @throws Error if the environment variable is not set.
 */
function getEnvOrThrow(key: string): string {
    const value: string | undefined = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is required but not set`);
    }
    return value;
}

/**
 * Populates the `ServerConfig` object with values from environment variables.
 * - `PORT`: Defaults to 3000 if not specified. Parsed as an integer.
 * - `RATE_LIMIT`: Parses `WINDOW_MS` and `MAX` with sensible defaults.
 * - `CORS_ORIGIN`: Defaults to '*' (allow all) if not specified, though specific origins are recommended for production.
 * - `DATABASE_URL` and `JWT_SECRET`: These are critical and must be set, hence `getEnvOrThrow` is used.
 * - `LOG_LEVEL`: Defaults to 'info' if not specified.
 * - `NODE_ENV`: Defaults to 'development' if not specified.
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
