import { verifyToken } from '@clerk/backend';
import type { Request, Response, NextFunction } from 'express';

export interface ClerkUser {
  userId: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      clerkUser?: ClerkUser;
    }
  }
}

export async function clerkAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.error('CLERK_SECRET_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const payload = await verifyToken(token, { secretKey });
    
    if (!payload.sub) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.clerkUser = {
      userId: payload.sub,
      email: payload.email as string | undefined,
    };

    next();
  } catch (error) {
    console.error('Clerk auth error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalClerkAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  return clerkAuth(req, res, next);
}
