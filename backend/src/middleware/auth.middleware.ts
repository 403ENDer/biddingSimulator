import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tokens = req.cookies.token;
  if (!tokens) {
    return res.redirect("/auth/google");
  }
  try {
    verifyToken(tokens);
    next();
  } catch (error) {
    return res.redirect("/auth/google");
  }
};

export const verifyJWTtoken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(400).send("No token provided");
    return;
  }

  const token = authHeader.split(" ")[1];
  // const token = req.cookies.token;
  // if (!token) {
  //   res.status(400).send("No token provided");
  //   return;
  // }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (err) {
    res.redirect("/login");
    return;
  }
};
