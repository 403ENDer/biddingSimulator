import { PlayerJoinValidator } from "../validators/playerValidator.js";
import { auctionPlayerRepo } from "../repositories/biddingRepo.js";

export class PlayerController {
  public static async PlayerJoin(req: any, res: any) {
    try {
      const data = await PlayerJoinValidator.validate(req.body);
      const user = req.user.id;
      const player = await auctionPlayerRepo.PlayerJoin({
        playerId: user,
        ...data,
      });
      res.status(200).send(player);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
}
