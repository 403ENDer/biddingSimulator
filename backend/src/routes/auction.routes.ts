import { Router } from "express";
import { AuctionController } from "../controllers/auction.controller";
import { verifyJWTtoken } from "../middleware/auth.middleware";

const auctionRoutes = Router();

auctionRoutes.get("/", verifyJWTtoken, AuctionController.GetAuction);

export default auctionRoutes;
