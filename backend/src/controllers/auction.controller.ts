import mongoose from "mongoose";
import { AuctionRepo } from "../repositories/auctionRepo.js";
import {
  GetAuctionByIdValidator,
  CreateAuctionValidator,
  UpdateAuctionValidator,
  GetAuctionForPlayerValidator,
  GetPlayerAuctionsValidator,
} from "../validators/auctionValidator.js";
import { verifyToken } from "../utils/jwt.js";
import { Request, Response } from "express";
import PlayerModel from "../model/playerModel.js";
import AuctionItemModel from "../model/auctionItemModel.js";

export class AuctionController {
  public static GetPlayerCreatedAuctions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { playerId } = req.query;

      if (!playerId || typeof playerId !== "string") {
        res.status(400).json({ message: "Missing or invalid playerId" });
        return;
      }

      const auctions = await AuctionRepo.GetAuctionsByCreator(playerId);
      res.status(200).json({ auctions });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Server error" });
    }
  };

  public static async GetAllAuctions(_req: Request, res: Response) {
    try {
      const auctions = await AuctionRepo.GetAllAuctions();
      res.json({ auctions });
    } catch (err) {
      res.status(400).send(err);
    }
  }

  public static async getLiveAuctions(req: Request, res: Response) {
    try {
      const liveAuctions = await AuctionRepo.getLiveAuctions();
      res.status(200).send({ data: liveAuctions });
    } catch (err: any) {
      res.status(400).send({ error: err.message });
    }
  }

  public static async GetParticipatedAuctions(req: Request, res: Response) {
    try {
      const data = await GetPlayerAuctionsValidator.validate(req.query);
      const auctions = await AuctionRepo.GetParticipatedAuctions(data.playerId);
      res.json({ auctions });
    } catch (err) {
      res.status(400).send(err);
    }
  }
  public static async GetAuctionById(req: any, res: any) {
    try {
      const data = await GetAuctionByIdValidator.validate(req.query);
      const auction = await AuctionRepo.GetAuction(data);
      return res.json(auction);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  public static async CreateAuction(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const decoded: any = verifyToken(token);
      if (!decoded?.id) {
        res.status(403).json({ message: "Invalid token" });
        return;
      }

      const data = {
        ...req.body,
        createdBy: decoded.id,
      };

      const auction = await AuctionRepo.CreateAuction(data);
      res.status(201).json({ auction });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  public static async UpdateAuction(req: any, res: any) {
    try {
      const result = await UpdateAuctionValidator.validate(req.body);
      const data = { id: req.query.id, ...result };

      const auction = await AuctionRepo.UpdateAuction(data);
      res.status(200).send(auction);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  public static async DeleteAuction(req: any, res: any) {
    try {
      const data = await GetAuctionByIdValidator.validate(req.query);
      const auction = await AuctionRepo.DeleteAuction(data);
      res.status(200).send(auction);
    } catch (err) {
      res.status(400).send(err);
    }
  }
}
