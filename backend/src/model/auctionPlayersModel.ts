import mongoose from "mongoose";

const AuctionPlayerSchema = new mongoose.Schema(
  {
    player_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    auction_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    purse_amount: { type: Number, required: true },
    gain: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AuctionPlayerModel =
  mongoose.models.AuctionPlayer ||
  mongoose.model("AuctionPlayer", AuctionPlayerSchema);

export default AuctionPlayerModel;
