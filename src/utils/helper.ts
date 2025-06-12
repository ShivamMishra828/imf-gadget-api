import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ServerConfig from '../config/server-config';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import otpGenerator from 'otp-generator';

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

export function generateUniqueNames(): string {
    return `The ${uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: ' ',
        style: 'capital',
        length: 2,
    })}`;
}

export function generateConfirmationCode(): string {
    return otpGenerator.generate(6, {
        specialChars: false,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
    });
}
