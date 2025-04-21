import WebSocket, { WebSocketServer } from "ws";
import { Server } from "http";
import AuctionPlayerModel from "./model/auctionPlayersModel.js";
import mongoose from "mongoose";
import AuctionItemModel from "./model/auctionItemModel.js";
import {
  getOptimalBidRange,
  getBiddingSuggestion,
} from "./repositories/optimalStrategy.js";

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
  auctionId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  winBy?: mongoose.Types.ObjectId | null;
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
        ws.send("Invalid JSON");
        return;
      }

      if (data.type === "join") {
        auctionId = data.auctionId;
        playerId = data.playerId;

        console.log(`Player ${playerId} joining auction ${auctionId}`);

        if (!auctionRooms[auctionId]) {
          const auctionItems = await AuctionItemModel.find({ auctionId });
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

        const room = auctionRooms[auctionId];

        // Prevent duplicate player
        // Handle player reconnect or initial join
          const existingPlayer = room.players.find((p) => p.id === playerId);

          if (!existingPlayer) {
            // New player joining
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

            if (
              !playerDetails.length ||
              !playerDetails[0].playerDetails.length
            ) {
              ws.send(JSON.stringify({ message: "Invalid player data." }));
              return;
            }

            room.players.push({
              id: playerId,
              purse: playerDetails[0].purseAmount,
              name: playerDetails[0].playerDetails[0].name,
              strategyLimitItem1: null,
              strategyLimitItem2: null,
              ws,
            });
          } else {
            // Existing player refreshed — just update their WebSocket
            existingPlayer.ws = ws;
          }


        if (room.players.length === 2) {
          const [p1, p2] = room.players;

          [p1, p2].forEach((p, i) => {
            const opponent = i === 0 ? p2 : p1;
            p.ws.send(
              JSON.stringify({
                type: "playerJoined",
                playerInfo: {
                  id: p.id,
                  name: p.name,
                  purse: p.purse,
                  currentBid: 0,
                },
                opponentInfo: {
                  id: opponent.id,
                  name: opponent.name,
                  purse: opponent.purse,
                  currentBid: 0,
                },
              })
            );
          });

          startAuction(auctionId);
        } else {
          ws.send(JSON.stringify({ message: "Waiting for another player..." }));
        }
      }

      const room = auctionRooms[auctionId!];
      if (!room) return;

      if (room.players.length < 2) {
        ws.send(JSON.stringify({ message: "Waiting for another player to join." }));
        return;
      }
      
      if (playerId !== room.players[room.waitingForBid]?.id) {
        const player = room.players.find((p) => p.id === playerId);
        player?.ws.send(
          JSON.stringify({
            message: "It's not your turn, wait for your opponent.",
          })
        );
        return;
      }      

      if (data.type === "bid") {
        handleBid(auctionId!, playerId!, data.amount);
      }

      if (data.type === "quit") {
        handleQuit(auctionId!, playerId!);
      }

      if (data.type === "leave") {
        handleLeave(auctionId!, playerId!);
      }
    });
  });

  console.log("✅ WebSocket server initialized.");
}

// ----------- START AUCTION -----------

function startAuction(auctionId: string) {
  const room = auctionRooms[auctionId];
  room.status = "live";
  const bid_increment = 1;

  room.players.forEach((player) => {
    const opponent = room.players.find((p) => p.id !== player.id);
    const { max_bid_item_1, max_bid_item_2 } = getOptimalBidRange(
      room.items[0].price,
      room.items[1].price,
      player.purse,
      opponent?.purse || 0,
      bid_increment
    );

    player.strategyLimitItem1 = max_bid_item_1;
    player.strategyLimitItem2 = max_bid_item_2;

    player.ws.send(
      JSON.stringify({
        message: "Auction started",
        optimalStrategy: `Max limit for item-1: ₹${max_bid_item_1} and item-2: ₹${max_bid_item_2}`,
      })
    );
  });

  startBidding(auctionId);
}

