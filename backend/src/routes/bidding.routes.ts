import { Router } from "express";
import { PlayerController } from "../controllers/bidding.controller.js";
import { verifyJWTtoken } from "../middleware/auth.middleware.js";
const playerRoute = Router();

playerRoute.post("/joinAuction", verifyJWTtoken, PlayerController.PlayerJoin);

export default playerRoute;
