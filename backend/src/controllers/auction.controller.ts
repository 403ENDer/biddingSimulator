export class AuctionController {
  public static GetAuction(req: any, res: any) {
    console.log("In get request");
    res.send("Welcome to auctions");
  }
}
