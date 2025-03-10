import mongoose from "mongoose";

const AuctionSchema = new mongoose.Schema({
  auction_name: { type: String, required: true },
  slots: { type: Number, required: true },
});

const AuctionModel =
  mongoose.models.Auction || mongoose.model("Auction", AuctionSchema);

export default AuctionModel;
