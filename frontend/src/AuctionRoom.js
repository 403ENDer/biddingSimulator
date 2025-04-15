import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GavelIcon from "@mui/icons-material/Gavel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InfoIcon from '@mui/icons-material/Info';
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { Box } from "@mui/material";


const AuctionRoom = ({ username, onLogout }) => {
  const { auctionId } = useParams();
  const [auctionData, setAuctionData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);

  const currentPlayer = {
    name: username,
    purse: 1000,
    currentBid: 200
  };
  const opponentPlayer = {
    name: "Opponent",
    purse: 1000,
    currentBid: 250
  };

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await fetch(`http://localhost:3333/api/auctions?id=${auctionId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await res.json();
        setAuctionData(data);
      } catch (err) {
        console.error("Failed to fetch auction details", err);
      }
    };

    fetchAuction();
  }, [auctionId]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3333");
    setSocket(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "join",
        auctionId,
        playerId: localStorage.getItem("playerId")
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.message) {
        setMessages((prev) => [...prev, msg.message]);
        if (msg.message.startsWith("Your turn to bid")) {
          setCurrentTurn(true);
        } else {
          setCurrentTurn(false);
        }
      }

      if (msg.optimalStrategy) {
        setMessages((prev) => [...prev, `💡 Strategy Tip: ${msg.optimalStrategy}`]);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => ws.close();
  }, [auctionId]);

  const handleBid = () => {
    if (socket && bidAmount) {
      socket.send(JSON.stringify({
        type: "bid",
        amount: parseInt(bidAmount),
        playerId: localStorage.getItem("playerId"),
        auctionId,
      }));
      setBidAmount("");
    }
  };

  const handleQuit = () => {
    socket.send(JSON.stringify({ type: "quit", auctionId, playerId: localStorage.getItem("playerId") }));
  };

  const handleLeave = () => {
    socket.send(JSON.stringify({ type: "leave", auctionId, playerId: localStorage.getItem("playerId") }));
  };

  const highestBid = Math.max(currentPlayer.currentBid, opponentPlayer.currentBid);

  return (
    <div style={styles.container}>
      <div style={styles.headerBox}>
        <h2 style={styles.logo}>
          <GavelIcon style={{ fontSize: "30px", marginRight: "10px" }} />Biddr
        </h2>
        <div style={styles.headerRight}>
          <span style={styles.welcomeText}>Welcome, {username}</span>
          <FaBell style={styles.icon} />
          <FaSignOutAlt style={styles.icon} onClick={onLogout} />
        </div>
      </div>

      <div style={styles.roomBox}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <h2 style={{ color: "#ff4552", margin: 0 }}>Auction Room</h2>
          <IconButton onClick={() => setInfoOpen(true)}>
            <InfoOutlinedIcon style={{ color: "#ff4552" }} />
          </IconButton>
        </div>
        <p><strong>ID:</strong> {auctionId}</p>

        {auctionData ? (
          <div>
            <h3>{auctionData.name}</h3>
            <p><strong>💰 Highest Bid:</strong> {highestBid}</p>
          </div>
        ) : (
          <p>Loading auction details...</p>
        )}

        <div style={styles.battleSection}>
          <div style={styles.playerCard}>
            <h4>{currentPlayer.name}</h4>
            <p>Purse: {currentPlayer.purse}</p>
            <p>Remaining: {currentPlayer.purse - currentPlayer.currentBid}</p>
            <p>Current Bid: {currentPlayer.currentBid}</p>
          </div>

          <div style={styles.battleIcon}>
            <GavelIcon style={{ fontSize: "40px", color: "#ff4552" }} />
            <p style={{ fontWeight: "bold" }}>Bidding War</p>
          </div>

          <div style={styles.playerCard}>
            <h4>{opponentPlayer.name}</h4>
            <p>Purse: {opponentPlayer.purse}</p>
            <p>Remaining: {opponentPlayer.purse - opponentPlayer.currentBid}</p>
            <p>Current Bid: {opponentPlayer.currentBid}</p>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          {currentTurn ? (
            <div>
              <input
                type="number"
                placeholder="Enter your bid"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
              <button onClick={handleBid}>Place Bid</button>
            </div>
          ) : (
            <p>Waiting for opponent's move...</p>
          )}
        </div>

        <div style={{
          maxHeight: "150px",
          overflowY: "auto",
          marginTop: "20px",
          background: "#f1f1f1",
          padding: "10px",
          borderRadius: "8px"
        }}>
          {messages.map((msg, idx) => (
            <p key={idx} style={{ textAlign: "left", margin: 0 }}>{msg}</p>
          ))}
        </div>

        <div style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          justifyContent: "center"
        }}>
          <button onClick={handleQuit} style={styles.actionButton}>Quit</button>
          <button onClick={handleLeave} style={styles.actionButton}>Leave</button>
        </div>
      </div>

      <Dialog
  open={infoOpen}
  onClose={() => setInfoOpen(false)}
  PaperProps={{
    sx: {
      width: '400px',           // custom width
      borderRadius: 3,
    },
  }}
>
  <DialogTitle
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      bgcolor: '#ff4552',
      color: 'white',
      fontFamily: 'Autowide',    // using your imported font
      fontWeight: 'bold',
      px: 3,
      py: 2,
    }}
  >
    <Box display="flex" alignItems="center" gap={1}>
      <InfoIcon />
      Auction Info
    </Box>
    <IconButton onClick={() => setInfoOpen(false)} sx={{ color: 'white' }}>
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  <DialogContent
    sx={{
      bgcolor: '#f5f5f5',
      py: 3,
      fontFamily: 'Autowide',
      textAlign: 'center',
    }}
  >
    {auctionData ? (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Typography variant="body1">
          <strong>Slots:</strong> {auctionData.slots}
        </Typography>
        <Typography variant="body1">
          <strong>Total Items:</strong> {auctionData.items.length}
        </Typography>
        <Typography variant="body1">
          <strong>Current Item:</strong> {auctionData.items[0]?.name || 'N/A'}
        </Typography>
      </Box>
    ) : (
      <Typography>Loading...</Typography>
    )}
  </DialogContent>
</Dialog>

    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f8f9fa"
  },
  headerBox: {
    position: "absolute",
    top: "20px",
    left: "20px",
    right: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#fff",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px"
  },
  logo: {
    display: "flex",
    alignItems: "center",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#ff4552"
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px"
  },
  welcomeText: {
    fontSize: "16px",
    fontWeight: "500"
  },
  icon: {
    fontSize: "20px",
    cursor: "pointer"
  },
  roomBox: {
    marginTop: "150px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    width: "700px"
  },
  battleSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "30px"
  },
  playerCard: {
    flex: "1",
    background: "#e9ecef",
    padding: "15px",
    borderRadius: "10px",
    margin: "10px",
    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)"
  },
  battleIcon: {
    textAlign: "center",
    padding: "10px"
  },
  actionButton: {
    backgroundColor: "#ff4552",
    color: "#fff",
    padding: "10px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default AuctionRoom;
