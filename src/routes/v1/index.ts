import express, { Router } from 'express';
import authRoutes from './auth-routes';
import gadgetRoutes from './gadget-routes';

// Initialize an Express Router instance.
const router: Router = express.Router();

/**
 * Mount authentication routes under the '/auth' path.
 * All routes defined in `auth-routes.ts` will be prefixed with `/auth`.
 * E.g., POST /api/v1/auth/signup
 */
router.use('/auth', authRoutes);

/**
 * Mount gadget-related routes under the '/gadgets' path.
 * All routes defined in `user-routes.ts` will be prefixed with `/gadgets`.
 * as this router handles gadget-specific operations).
 * E.g., POST /api/v1/gadgets/
 */
router.use('/gadgets', gadgetRoutes);

export default router;
