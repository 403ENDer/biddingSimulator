import mongoose from "mongoose";
import AuctionItemModel from "../model/auctionItemModel.js";
import AuctionModel from "../model/auctionModel.js";

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
    return auction;
  }

  public static async CreateAuction(data: any) {
    try {
      const { name, slots, items } = data;
      if (slots != items.length) {
        throw new Error("Slots and items must be equal");
      }
      const auction = new AuctionModel({ name: name, slots: slots });
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
      const auctioData = this.GetAuction({ id: auction.id });
      return auctioData;
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
}
