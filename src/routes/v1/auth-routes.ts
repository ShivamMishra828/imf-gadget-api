import express, { Router } from 'express';
import validate from '../../middlewares/validate-middleware';
import UserSchema from '../../schemas/auth-schema';
import { signIn, signUp, signOut } from '../../controllers/auth-controller';
import verifyJwtToken from '../../middlewares/auth-middleware';

const router: Router = express.Router();

router.post('/signup', validate(UserSchema), signUp);
router.post('/signin', validate(UserSchema), signIn);
router.get('/logout', verifyJwtToken, signOut);

export default router;
