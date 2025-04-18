import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GavelIcon from "@mui/icons-material/Gavel";
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import { Box, Button, Typography } from "@mui/material";

const AuctionRoom = ({ username, onLogout }) => {
  const { auctionId } = useParams();
  const [auctionData, setAuctionData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");


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
    // Fetch auction details
    const fetchAuction = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/auctions?id=${auctionId}`, {
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
  
    ws.onopen = () => {
      setConnectionStatus('Connected');
      console.log("WebSocket connection established.");
      ws.send(JSON.stringify({
        type: "join",
        auctionId,
        playerId: localStorage.getItem("playerId")
      }));
    };
  
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("Message received:", msg);
      
      // Assuming the message contains info about whose turn it is
      if (msg.type === "turn") {
        setCurrentTurn(msg.currentTurn === localStorage.getItem("playerId"));
      }
      
      // You can also handle other message types such as bidding results or chat messages here
      if (msg.type === "log") {
        setMessages((prevMessages) => [...prevMessages, msg.message]);
      }
    };
  
    ws.onerror = (error) => {
      setConnectionStatus('Error in connection');
      console.error("WebSocket error:", error);
    };
  
    ws.onclose = () => {
      setConnectionStatus('Connection closed');
      console.log("WebSocket closed");
    };
  
    setSocket(ws);
  
    // Clean up WebSocket when the component is unmounted
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
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
    if (socket) {
      socket.send(JSON.stringify({ type: "quit", auctionId, playerId: localStorage.getItem("playerId") }));
    }
  };

  const handleLeave = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: "leave", auctionId, playerId: localStorage.getItem("playerId") }));
    }
  };

  const highestBid = Math.max(currentPlayer.currentBid, opponentPlayer.currentBid);

  return (
    <div style={styles.container}>
      {/* Header */}
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

      {/* Main Auction Page - Split into two parts */}
      <div style={styles.mainSplit}>
        {/* LEFT SECTION - Auction Battle */}
        <div style={styles.leftPane}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <h2 style={{ color: "#ff4552", margin: 0 }}>Auction Room</h2>
          </div>
          <p><strong>ID:</strong> {auctionId}</p>

          {auctionData ? (
            <div style={{ alignItems: "center", textAlign: "center" }}>
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

          {/* Directly in Left Pane */}
          {currentTurn ? (
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              style={{ padding: "10px", fontSize: "16px", width: "150px" }}
              placeholder="Enter your bid"
            />
            <button onClick={handleBid} style={styles.actionButton}>Place Bid</button>
          </div>
        ) : (
          <p style={{ marginTop: "20px", textAlign: "center" }}>Waiting for opponent's move...</p>
        )}


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

        {/* RIGHT SECTION - Logs */}
        <div style={styles.rightPane}>
          <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Auction Logs</h3>
          <div style={styles.logBox}>
            {messages.map((msg, idx) => (
              <p key={idx} style={{ margin: "4px 0" }}>{msg}</p>
            ))}
          </div>
        </div>
      </div>
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
  mainSplit: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "30px",
    marginTop: "130px",
    width: "90%",
  },

  leftPane: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    width: "800px", // Fixed width
    minWidth: "600px",
    maxWidth: "1000px",
    alignItems: "center",
    textAlign: "center",
  },

  rightPane: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    width: "400px", // Fixed width
    minWidth: "300px",
    maxWidth: "500px",
    maxHeight: "500px",
    overflowY: "auto"
  },

  battleSection: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "20px"
  },

  playerCard: {
    backgroundColor: "#e9ecef",
    padding: "15px",
    borderRadius: "10px",
    width: "200px"
  },

  battleIcon: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px"
  },

  actionButton: {
    backgroundColor: "#ff4552",
    color: "#fff",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  },

  logBox: {
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "8px",
    height: "400px",
    overflowY: "scroll"
  }
};

export default AuctionRoom;
