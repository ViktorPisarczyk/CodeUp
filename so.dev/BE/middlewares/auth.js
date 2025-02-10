import { verifyToken } from "./jwt";

export const protect = async (req, res, next) => {
  try {
    // const token=req.headers.authorization.split(' ')[1]
    const token = req.cookies.access_token;
    if (!token) {
      const error = new Error();
      error.status = "401";
      throw error;
    }
    const decodedToken = await verifyToken(token);
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