function startBidding(auctionId: string) {
  const room = auctionRooms[auctionId];
  const currentPlayer = room.players[room.waitingForBid];

  currentPlayer.ws.send(
    JSON.stringify({
      type: "turn",
      currentTurn: currentPlayer.id,
      message: `Your turn to bid on ${room.currentItem.name}`,
    })
  );

  room.players
    .filter((p) => p.id !== currentPlayer.id)
    .forEach((p) =>
      p.ws.send(
        JSON.stringify({
          type: "turn",
          currentTurn: currentPlayer.id,
          message: "Waiting for opponent's move...",
        })
      )
    );
}

// ----------- HANDLE BID -----------

async function handleBid(auctionId: string, playerId: string, amount: number) {
  const room = auctionRooms[auctionId];
  const player = room.players.find((p) => p.id === playerId);

  if (room.status !== "live") {
    player?.ws.send(
      JSON.stringify({ message: "Auction is not live. Please wait." })
    );
    return;
  }

  if (amount <= room.highestBid) {
    player?.ws.send(
      JSON.stringify({
        message: `Your bid should be higher than current highest bid: ₹${room.highestBid}`,
      })
    );
    return;
  }

  if (!player || amount > player.purse) {
    player?.ws.send(
      JSON.stringify({ message: "Invalid bid. Bid exceeds purse." })
    );
    return;
  }

  // Deduct the bid from the player’s purse
  player.purse -= amount;
  room.highestBid = amount;
  room.highestBidder = player;
  room.waitingForBid = (room.waitingForBid + 1) % 2;

  // 🔄 Broadcast the structured bid message to both players
  room.players.forEach((p) => {
    p.ws.send(
      JSON.stringify({
        type: "bid",
        playerId: playerId,
        amount,
      })
    );
  });

  // 📢 Send strategic suggestion messages
  const opponent = room.players.find((pl) => pl.id !== playerId);
const item1WonByPlayer = room.items[0].winBy?.toString() === playerId;

const strategySuggestion = getBiddingSuggestion({
  currentItem: room.currentItem.id === room.items[0].id ? 1 : 2,
  currentBid: room.highestBid,
  strategyLimit:
    room.currentItem.id === room.items[0].id
      ? player.strategyLimitItem1
      : player.strategyLimitItem2,
  playerPurse: player.purse,
  opponentPurse: opponent?.purse || 0,
  item1WonByPlayer,
  item1Price: room.items[0].price,
  item1Value: room.items[0].price,
  item2Value: room.items[1].price,
});

// ✅ Send ONLY to the bidding player
player.ws.send(
  JSON.stringify({ type: "strategy", optimalStrategy: strategySuggestion })
);

  // ➡️ Move to next turn
  startBidding(auctionId);
}


// ----------- QUIT / LEAVE / END -----------

function handleQuit(auctionId: string, playerId: string) {
  const room = auctionRooms[auctionId];
  if (!room.highestBidder) {
    const remainingPlayer = room.players.find((p) => p.id !== playerId);
    room.highestBidder = remainingPlayer;
    room.highestBid = remainingPlayer!.purse * 0.2;
  }
  if (room.highestBidder) {
    room.highestBidder.purse -= room.highestBid;
  }
  handleGain(room);
  notifyAll(
    auctionId,
    `Player ${room.highestBidder?.name} wins Item ${room.currentItem.name}`
  );

  const updatedPurse = room.players.map((p) => ({
    id: p.id,
    name: p.name,
    purse: p.purse,
  }));

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
      notifyAll(auctionId, `Player ${remainingPlayer.name} wins remaining item`);
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

  delete auctionRooms[auctionId];
}

function notifyAll(auctionId: string, message: string) {
  const room = auctionRooms[auctionId];
  room.players.forEach((p) => p.ws.send(JSON.stringify({ message })));
}
