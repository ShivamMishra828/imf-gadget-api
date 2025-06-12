import express, { Router } from 'express';
import validate from '../../middlewares/validate-middleware';
import UserSchema from '../../schemas/auth-schema';
import { signUp } from '../../controllers/auth-controller';

const router: Router = express.Router();

router.post('/signup', validate(UserSchema), signUp);

export default router;
