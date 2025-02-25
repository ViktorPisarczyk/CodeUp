import jwt from "jsonwebtoken";
import { promisify } from "util";

export const createToken = async (payload) => {
  const asyncSign = promisify(jwt.sign);
  return await asyncSign(payload, process.env.JWT_SECRET, { expiresIn: "5h" });
};

export const verifyToken = async (token) => {
  const asyncVerify = promisify(jwt.verify);
  return await asyncVerify(token, process.env.JWT_SECRET);
};
