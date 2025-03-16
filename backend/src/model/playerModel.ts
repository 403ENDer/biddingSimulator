import mongoose, { Document, Model } from "mongoose";

interface Player extends Document {
  name: string;
  email: string;
}

const PlayerSchema = new mongoose.Schema<Player>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const PlayerModel: Model<Player> =
  mongoose.models.Player || mongoose.model<Player>("Player", PlayerSchema);

export default PlayerModel;
