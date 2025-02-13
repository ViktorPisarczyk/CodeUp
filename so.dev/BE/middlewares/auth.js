import { verifyToken } from "./jwt.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decodedToken = await verifyToken(token);
    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.token = decodedToken;
    next();
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!allowedRoles.includes(req.token.role)) {
        const error = new Error(`You don't have the permission to do this!`);
        throw error;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
