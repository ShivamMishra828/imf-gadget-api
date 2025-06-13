import express, { Router } from 'express';
import validate from '../../middlewares/validate-middleware';
import UserSchema from '../../schemas/auth-schema';
import { signIn, signUp, signOut } from '../../controllers/auth-controller';
import verifyJwtToken from '../../middlewares/auth-middleware';

// Initialize an Express Router instance.
const router: Router = express.Router();

/**
 * Route for user sign-up.
 * POST /api/v1/auth/signup
 * - `validate(UserSchema)`: Middleware to validate request body against UserSchema.
 * - `signUp`: Controller function to handle user registration logic.
 */
router.post('/signup', validate(UserSchema), signUp);

/**
 * Route for user sign-in.
 * POST /api/v1/auth/signin
 * - `validate(UserSchema)`: Middleware to validate request body against UserSchema.
 * - `signIn`: Controller function to handle user login logic.
 */
router.post('/signin', validate(UserSchema), signIn);

/**
 * Route for user sign-out.
 * GET /api/v1/auth/logout
 * - `verifyJwtToken`: Middleware to authenticate the user via JWT.
 * - `signOut`: Controller function to handle user logout logic (e.g., clearing token).
 */
router.get('/logout', verifyJwtToken, signOut);

export default router;
