import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ServerConfig from '../config/server-config';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import otpGenerator from 'otp-generator';

/**
 * Hashes a plain-text password using bcrypt.
 * @param userPassword The plain-text password to hash.
 * @returns A promise that resolves to the hashed password string.
 */
export function hashPassword(userPassword: string): Promise<string> {
    // Generates a salt and hashes the password with 10 rounds of complexity.
    return bcrypt.hash(userPassword, 10);
}

/**
 * Compares a plain-text password with a hashed password.
 * @param inputPassword The plain-text password provided by the user.
 * @param hashedPassword The hashed password stored in the database.
 * @returns A promise that resolves to true if the passwords match, false otherwise.
 */
export function comparePassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
    // Compares the input password against the stored hash.
    return bcrypt.compare(inputPassword, hashedPassword);
}

/**
 * Generates a JSON Web Token (JWT) for a given user ID.
 * @param userId The ID of the user for whom the token is being generated.
 * @returns The generated JWT string.
 */
export function generateToken(userId: string): string {
    // Signs the JWT with the user ID, using the secret key from server config, and sets an expiry.
    return jwt.sign({ id: userId }, ServerConfig.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day.
    });
}

/**
 * Generates a unique, readable name (e.g., "The Brave Eagle").
 * @returns A unique, capitalized name string.
 */
export function generateUniqueNames(): string {
    // Uses `unique-names-generator` to combine adjectives and animals.
    return `The ${uniqueNamesGenerator({
        dictionaries: [adjectives, animals], // Uses dictionaries of adjectives and animals.
        separator: ' ', // Separates words with a space.
        style: 'capital', // Capitalizes the first letter of each word.
        length: 2, // Generates names with two words.
    })}`;
}

/**
 * Generates a random numeric confirmation code (OTP).
 * @returns A 6-digit numeric string confirmation code.
 */
export function generateConfirmationCode(): string {
    // Generates a 6-digit number, excluding special characters, lowercase, and uppercase alphabets.
    return otpGenerator.generate(6, {
        specialChars: false, // Do not include special characters.
        lowerCaseAlphabets: false, // Do not include lowercase alphabets.
        upperCaseAlphabets: false, // Do not include uppercase alphabets.
    });
}
