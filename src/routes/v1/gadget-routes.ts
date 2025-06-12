import express, { Router } from 'express';
import validate from '../../middlewares/validate-middleware';
import { createGadgetSchema } from '../../schemas/gadget-schema';
import { createGadget } from '../../controllers/gadget-controller';
import verifyJwtToken from '../../middlewares/auth-middleware';

const router: Router = express.Router();

router.use(verifyJwtToken);

router.post('/', validate(createGadgetSchema), createGadget);

export default router;
