import WebSocket, { WebSocketServer } from "ws";
import { Server } from "http";
import AuctionPlayerModel from "./model/auctionPlayersModel.js";
import mongoose, { Types } from "mongoose";
import AuctionItemModel from "./model/auctionItemModel.js";
import {
  getOptimalBidRange,
  getBiddingSuggestion,
} from "./repositories/optimalStrategy.js";
import AuctionModel from "./model/auctionModel.js";

interface Player {
  id: string;
  name: string;
  purse: number;
  strategyLimitItem1: number;
  strategyLimitItem2: number;
  ws: WebSocket;
}

interface Item {
  id: string;
  auctionId: Types.ObjectId;
  name: string;
  price: number;
  winBy?: Types.ObjectId | null;
}

interface AuctionRoom {
  players: Player[];
  currentItem: Item;
  highestBid: number;
  highestBidder: Player | null;
  waitingForBid: number;
  items: any[];
  status: string;
}

const auctionRooms: Record<string, AuctionRoom> = {};

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    let auctionId: string | null = null;
    let playerId: string | null = null;

    ws.on("message", async (message: string) => {
      let data: any;
      try {
        data = JSON.parse(message);
      } catch (err) {
        ws.send("Invlaid Json ");
        return;
      }

      if (data.type === "join") {
        auctionId = data.auctionId;
        playerId = data.playerId;
        if (!auctionRooms[auctionId]) {
          const auctionItems: any = Array.from(
            await AuctionItemModel.find({ auctionId: auctionId })
          );
          auctionRooms[auctionId] = {
            players: [],
            currentItem: auctionItems[0],
            highestBid: 0,
            highestBidder: null,
            waitingForBid: 0,
            items: auctionItems,
            status: "waiting",
          };
        }

        if (auctionRooms[auctionId].players.length < 2) {
          const playerDetails = await AuctionPlayerModel.aggregate([
            {
              $match: {
                playerId: new mongoose.Types.ObjectId(playerId),
                auctionId: new mongoose.Types.ObjectId(auctionId),
              },
            },
            {
              $lookup: {
                from: "players",
                localField: "playerId",
                foreignField: "_id",
                as: "playerDetails",
              },
            },
          ]);
          console.log(playerDetails);
          auctionRooms[auctionId].players.push({
            id: playerId,
            purse: playerDetails[0].purseAmount,
            name: playerDetails[0].playerDetails[0].name,
            strategyLimitItem1: null,
            strategyLimitItem2: null,
            ws,
          });
        }
        if (auctionRooms[auctionId].players.length === 2) {
          startAuction(auctionId);
        } else {
          ws.send(JSON.stringify({ message: "waiting for another player..." }));
        }
      }
      let room = auctionRooms[auctionId];
      console.log(room.players);
      if (playerId !== room.players[room.waitingForBid].id) {
        const player = room.players.find((p) => p.id === playerId);
        player?.ws.send(
          JSON.stringify({
            message: "Its not your turn wait for your turn do actions",
          })
        );
        return;
      }
      if (data.type === "bid" && auctionId) {
        handleBid(auctionId, playerId!, data.amount);
      }

      if (data.type === "quit" && auctionId) {
        handleQuit(auctionId, playerId!);
      }

      if (data.type === "leave" && auctionId) {
        handleLeave(auctionId, playerId!);
      }
    });
  });

  console.log("WebSocket server initialized.");
}

function startAuction(auctionId: string) {
  const room = auctionRooms[auctionId];

  room.status = "live";

  const bid_increment = 1;

  room.players.forEach(async (player: Player) => {
    const opponent = room.players.find((p) => p.id !== player.id);
    if (!opponent) {
      player.strategyLimitItem1 = 0;
      player.strategyLimitItem2 = 0;
    } else {
      const { max_bid_item_1, max_bid_item_2 } = getOptimalBidRange(
        room.items[0].price,
        room.items[1].price,
        player.purse,
        opponent.purse,
        bid_increment
      );
      player.strategyLimitItem1 = max_bid_item_1;
      player.strategyLimitItem2 = max_bid_item_2;
    }

    player.ws.send(
      JSON.stringify({
        message: "Auction started",
        optimalStrategy: `Max limit for item-1: ₹${player.strategyLimitItem1} and Max limit for item-2: ₹${player.strategyLimitItem2}`,
      })
    );
  });

  startBidding(auctionId);
}

function startBidding(auctionId: string) {
  const room = auctionRooms[auctionId];
  const currentPlayer = room.players[room.waitingForBid];
  currentPlayer.ws.send(
    JSON.stringify({ message: `Your turn to bid ${room.currentItem.name}` })
  );
}

