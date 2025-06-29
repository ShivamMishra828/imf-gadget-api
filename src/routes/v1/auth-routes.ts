import express, { Router } from 'express';
import validate from '../../middlewares/validate-middleware';
import UserSchema from '../../schemas/auth-schema';
import { signUp, signIn, signOut } from '../../controllers/auth-controller';
import verifyJwtToken from '../../middlewares/auth-middleware';

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

/**
 * @route POST /api/v1/auth/signin
 * @description Defines the route for existing user login.
 * This endpoint allows clients to authenticate and receive an access token (via HTTP-only cookie).
 */
router.post('/signin', validate(UserSchema), signIn);

/**
 * @route GET /api/v1/auth/logout
 * @description Defines the route for user logout.
 * This endpoint allows authenticated clients to clear their authentication token cookie,
 * effectively ending their session.
 */
router.get('/logout', verifyJwtToken, signOut);

export default router;
