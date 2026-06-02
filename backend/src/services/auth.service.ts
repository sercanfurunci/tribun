import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import { User, JWTPayload } from '../types';

export class AuthService {
  async register(username: string, email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username]
    );
    if (existing.rows.length > 0) {
      throw new Error('Email or username already taken');
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await pool.query<User>(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, avatar_url, created_at`,
      [username, email.toLowerCase(), password_hash]
    );

    const user = result.rows[0];
    const token = this.generateToken(user);
    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    const user = result.rows[0];
    if (!user) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Invalid credentials');

    const { password_hash, ...safeUser } = user;
    const token = this.generateToken(safeUser as User);
    return { user: safeUser, token };
  }

  async getProfile(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    const result = await pool.query(
      'SELECT id, username, email, avatar_url, created_at FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  private generateToken(user: Partial<User>): string {
    const payload: JWTPayload = {
      id: user.id!,
      username: user.username!,
      email: user.email!,
    };
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
  }
}

export const authService = new AuthService();
