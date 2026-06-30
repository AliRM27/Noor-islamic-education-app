import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Parent from "../models/Parent";
import User from "../models/User";
import { authRateLimit } from "../middleware/rateLimit";

const router = Router();

const generateTokens = (id: string, type: "child" | "parent") => {
  const accessToken = jwt.sign({ id, type }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as any,
  });
  const refreshToken = jwt.sign({ id, type }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "30d") as any,
  });
  return { accessToken, refreshToken };
};

// POST /api/auth/register/parent
router.post(
  "/register/parent",
  authRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }
      if (password.length < 8) {
        res
          .status(400)
          .json({ error: "Password must be at least 8 characters" });
        return;
      }
      const existing = await Parent.findOne({ email: email.toLowerCase() });
      if (existing) {
        res.status(409).json({ error: "Email already registered" });
        return;
      }
      const parent = new Parent({ email, password_hash: password });
      await parent.save();

      const tokens = generateTokens(parent._id.toString(), "parent");
      res
        .status(201)
        .json({ parent: { id: parent._id, email: parent.email }, ...tokens });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Server error" });
    }
  },
);

// POST /api/auth/login/parent
router.post(
  "/login/parent",
  authRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const parent = await Parent.findOne({ email: email?.toLowerCase() });
      if (!parent || !(await parent.comparePassword(password))) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
      const tokens = generateTokens(parent._id.toString(), "parent");
      res.json({ parent: { id: parent._id, email: parent.email }, ...tokens });
    } catch {
      res.status(500).json({ error: "Server error" });
    }
  },
);

// POST /api/auth/create/child  (parent auth optional — children can self-register)
router.post(
  "/create/child",
  authRateLimit,
  async (req: Request, res: Response) => {
    try {
      // Resolve parent_id from token if provided, but don't require it
      let parent_id: string | null = null;
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            type: string;
          };
          if (decoded.type === "parent") parent_id = decoded.id;
        } catch {
          // Invalid token — ignore and proceed without parent link
        }
      }

      const { display_name, pin, age, avatar_base_id } = req.body;
      if (!display_name || !pin) {
        res.status(400).json({ error: "display_name and pin are required" });
        return;
      }
      if (!/^\d{4}$/.test(pin)) {
        res.status(400).json({ error: "PIN must be exactly 4 digits" });
        return;
      }

      const child = new User({
        display_name,
        pin_hash: pin,
        age: age || 5,
        avatar: { base_id: avatar_base_id || "avatar_1", unlocked_items: [] },
        parent_id,
      });
      await child.save();

      if (parent_id) {
        await Parent.findByIdAndUpdate(parent_id, {
          $push: { children: child._id },
        });
      }

      const tokens = generateTokens(child._id.toString(), "child");
      res.status(201).json({
        child: {
          id: child._id,
          display_name: child.display_name,
          avatar: child.avatar,
          coins: child.coins,
          streak: child.streak,
        },
        ...tokens,
      });
    } catch {
      res.status(500).json({ error: "Server error" });
    }
  },
);

// POST /api/auth/login/child
router.post(
  "/login/child",
  authRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { display_name, pin } = req.body;
      // Find child by display_name (case insensitive)
      const child = await User.findOne({
        display_name: { $regex: new RegExp(`^${display_name}$`, "i") },
      });
      if (!child || !(await child.comparePin(pin))) {
        res.status(401).json({ error: "Invalid name or PIN" });
        return;
      }
      const tokens = generateTokens(child._id.toString(), "child");
      res.json({
        child: {
          id: child._id,
          display_name: child.display_name,
          avatar: child.avatar,
          coins: child.coins,
          streak: child.streak,
          is_premium: child.is_premium,
        },
        ...tokens,
      });
    } catch {
      res.status(500).json({ error: "Server error" });
    }
  },
);

// POST /api/auth/refresh
router.post("/refresh", authRateLimit, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token required" });
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
    ) as {
      id: string;
      type: "child" | "parent";
    };
    const tokens = generateTokens(decoded.id, decoded.type);
    res.json(tokens);
  } catch {
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
});

export default router;
