import mongoose from "mongoose";

const AuctionItemSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  winBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    default: null,
  },
});

const AuctionItemModel =
  mongoose.models.AuctionItem ||
  mongoose.model("AuctionItem", AuctionItemSchema);

export default AuctionItemModel;
