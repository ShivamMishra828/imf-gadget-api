import express, { Router } from 'express';
import validate from '../../middlewares/validate-middleware';
import UserSchema from '../../schemas/auth-schema';
import { signUp } from '../../controllers/auth-controller';

/**
 * @constant router
 * @description Creates a new Express Router instance specific to authentication-related routes.
 * This router will handle routes like `/signup`, `/login`, etc., for version 1 of the API.
 * Using Express Routers helps in organizing routes into modular, maintainable chunks.
 */
const router: Router = express.Router();

/**
 * @route POST /api/v1/auth/signup
 * @description Defines the route for new user registration.
 * This endpoint allows clients to create a new user account.
 */
router.post('/signup', validate(UserSchema, 'body'), signUp);

export default router;
