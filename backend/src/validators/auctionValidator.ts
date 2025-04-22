import vine from "@vinejs/vine";

export const GetAuctionByIdValidator = vine.compile(
  vine.object({
    id: vine
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    name: vine.string().optional(),
    status: vine.string().optional(),
  })
);

export const CreateAuctionValidator = vine.compile(
  vine.object({
    name: vine.string(),
    slots: vine.number().min(2),
    items: vine.array(
      vine.object({
        name: vine.string().minLength(1),
        price: vine.number(),
      })
    ),
  })
);

export const UpdateAuctionValidator = vine.compile(
  vine.object({
    status: vine.string().optional(),
    name: vine.string().optional(),
    slots: vine.number().optional(),
    items: vine
      .array(
        vine.object({
          id: vine.string(),
          name: vine.string().minLength(1).optional(),
          price: vine.number().optional(),
        })
      )
      .optional(),
  })
);

export const GetAuctionForPlayerValidator = vine.compile(
  vine.object({
    auctionId: vine.string().trim(),
    playerId: vine.string().trim(),
  })
);

export const GetPlayerAuctionsValidator = vine.compile(
  vine.object({
    playerId: vine.string().trim(),
  })
);
