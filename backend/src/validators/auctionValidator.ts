import vine from "@vinejs/vine";

export const GetAuctionByIdValidator = vine.compile(
  vine.object({
    id: vine.string().optional(),
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
    id: vine.string(),
    status: vine.string(),
  })
);
