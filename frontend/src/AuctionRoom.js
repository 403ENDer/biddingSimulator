import React, { useEffect, useState } from "react"; 
import { useParams } from "react-router-dom";
import GavelIcon from "@mui/icons-material/Gavel";
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";


const AuctionRoom = ({ username, onLogout }) => {
  const { auctionId } = useParams();
  const [auctionData, setAuctionData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [playerInfo, setPlayerInfo] = useState({});
  const [opponentInfo, setOpponentInfo] = useState({});
  const location = useLocation();
  const { purseAmount } = location.state || {}; 
  const [playerPurse, setPlayerPurse] = useState(purseAmount || 0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [lastTextMessage, setLastTextMessage] = useState("");
 

  // Fetch auction details
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

  // WebSocket connection and handling auction updates
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3333");

    ws.onopen = () => {
      setConnectionStatus("Connected");
      console.log("✅ WebSocket connected");
      ws.send(
        JSON.stringify({
          type: "join",
          auctionId,
          playerId: localStorage.getItem("playerId"),
        })
      );
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("📩 WebSocket message received:", msg);

      // Player joined message
      if (msg.type === "playerJoined") {
        console.log("Player Info:", msg.playerInfo);
        console.log("Opponent Info:", msg.opponentInfo);

        // Handle Player Info
        if (msg.playerInfo && msg.playerInfo.id === localStorage.getItem("playerId")) {
          setPlayerInfo({
            id: msg.playerInfo.id,
            name: msg.playerInfo.name,
            purse: msg.playerInfo.purse,
            currentBid: msg.playerInfo.currentBid || 0,
          });
        }

        // Handle Opponent Info (Only if the opponent has joined)
        if (msg.opponentInfo && msg.opponentInfo.id !== localStorage.getItem("playerId")) {
          setOpponentInfo({
            id: msg.opponentInfo.id,
            name: msg.opponentInfo.name,
            purse: msg.opponentInfo.purse,
            currentBid: msg.opponentInfo.currentBid || 0,
          });
        }

        // Both players have joined, stop waiting for opponent
        if (msg.playerInfo && msg.opponentInfo) {
          setWaitingForOpponent(false);
        }
      }

      // Handle the turn updates
      if (msg.type === "turn") {
        const isPlayerTurn = msg.currentTurn === localStorage.getItem("playerId");
        setCurrentTurn(isPlayerTurn);
        setMessages((prev) => [...prev, msg.message]);
      }

      // Handle player updates (bids, purse, current bid)
      if (msg.type === "playerUpdate") {
        if (msg.playerId === localStorage.getItem("playerId")) {
          setPlayerInfo((prevState) => ({
            ...prevState,
            name: msg.name,
            purse: msg.purse,
            currentBid: msg.currentBid,
          }));
        } else {
          setOpponentInfo((prevState) => ({
            ...prevState,
            name: msg.name,
            purse: msg.purse,
            currentBid: msg.currentBid,
          }));
        }
      }

      // Handle the bid updates
      if (msg.type === "bid") {
        if (msg.playerId === localStorage.getItem("playerId")) {
          setPlayerInfo((prevState) => ({
            ...prevState,
            currentBid: msg.amount,
            purse: prevState.purse - msg.amount, // Update purse after placing a bid
          }));
        } else {
          setOpponentInfo((prevState) => ({
            ...prevState,
            currentBid: msg.amount,
            purse: prevState.purse - msg.amount, // Update opponent's purse after their bid
          }));
        }
      }
      

      // Handle strategy updates (optional)
      if (msg.type === "strategy") {
        console.log("Optimal Strategy:", msg.optimalStrategy);
        setMessages((prevMessages) => [...prevMessages, msg.optimalStrategy]);
      }

      if (msg.message && !msg.type) {
        try {
          const parsed = JSON.parse(msg.message); // Try to parse JSON

          if (Array.isArray(parsed)) {

            if (lastTextMessage.toLowerCase().includes("player wins")) {
              setWinnerMessage(`⚠️ ${lastTextMessage}`);
              setWinnerData(parsed);
              setShowWinnerDialog(true);
      
              setTimeout(() => {
                setShowWinnerDialog(false);
              }, 10000);
      
              setLastTextMessage("");
            }
      
          } else {
            // It’s just a JSON object or other structure
            setMessages((prev) => [...prev, `⚠️ ${msg.message}`]);
          }
      
        } catch (e) {
          if (msg.message.toLowerCase().includes("wins item")) {
            setLastTextMessage(msg.message); // Save temporarily, wait for next JSON message
          } else {
            setMessages((prev) => [...prev, `⚠️ ${msg.message}`]);
          }
        }
      }
      
      
    };

    ws.onerror = (error) => {
      setConnectionStatus("Error in connection");
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      setConnectionStatus("Connection closed");
    };

    setSocket(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [auctionId]);

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
  

  // Handling the bid
  const handleBid = () => {
    if (socket && bidAmount) {
      const bid = parseInt(bidAmount);
  
      // Log current purse value and the bid amount
      console.log("Player purse:", playerInfo.purse);  // This should be the correct player's purse
      console.log("Bid amount:", bid);
  
      // Check if the player has enough funds using playerInfo.purse
      if (playerInfo.purse >= bid) {
        socket.send(
          JSON.stringify({
            type: "bid",
            amount: bid,
            playerId: localStorage.getItem("playerId"),
            auctionId,
          })
        );
  
        // Deduct the bid amount from the player's purse
        setPlayerInfo((prevState) => ({
          ...prevState,
          purse: prevState.purse - bid,
          currentBid: bid,
        }));
        setBidAmount("");
  
        // Switch turns
        socket.send(
          JSON.stringify({
            type: "turn", // Notify server that turn has been switched
            auctionId,
            currentTurn: opponentInfo.id, // The opponent will now play
          })
        );
      } else {
        alert("You do not have enough funds to place this bid.");
      }
    }
  };
  
  

  // Handling quitting
  const handleQuit = () => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "quit",
          auctionId,
          playerId: localStorage.getItem("playerId")
        })
      );
    }
  };

  // Handling leaving
  const handleLeave = () => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "leave",
          auctionId,
          playerId: localStorage.getItem("playerId")
        })
      );
    }
  };

  const highestBid = Math.max(playerInfo?.currentBid || 0, opponentInfo?.currentBid || 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerBox}>
        <h2 style={styles.logo}>
          <GavelIcon style={{ fontSize: "30px", marginRight: "10px" }} />
          Biddr
        </h2>
        <div style={styles.headerRight}>
          <span style={styles.welcomeText}>Welcome, {username}</span>
          <FaBell style={styles.icon} />
          <FaSignOutAlt style={styles.icon} onClick={onLogout} />
        </div>
      </div>

      {/* Main Auction Page */}
      <div style={styles.mainSplit}>
        {/* LEFT SECTION */}
        <div style={styles.leftPane}>
          <h2 style={{ color: "#ff4552", margin: 0 }}>Auction Room</h2>
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
              <h4>{playerInfo?.name || username}</h4>
              <p>Purse: ₹{playerInfo?.purse || 0}</p>
              <p>Remaining: ₹{(playerInfo?.purse || 0) - (playerInfo?.currentBid || 0)}</p>
              <p>Current Bid: ₹{playerInfo?.currentBid || 0}</p>
            </div>

            <div style={styles.battleIcon}>
              <GavelIcon style={{ fontSize: "40px", color: "#ff4552" }} />
              <p style={{ fontWeight: "bold" }}>Bidding War</p>
            </div>

            <div style={styles.playerCard}>
              <h4>{opponentInfo?.name || "Opponent"}</h4>
              <p>Purse: ₹{opponentInfo?.purse || 0}</p>
              <p>Remaining: ₹{(opponentInfo?.purse || 0) - (opponentInfo?.currentBid || 0)}</p>
              <p>Current Bid: ₹{opponentInfo?.currentBid || 0}</p>
            </div>
          </div>

          {waitingForOpponent ? (
            <p style={{ marginTop: "20px", textAlign: "center" }}>Waiting for another player...</p>
          ) : currentTurn ? (
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                style={{ padding: "10px", fontSize: "16px", width: "150px" }}
                placeholder="Enter your bid"
              />
              <button onClick={handleBid} style={styles.actionButton}>
                Place Bid
              </button>
            </div>
          ) : (
            <p style={{ marginTop: "20px", textAlign: "center" }}>Waiting for opponent's move...</p>
          )}

          <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={handleQuit} style={styles.actionButton}>Quit</button>
            <button onClick={handleLeave} style={styles.actionButton}>Leave</button>
          </div>
        </div>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackbarMsg}
          </Alert>
        </Snackbar>


        {/* RIGHT SECTION */}
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
    width: "90%"
  },
  leftPane: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    width: "800px",
    minWidth: "600px",
    maxWidth: "1000px",
    alignItems: "center",
    textAlign: "center"
  },
  rightPane: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    width: "400px",
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
