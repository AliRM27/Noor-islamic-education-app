import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    type: "child" | "parent";
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    console.error("Access token required");
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      type: "child" | "parent";
    };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireParent = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.type !== "parent") {
    res.status(403).json({ error: "Parent access required" });
    return;
  }
  next();
};

export const requireChild = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.type !== "child") {
    res.status(403).json({ error: "Child access required" });
    return;
  }
  next();
};
