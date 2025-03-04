import mongoose from "mongoose";

const AuctionLogSchema = new mongoose.Schema(
  {
    auction_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    logs: { type: String, required: true },
  },
  { timestamps: true }
);

const AuctionLogModel =
  mongoose.models.AuctionLog || mongoose.model("AuctionLog", AuctionLogSchema);

export default AuctionLogModel;
