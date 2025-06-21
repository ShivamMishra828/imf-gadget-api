import express, { Router } from 'express';
import authRoutes from './auth-routes';
import gadgetRoutes from './gadget-routes';

/**
 * @constant router
 * @description Creates an Express Router instance for API Version 1 (v1) routes.
 * This router acts as a central aggregator for all routes belonging to API version 1.
 * It helps in versioning your API by grouping all v1 endpoints under a common path.
 */
const router: Router = express.Router();

/**
 * @route /api/v1/auth
 * @description Mounts the `authRoutes` router under the `/auth` path within the v1 API.
 * This means all routes defined in `authRoutes` (e.g., `/signup`) will now be accessible
 * at paths like `/api/v1/auth/signup`.
 */
router.use('/auth', authRoutes);

/**
 * @route /api/v1/gadgets
 * @description Mounts the `gadgetRoutes` router under the `/gadgets` path within the v1 API.
 * This means all routes defined in `gadgetRoutes` (e.g., `POST /`) will now be accessible
 * at paths like `/api/v1/gadgets/`. This keeps related gadget endpoints organized.
 */
router.use('/gadgets', gadgetRoutes);

export default router;
