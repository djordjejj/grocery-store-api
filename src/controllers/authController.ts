import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../utils/tokenUtils";

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username }).populate("node");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user.id, user.role);
  res.json({ token });
};
