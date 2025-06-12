import { Request, Response, NextFunction } from 'express';
import UserRepository from '../repositories/user-repository';
import UserService from '../services/auth-service';
import logger from '../config/logger-config';
import { StatusCodes } from 'http-status-codes';
import { SuccessResponse } from '../utils/responses';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export async function signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { email, password } = req.body;

        const user = await userService.signUp({ email, password });

        res.status(StatusCodes.CREATED).json(
            new SuccessResponse(user, 'User successfully registered'),
        );
    } catch (error) {
        logger.error(`Error during user signup in controller: ${error}`);
        next(error);
    }
}

export async function signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { email, password } = req.body;

        const { user, token } = await userService.signIn({ email, password });

        res.status(StatusCodes.OK).json(
            new SuccessResponse({ user, token }, 'User successfully logged in'),
        );
    } catch (error) {
        logger.error(`Error during user sign-in in controller: ${error}`);
        next(error);
    }
}
