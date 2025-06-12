import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ServerConfig from '../config/server-config';

export function hashPassword(userPassword: string): Promise<string> {
    return bcrypt.hash(userPassword, 10);
}

export function comparePassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(inputPassword, hashedPassword);
}

export function generateToken(userId: string): string {
    return jwt.sign({ id: userId }, ServerConfig.JWT_SECRET, {
        expiresIn: '1d',
    });
}
