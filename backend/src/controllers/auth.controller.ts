import { Request, Response } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth';

export const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register(username, email, password);
    res.status(201).json({ message: 'Account created successfully', ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    res.status(400).json({ error: message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ message: 'Login successful', ...result });
  } catch {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = await authService.getProfile(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}
