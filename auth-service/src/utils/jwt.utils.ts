import * as jwt from 'jsonwebtoken';

const JWT_SECRET: string =
  process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  id: number
  role: string
}

export class JwtUtils {
  static generateToken(payload: JwtPayload): string {
    // @ts-ignore - Workaround pour problème de typage jwt
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}
