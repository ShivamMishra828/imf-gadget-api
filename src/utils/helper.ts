import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ServerConfig from '../config/server-config';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import otpGenerator from 'otp-generator';

/**
 * @function hashPassword
 * @description Hashes a plain text password using bcrypt.
 * This is a crucial security measure to protect user passwords in the database.
 * Passwords should never be stored in plain text.
 * @param {string} userPassword - The plain text password to be hashed.
 * @returns {Promise<string>} A Promise that resolves to the hashed password string.
 */
export function hashPassword(userPassword: string): Promise<string> {
    return bcrypt.hash(userPassword, 10);
}

/**
 * @function comparePassword
 * @description Compares a plain text password with a hashed password.
 * This is used during the user login process to verify if the provided password matches the stored hash.
 * It's essential to use bcrypt's compare function as it correctly handles salting during comparison.
 * @param {string} inputPassword - The plain text password provided by the user.
 * @param {string} hashedPassword - The hashed password retrieved from the database.
 * @returns {Promise<boolean>} A Promise that resolves to `true` if passwords match, `false` otherwise.
 */
export function comparePassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(inputPassword, hashedPassword);
}

/**
 * @function generateToken
 * @description Generates a JSON Web Token (JWT) for a given user ID.
 * This token is used for authentication and authorization. Once issued,
 * the client includes this token in subsequent requests to prove their identity.
 * @param {string} userId - The unique identifier of the user for whom the token is being generated.
 * @returns {string} The generated JWT string.
 */
export function generateToken(userId: string): string {
    return jwt.sign({ id: userId }, ServerConfig.JWT_SECRET, {
        expiresIn: '1d',
    });
}

/**
 * @function generateUniqueNames
 * @description Generates a unique, human-readable codename for a gadget using a dictionary of adjectives and animals.
 * This ensures that each gadget has a distinct and memorable identifier.
 * @returns {string} A string representing a unique codename (e.g., "The Stealthy Fox", "The Swift Eagle").
 */
export function generateUniqueNames(): string {
    return `The ${uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: ' ',
        style: 'capital',
        length: 2,
    })}`;
}

/**
 * @function generateConfirmationCode
 * @description Generates a 6-digit numeric confirmation code.
 * This is useful for sensitive operations requiring a temporary, one-time code.
 * @returns {string} A 6-character string composed of digits.
 */
export function generateConfirmationCode(): string {
    return otpGenerator.generate(6, {
        specialChars: false,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
    });
}
