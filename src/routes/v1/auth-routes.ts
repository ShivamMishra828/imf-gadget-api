import express, { Router } from 'express';
import validate from '../../middlewares/validate-middleware';
import UserSchema from '../../schemas/auth-schema';
import { signIn, signUp } from '../../controllers/auth-controller';

const router: Router = express.Router();

router.post('/signup', validate(UserSchema), signUp);
router.post('/signin', validate(UserSchema), signIn);

export default router;
