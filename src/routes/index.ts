import express, { Router } from 'express';
import v1Routes from './v1';

// Initialize an Express Router instance.
const router: Router = express.Router();

/**
 * Mount all version 1 (v1) API routes under the '/v1' path.
 * This acts as the main entry point for all API routes, allowing for easy versioning.
 * E.g., /api/v1/auth/signup, /api/v1/gadgets/
 */
router.use('/v1', v1Routes);

export default router;
