import { Router } from "express";
import passport from "../../config/passport";
import { handleGoogleCallback } from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
authRoutes.get(
  "/googleCallback",
  passport.authenticate("google", { failureRedirect: "/" }),
  handleGoogleCallback
);

export default authRoutes;
