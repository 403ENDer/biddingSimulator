import mongoose from "mongoose";
import { AuctionRepo } from "../repositories/auctionRepo.js";
import {
  GetAuctionByIdValidator,
  CreateAuctionValidator,
  UpdateAuctionValidator,
} from "../validators/auctionValidator.js";

export class AuctionController {
  public static async GetAuctionById(req: any, res: any) {
    try {
      const data = await GetAuctionByIdValidator.validate(req.query);
      const auction = await AuctionRepo.GetAuction(data);
      return res.json(auction);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  public static async CreateAuction(req: any, res: any) {
    try {
      const data = await CreateAuctionValidator.validate(req.body);
      const auction = await AuctionRepo.CreateAuction(data);
      res.status(201).send(auction);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  public static async UpdateAuction(req: any, res: any) {
    try {
      const data = await UpdateAuctionValidator.validate(req.query);
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
