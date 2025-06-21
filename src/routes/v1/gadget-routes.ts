import express, { Router } from 'express';
import validate from '../../middlewares/validate-middleware';
import {
    createGadgetSchema,
    getAllGadgetsSchema,
    updateGadgetSchema,
    idParamSchema,
} from '../../schemas/gadget-schema';
import {
    createGadget,
    getAllGadgets,
    updateGadget,
    decommissionGadget,
    selfDestructGadget,
} from '../../controllers/gadget-controller';
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

/**
 * @route GET /api/v1/gadgets/
 * @description Defines the route for fetching a list of all gadgets.
 * This endpoint allows an authenticated user to retrieve gadget details, optionally filtered by status.
 */
router.get('/', validate(getAllGadgetsSchema, 'query'), getAllGadgets);

/**
 * @route PATCH /api/v1/gadgets/:id
 * @description Defines the route for partially updating an existing gadget by its ID.
 * This endpoint allows an authenticated user to modify specific fields of a gadget.
 */
router.patch(
    '/:id',
    validate(updateGadgetSchema, 'params'),
    validate(updateGadgetSchema, 'body'),
    updateGadget,
);

/**
 * @route DELETE /api/v1/gadgets/:id
 * @description Defines the route for decommissioning (soft-deleting) a gadget by its ID.
 * This endpoint allows an authenticated user to mark a gadget as 'Decommissioned'.
 */
router.delete('/:id', validate(idParamSchema, 'params'), decommissionGadget);

/**
 * @route POST /api/v1/gadgets/:id/self-destruct
 * @description Defines the route for triggering a gadget's self-destruct sequence.
 * This endpoint allows an authenticated user to mark a gadget as 'Destroyed' and
 * receives a confirmation code. This is an irreversible action.
 */
router.post('/:id/self-destruct', validate(idParamSchema, 'params'), selfDestructGadget);

export default router;
