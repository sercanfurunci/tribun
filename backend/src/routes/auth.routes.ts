import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { register, login, getMe, registerValidation, loginValidation } from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', authenticate, getMe);

export default router;
