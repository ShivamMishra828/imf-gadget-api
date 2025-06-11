import dotenv from 'dotenv';

dotenv.config();

interface RateLimitConfig {
    WINDOW_MS: number;
    MAX: number;
}

interface ServerConfig {
    PORT: number;
    RATE_LIMIT: RateLimitConfig;
    CORS_ORIGIN: string;
    DATABASE_URL: string;
    LOG_LEVEL: string;
    NODE_ENV: string;
    JWT_SECRET: string;
}

function getEnvOrThrow(key: string): string {
    const value: string | undefined = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is required but not set`);
    }
    return value;
}

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
