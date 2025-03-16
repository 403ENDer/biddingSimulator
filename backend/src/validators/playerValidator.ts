import vine from "@vinejs/vine";
export const PlayerJoinValidator = vine.compile(
  vine.object({
    auctionId: vine.string(),
    purseAmount: vine.number(),
  })
);
