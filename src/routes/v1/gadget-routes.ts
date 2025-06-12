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

const router: Router = express.Router();

router.use(verifyJwtToken);

router.post('/', validate(createGadgetSchema), createGadget);
router.get('/', validate(getAllGadgetsSchema, 'query'), getAllGadgets);
router.patch('/:id', validate(updateGadgetSchema, 'params'), updateGadget);
router.delete('/:id', validate(idParamSchema, 'params'), decommissionGadget);
router.post('/:id/self-destruct', validate(idParamSchema, 'params'), selfDestructGadget);

export default router;
