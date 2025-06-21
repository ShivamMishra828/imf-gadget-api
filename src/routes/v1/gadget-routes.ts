import express, { Router } from 'express';
import validate from '../../middlewares/validate-middleware';
import { createGadgetSchema } from '../../schemas/gadget-schema';
import { createGadget } from '../../controllers/gadget-controller';
import verifyJwtToken from '../../middlewares/auth-middleware';

/**
 * @constant router
 * @description Creates an Express Router instance specific to gadget-related API routes for version 1.
 * This router will handle operations like creating, retrieving, updating, and deleting gadgets.
 * It's structured to apply common middleware to all gadget routes before specific handlers.
 */
const router: Router = express.Router();

/**
 * @description Applies the `verifyJwtToken` middleware to all routes defined within this router.
 * This means that any request to a gadget endpoint (e.g., POST /api/v1/gadgets/)
 * must include a valid JWT in the cookies to proceed. This ensures that only authenticated
 * users can interact with gadget resources.
 */
router.use(verifyJwtToken);

/**
 * @route POST /api/v1/gadgets/
 * @description Defines the route for creating a new gadget.
 * This endpoint allows an authenticated user to register a new gadget.
 */
router.post('/', validate(createGadgetSchema), createGadget);

export default router;
