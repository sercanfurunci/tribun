import { Request, Response, NextFunction } from 'express';

export function requireApiSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.SYNC_SECRET;
  if (!secret) {
    next();
    return;
  }
  const provided = req.headers['x-sync-secret'] || req.query.secret;
  if (provided !== secret) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}
