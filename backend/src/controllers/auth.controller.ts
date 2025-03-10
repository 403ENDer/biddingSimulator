import { Request, Response } from "express";
import { createToken } from "../utils/jwt";

export const handleGoogleCallback = (req: Request, res: Response) => {
  const user = req.user as any;
  console.log(user);
  const token = createToken({ id: user.id, email: user.emails[0].value });
  res.cookie("token", token, { httpOnly: true });
  res.status(200).send({ token: token });
};
