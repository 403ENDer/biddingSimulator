import mongoose, { Document, Schema } from "mongoose";

export interface IAuction extends Document {
  name: string;
  slots: number;
  status: string;
  createdBy: mongoose.Types.ObjectId;
}

const AuctionSchema = new Schema<IAuction>({
  name: { type: String, required: true },
  slots: { type: Number, required: true },
  status: { type: String, default: "live" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
});

const AuctionModel =
  mongoose.models.Auction || mongoose.model<IAuction>("Auction", AuctionSchema);

export default AuctionModel;
