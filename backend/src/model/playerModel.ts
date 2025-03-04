import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const PlayerModel =
  mongoose.models.Player || mongoose.model("Player", PlayerSchema);

export default PlayerModel;
