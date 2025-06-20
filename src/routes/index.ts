import express, { Router } from 'express';
import v1Routes from './v1';

/**
 * @constant router
 * @description Creates the root Express Router instance for all API versions.
 * This is the top-level router that acts as the entry point for all API requests.
 * It allows us to manage different API versions (e.g., /v1, /v2) in a structured way.
 */
const router: Router = express.Router();

/**
 * @route /api/v1
 * @description Mounts the `v1Routes` router under the `/v1` path.
 * This means all routes defined within `v1Routes` (e.g., `/auth/signup`) will now be accessible
 * under the `/api/v1` prefix, for example, `/api/v1/auth/signup`.
 * This setup is essential for API versioning, allowing you to introduce new versions
 * without breaking existing client integrations.
 */
router.use('/v1', v1Routes);

export default router;
