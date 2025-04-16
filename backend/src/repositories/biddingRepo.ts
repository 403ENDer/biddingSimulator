import AuctionModel from "../model/auctionModel.js";
import AuctionPlayerModel from "../model/auctionPlayersModel.js";

export class auctionPlayerRepo {
  public static async GetPlayer(data: any) {
    try {
      const response = await AuctionPlayerModel.findOne({
        _id: data.id,
      }).populate("auctions");
      return response;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  public static async PlayerJoin(data: any) {
    try {
      const auction = await AuctionModel.findOne({ _id: data.auctionId });
      console.log(auction);
      const auctionPlayers = await AuctionPlayerModel.find({
        auctionId: data.auctionId,
      });
      const playerExist = auctionPlayers.some(
        (item: any) => String(item.playerId) === String(data.playerId)
      );
      console.log(playerExist);
      if (playerExist) {
        throw new Error("Player already exist in the auction");
      }
      if (auctionPlayers.length >= auction.slots) {
        throw new Error("Auction is full");
      }
      const player = new AuctionPlayerModel(data);
      await player.save();

      return player;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }
}
