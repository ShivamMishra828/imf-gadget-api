import express, { Router } from 'express';
import validate from '../../middlewares/validate-middleware';
import {
    createGadgetSchema,
    decommissionGadgetSchema,
    getAllGadgetsSchema,
    updateGadgetSchema,
} from '../../schemas/gadget-schema';
import {
    createGadget,
    decommissionGadget,
    getAllGadgets,
    updateGadget,
} from '../../controllers/gadget-controller';
import verifyJwtToken from '../../middlewares/auth-middleware';

const router: Router = express.Router();

router.use(verifyJwtToken);

router.post('/', validate(createGadgetSchema), createGadget);
router.get('/', validate(getAllGadgetsSchema, 'query'), getAllGadgets);
router.patch('/:id', validate(updateGadgetSchema), updateGadget);
router.delete('/:id', validate(decommissionGadgetSchema, 'params'), decommissionGadget);

export default router;
