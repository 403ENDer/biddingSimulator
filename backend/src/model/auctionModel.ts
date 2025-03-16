import mongoose from "mongoose";

const AuctionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slots: { type: Number, required: true },
  status: { type: String, default: "live" },
});

interface IAuction {
  name: string;
  slots: number;
  status: string;
}

const AuctionModel =
  mongoose.models.Auction || mongoose.model<IAuction>("Auction", AuctionSchema);

export default AuctionModel;
