import mongoose from "mongoose";
import AuctionItemModel from "../model/auctionItemModel.js";
import AuctionModel from "../model/auctionModel.js";
import PlayerModel from "../model/playerModel.js";
import { verifyToken } from "../utils/jwt.js";

export class AuctionRepo {
  public static async GetAuction(data: any) {
    const query: any = {};
    if (data.id) {
      query._id = new mongoose.Types.ObjectId(data.id);
    }

    if (data.name) {
      query.name = { $regex: data.name, $options: "i" };
    }
    const auction = await AuctionModel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "auctionitems",
          localField: "_id",
          foreignField: "auctionId",
          as: "items",
        },
      },
      {
        $lookup: {
          from: "auctionplayers",
          localField: "_id",
          foreignField: "auctionId",
          as: "players",
        },
      },
    ]);
    if (!auction.length) {
      return { message: "Auction not found" };
    }
    return auction[0];
  }

  public static async CreateAuction(data: any) {
    try {
      const { name, slots, items, createdBy } = data;

      if (slots !== items.length) {
        throw new Error("Slots and items must be equal");
      }

      const auction = new AuctionModel({
        name,
        slots,
        createdBy, // Save the creator
      });

      await auction.save();

      await Promise.all(
        items.map(async (item: any) => {
          const auctionItem = new AuctionItemModel({
            name: item.name,
            auctionId: auction._id,
            price: item.price,
          });
          await auctionItem.save();
        })
      );

      return auction;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  public static async UpdateAuction(data: any) {
    const auction = await AuctionModel.findByIdAndUpdate(data.id, data, {
      new: true,
    });
    if (!auction) {
      return { message: "Auction not found" };
    }
    return auction;
  }

  public static async DeleteAuction(data: any) {
    const auction = await AuctionModel.findByIdAndDelete(data.id);
    if (!auction) {
      return { message: "Auction not found" };
    }
    return auction;
  }

  public static async GetAuctionsByCreator(playerId: string) {
    const objectId = new mongoose.Types.ObjectId(playerId);

    const auctions = await AuctionModel.find({ createdBy: objectId }).lean();

    if (!auctions.length) return [];

    const auctionIds = auctions.map((a) => a._id);

    const items = await AuctionItemModel.find({ auctionId: { $in: auctionIds } }).lean();

    const combined = auctions.map((a) => {
      const auctionItems = items
        .filter((i) => i.auctionId.toString() === a._id.toString())
        .map((i) => ({ name: i.name, price: i.price }));

      return {
        ...a,
        items: auctionItems,
      };
    });

    return combined;
  }

  public static async GetAllAuctions() {
    return AuctionModel.find().sort({ createdAt: -1 });
  }

  public static async GetParticipatedAuctions(playerId: string) {
    const participated = await AuctionPlayerModel.find({ playerId: new mongoose.Types.ObjectId(playerId) });

    const auctionIds = participated.map((p) => p.auctionId);

    return AuctionModel.find({
      _id: { $in: auctionIds },
      createdBy: { $ne: new mongoose.Types.ObjectId(playerId) },
    }).sort({ createdAt: -1 });
  }
}
