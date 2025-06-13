import express, { Router } from 'express';
import validate from '../../middlewares/validate-middleware';
import {
    createGadgetSchema,
    getAllGadgetsSchema,
    idParamSchema,
    updateGadgetSchema,
} from '../../schemas/gadget-schema';
import {
    createGadget,
    decommissionGadget,
    getAllGadgets,
    selfDestructGadget,
    updateGadget,
} from '../../controllers/gadget-controller';
import verifyJwtToken from '../../middlewares/auth-middleware';

// Initialize an Express Router instance.
const router: Router = express.Router();

/**
 * Apply JWT authentication middleware to all routes defined in this router.
 * This ensures that all gadget-related operations require an authenticated user.
 */
router.use(verifyJwtToken);

/**
 * Route for creating a new gadget.
 * POST /api/v1/user/
 * - `validate(createGadgetSchema)`: Validates the request body for creating a gadget.
 * - `createGadget`: Controller function to handle the gadget creation logic.
 */
router.post('/', validate(createGadgetSchema), createGadget);

/**
 * Route for fetching all gadgets, with optional filtering by status.
 * GET /api/v1/user/
 * - `validate(getAllGadgetsSchema, 'query')`: Validates query parameters for fetching gadgets.
 * - `getAllGadgets`: Controller function to retrieve gadgets.
 */
router.get('/', validate(getAllGadgetsSchema, 'query'), getAllGadgets);

/**
 * Route for updating an existing gadget.
 * PATCH /api/v1/user/:id
 * - `validate(updateGadgetSchema, 'params')`: Validates both params (for ID) and body (for update data).
 * Note: The `validate` middleware should typically check both `params` and `body` if needed,
 * but the `target` parameter here only specifies `params`. Ensure `updateGadgetSchema`
 * validates both or consider a second `validate` call for the body.
 * - `updateGadget`: Controller function to handle updating a gadget.
 */
router.patch('/:id', validate(updateGadgetSchema, 'params'), updateGadget);

/**
 * Route for decommissioning a gadget.
 * DELETE /api/v1/user/:id
 * - `validate(idParamSchema, 'params')`: Validates the `id` parameter.
 * - `decommissionGadget`: Controller function to handle decommissioning a gadget.
 */
router.delete('/:id', validate(idParamSchema, 'params'), decommissionGadget);

/**
 * Route for triggering a gadget's self-destruction.
 * POST /api/v1/user/:id/self-destruct
 * - `validate(idParamSchema, 'params')`: Validates the `id` parameter.
 * - `selfDestructGadget`: Controller function to handle the self-destruction logic.
 */
router.post('/:id/self-destruct', validate(idParamSchema, 'params'), selfDestructGadget);

export default router;
