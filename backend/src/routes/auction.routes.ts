import { Router } from "express";
import { AuctionController } from "../controllers/auction.controller.js";
import { verifyJWTtoken } from "../middleware/auth.middleware.js";

const auctionRoutes = Router();

auctionRoutes.get("/", verifyJWTtoken, AuctionController.GetAuctionById);
auctionRoutes.post("/", verifyJWTtoken, AuctionController.CreateAuction);
auctionRoutes.patch("/", verifyJWTtoken, AuctionController.UpdateAuction);
auctionRoutes.delete("/", verifyJWTtoken, AuctionController.DeleteAuction);

export default auctionRoutes;
