import { Request, Response } from "express";
import { createToken } from "../utils/jwt.js";
import PlayerModel from "../model/playerModel.js";

export const handleGoogleCallback = async (req: Request, res: Response) => {
  const user = req.user as any;
  let player = await PlayerModel.findOne({ email: user.emails[0].value });
  console.log(player);
  if (!player) {
    console.log("No player exist");
    player = await PlayerModel.create({
      name: user.name.givenName,
      email: user.emails[0].value,
    });
  }

  const token = createToken({
    id: player._id.toString(),
    email: player.email,
    name: player.name,
  });

  // res.cookie("token", token, { httpOnly: true });
  // res.status(200).send({ token: token });
  res.redirect(`http://localhost:3000/auth/success?token=${token}`);

};
