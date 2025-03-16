import mongoose from "mongoose";

const AuctionPlayerSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    purseAmount: { type: Number, required: true },
    gain: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AuctionPlayerModel =
  mongoose.models.AuctionPlayer ||
  mongoose.model("AuctionPlayer", AuctionPlayerSchema);

export default AuctionPlayerModel;
