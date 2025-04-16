export function getOptimalBidRange(
  item_1_price: number,
  item_2_price: number,
  playerPurse: number,
  opponentPurse: number,
  bid_increment: number
) {
  let max_bid_item_1 = 0;
  for (
    let x = 0;
    x < Math.min(item_1_price, opponentPurse);
    x += bid_increment
  ) {
    const gain_if_lets_opponent_win =
      x - bid_increment - (opponentPurse - item_2_price);
    const gain_if_player_wins = item_1_price - (x + bid_increment);
    if (gain_if_player_wins >= gain_if_lets_opponent_win) {
      max_bid_item_1 = x;
    } else {
      break;
    }
  }

  let max_bid_item_2 = 0;
  for (let y = 0; y < Math.min(item_1_price, playerPurse); y += bid_increment) {
    const gain_if_player_wins = item_1_price - (y + bid_increment);
    const gain_if_lets_player_win =
      item_2_price - (playerPurse - y) - bid_increment;
    if (gain_if_player_wins >= gain_if_lets_player_win) {
      max_bid_item_2 = y;
    } else {
      break;
    }
  }

  return {
    max_bid_item_1,
    max_bid_item_2,
  };
}

export function getBiddingSuggestion(params: any): string {
  const {
    currentItem,
    currentBid,
    strategyLimit,
    playerPurse,
    opponentPurse,
    item1WonByPlayer,
    item1Price,
    item1Value,
    item2Value,
  } = params;

  if (currentItem === 1) {
    if (currentBid < strategyLimit) {
      const remainingMargin = strategyLimit - currentBid;
      return `✅ You're still within the optimal bid range for Item 1. You can bid ₹${remainingMargin} more without reducing your profit.`;
    } else if (currentBid === strategyLimit) {
      return `⚠️ You've reached your optimal bid limit (₹${strategyLimit}) for Item 1. Consider quitting to maximize your overall gain.`;
    } else {
      return `🚫 You've exceeded your strategy threshold (₹${strategyLimit}) for Item 1. Bidding further may reduce your total gain. It may be better to quit and save for Item 2.`;
    }
  }

  if (currentItem === 2) {
    const remainingPurse = playerPurse;

    if (item1WonByPlayer) {
      return `🏆 You've already won Item 1 for ₹${item1Price}. With ₹${remainingPurse} left, avoid overbidding. You are at a disadvantage — your opponent has ₹${opponentPurse} left.`;
    } else {
      return `🧠 You lost Item 1. You have ₹${remainingPurse} left, which is likely more than your opponent (₹${opponentPurse}). You are in a strong position to win Item 2. Consider bidding up to ₹${Math.min(
        remainingPurse,
        item2Value
      )}.`;
    }
  }

  return "❓ Unable to generate suggestion with the current data.";
}
