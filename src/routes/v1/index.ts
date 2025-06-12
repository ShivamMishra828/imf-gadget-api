import express, { Router } from 'express';
import authRoutes from './auth-routes';
import gadgetRoutes from './gadget-routes';

const router: Router = express.Router();

router.use('/auth', authRoutes);
router.use('/gadgets', gadgetRoutes);

export default router;
