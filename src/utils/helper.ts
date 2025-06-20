import bcrypt from 'bcrypt';

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