async function handleBid(auctionId: string, playerId: string, amount: number) {
  const room = auctionRooms[auctionId];

  const player = room.players.find((p) => p.id === playerId);

  if (room.status !== "live") {
    player?.ws.send(
      JSON.stringify({ message: "Auction is not live wait for the next one" })
    );
    return;
  }

  if (amount <= room.highestBid) {
    player?.ws.send(
      JSON.stringify({
        message: `Your bid should be higher than the current highest bid - ${room.highestBid}`,
      })
    );
    return;
  }
  if (!player || amount > player.purse) {
    player?.ws.send(JSON.stringify({ message: "Invalid bid, exceeds purse." }));
    return;
  }

  room.highestBid = amount;
  room.highestBidder = player;
  room.waitingForBid = (room.waitingForBid + 1) % 2;

  for (const p of room.players) {
    const opponent = room.players.find((pl) => pl.id !== p.id);
    const item1WonByPlayer = room.items[0].winBy?.toString() === p.id;
    const suggestion = getBiddingSuggestion({
      currentItem: room.currentItem.id === room.items[0].id ? 1 : 2,
      currentBid: room.highestBid,
      strategyLimit:
        room.currentItem.id === room.items[0].id
          ? p.strategyLimitItem1
          : p.strategyLimitItem2,
      playerPurse: p.purse,
      opponentPurse: opponent ? opponent.purse : 0,
      item1WonByPlayer,
      item1Price: room.items[0].price,
      item1Value: room.items[0].price,
      item2Value: room.items[1].price,
    });
    p.ws.send(JSON.stringify({ message: suggestion }));
  }

  startBidding(auctionId);
}

function handleQuit(auctionId: string, playerId: string) {
  const room = auctionRooms[auctionId];
  if (!room.highestBidder) {
    const remainingPlayer = room.players.find((p) => p.id !== playerId);
    room.highestBidder = remainingPlayer;
    room.highestBid = remainingPlayer.purse * 0.2;
  }
  if (room.highestBidder) {
    room.highestBidder.purse -= room.highestBid;
  }
  handleGain(room);
  notifyAll(
    auctionId,
    `Player ${room.highestBidder?.name} wins Item ${room.currentItem.name}`
  );

  const updatedPurse = room.players.map((p) => {
    return { id: p.id, name: p.name, purse: p.purse };
  });

  notifyAll(auctionId, JSON.stringify(updatedPurse));
  if (room.currentItem.id === room.items[0].id) {
    room.currentItem = room.items[1];
    startBidding(auctionId);
  } else {
    notifyAll(auctionId, "Auction finished.");
  }
}
async function handleGain(room: any) {
  const completedItem = await AuctionItemModel.findById(room.currentItem.id);
  completedItem.winBy = room.highestBidder.id;
  await completedItem.save();

  const playerGain = await AuctionPlayerModel.findOne({
    playerId: room.highestBidder.id,
  });
  playerGain.gain += completedItem.price - room.highestBid;
  await playerGain.save();
}
function handleLeave(auctionId: string, playerId: string) {
  const room = auctionRooms[auctionId];
  const remainingPlayer = room.players.find((p) => p.id !== playerId);

  if (remainingPlayer) {
    if (room.currentItem.id === room.items[0].id) {
      room.items.forEach((item) => {
        console.log(item.id);
        room.currentItem = item;
        remainingPlayer.purse -= Math.floor(remainingPlayer.purse * 0.2);
        room.highestBid = Math.floor(remainingPlayer.purse * 0.2);
        room.highestBidder = remainingPlayer;
        handleGain(room);
      });

      notifyAll(
        auctionId,
        `Player ${remainingPlayer.name} wins both items and remaining purse ${remainingPlayer.purse}`
      );
    } else {
      remainingPlayer.purse -= Math.floor(remainingPlayer.purse * 0.2);
      room.highestBid = Math.floor(remainingPlayer.purse * 0.2);
      room.highestBidder = remainingPlayer;
      handleGain(room);
      notifyAll(auctionId, `Player ${remainingPlayer.name} wins {}`);
    }
  }

  endAuction(auctionId);
}

async function endAuction(auctionId: any) {
  const room = auctionRooms[auctionId];
  const playerGains = await Promise.all(
    room.players.map(async (player) => {
      const completedItems = await AuctionItemModel.find({ winBy: player.id });
      const totalGain = completedItems.reduce(
        (acc: any, item: any) => acc + item.price,
        0
      );
      return { id: player.id, name: player.name, gain: totalGain };
    })
  );

  notifyAll(
    auctionId,
    JSON.stringify({
      message: "Auction ended.",
      gains: playerGains,
    })
  );

  await AuctionModel.findByIdAndUpdate(auctionId, { status: "completed" });

  delete auctionRooms[auctionId];
}
function notifyAll(auctionId: string, message: string) {
  const room = auctionRooms[auctionId];
  room.players.forEach((p) => p.ws.send(JSON.stringify({ message })));
}
