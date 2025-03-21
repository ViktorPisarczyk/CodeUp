import jwt from "jsonwebtoken";
import { promisify } from "util";

export const createToken = async (payload) => {
  const asyncSign = promisify(jwt.sign);
  return await asyncSign(payload, process.env.JWT_SECRET, { expiresIn: "5h" });
};

const asyncVerify = promisify(jwt.verify);

export const verifyToken = (token) =>
  asyncVerify(token, process.env.JWT_SECRET);
