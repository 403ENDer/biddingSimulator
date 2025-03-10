import mongoose from "mongoose";

const AuctionItemSchema = new mongoose.Schema({
  auction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    required: true,
  },
  item_name: { type: String, required: true },
  price: { type: Number, required: true },
  win_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    default: null,
  },
});

const AuctionItemModel =
  mongoose.models.AuctionItem ||
  mongoose.model("AuctionItem", AuctionItemSchema);

export default AuctionItemModel;
