import bcrypt from 'bcrypt';

export async function hashPassword(userPassword: string): Promise<string> {
    return await bcrypt.hash(userPassword, 10);
}
