import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import DeleteIcon from "@mui/icons-material/Delete";
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import Typewriter from "typewriter-effect";
import { useNavigate } from "react-router-dom";
import hammerGif from "./assets/hammer.gif";

const socket = new WebSocket("ws://localhost:3333");

const Home = ({ username, onLogout }) => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [auctionName, setAuctionName] = useState("");
  const [slots, setSlots] = useState("");
  const [items, setItems] = useState([{ name: "", price: "" }, { name: "", price: "" }]);
  const [joinAuctionId, setJoinAuctionId] = useState("");
  const [purseAmount, setPurseAmount] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleCreateAuction = async () => {
    const payload = {
      name: auctionName,
      slots: parseInt(slots),
      items: items.map(item => ({
        name: item.name,
        price: parseInt(item.price),
      })),
    };
    console.log(token)
    await fetch("http://localhost:3333/api/auctions/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    setOpenCreate(false);
    setSuccessDialogOpen(true);
  };

  useEffect(() => {
    if (successDialogOpen) {
      const timer = setTimeout(() => {
        setSuccessDialogOpen(false);
        navigate("/dashboard");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successDialogOpen, navigate]);

  const handleJoinAuction = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch("http://localhost:3333/api/player/joinAuction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Needed to get req.user.id
        },
        body: JSON.stringify({
          auctionId: joinAuctionId,
          purseAmount: parseInt(purseAmount),
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to join auction");
      }
  
      console.log("Joined auction:", data);
  
      // ✅ Navigate to auction room page with auctionId
      navigate(`/auction-room/${joinAuctionId}`);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  return (
    <div style={styles.homeContainer}>
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

      {/* Main Box */}
      <div style={styles.squareBox}>
        <h1 style={styles.typewriter}>
          <Typewriter options={{ strings: ["Biddr"], autoStart: true, loop: true, delay: 100 }} />
        </h1>
        <img src={hammerGif} alt="Hammer GIF" style={styles.hammerGif} />
        <div style={styles.buttonContainer}>
          <button style={styles.btn} onClick={() => setOpenCreate(true)}>Create</button>
          <button style={styles.btn} onClick={() => setOpenJoin(true)}>Join</button>
          <button style={styles.btn} onClick={() => navigate("/dashboard")}>Dashboard</button>
        </div>
      </div>

      {/* Create Auction Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth>
        <DialogTitle sx={{ color: "#ff4552" }}>Create Auction</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Auction Name" value={auctionName} onChange={(e) => setAuctionName(e.target.value)} />
          <TextField fullWidth margin="dense" label="Slots" type="number" value={slots} onChange={(e) => { const value = parseInt(e.target.value); setSlots(value < 0 ? 0 : value); }} />
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <TextField label="Item Name" value={item.name} onChange={(e) => handleItemChange(i, "name", e.target.value)} />
              <TextField label="Price" type="number" value={item.price} onChange={(e) => { const value = parseInt(e.target.value); handleItemChange(i, "price", value < 0 ? 0 : value); }} />
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)} style={{ color: "#ff4552" }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateAuction} style={{ backgroundColor: "#ff4552", color: "white" }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Join Auction Dialog */}
      <Dialog open={openJoin} onClose={() => setOpenJoin(false)} fullWidth>
        <DialogTitle sx={{ color: "#ff4552" }}>Join Auction</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Auction ID" value={joinAuctionId} onChange={(e) => setJoinAuctionId(e.target.value)} />
          <TextField fullWidth margin="dense" label="Purse Amount" type="number" value={purseAmount} onChange={(e) => setPurseAmount(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJoin(false)} style={{ color: "#ff4552" }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleJoinAuction} style={{ backgroundColor: "#ff4552", color: "white" }}>
            Join
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)} fullWidth>
        <DialogTitle sx={{ color: "#ff4552", textAlign: "center" }}>
          Auction Created Successfully!
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "white", textAlign: "center", padding: "20px" }}>
          <Typography variant="body1" sx={{ color: "#ff4552", fontSize: "16px" }}>
            Redirecting to Dashboard ......
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const styles = {
  homeContainer: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#f8f9fa"
  },
  headerBox: {
    position: "absolute", top: "20px", left: "20px", right: "20px", display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "10px 20px", backgroundColor: "#fff", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", borderRadius: "8px"
  },
  logo: { display: "flex", alignItems: "center", fontSize: "24px", fontWeight: "bold", color: "#ff4552" },
  headerRight: { display: "flex", alignItems: "center", gap: "15px" },
  welcomeText: { fontSize: "16px", fontWeight: "500" },
  icon: { fontSize: "20px", cursor: "pointer" },
  squareBox: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "800px", height: "400px",
    backgroundColor: "#fff", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", borderRadius: "10px", textAlign: "center", padding: "20px", marginTop: "130px"
  },
  typewriter: { fontSize: "36px", fontWeight: "bold", marginBottom: "10px" },
  hammerGif: { width: "100px", marginBottom: "20px" },
  buttonContainer: { display: "flex", gap: "20px" },
  btn: {
    padding: "10px 20px", fontSize: "18px", fontWeight: "bold", border: "none",
    borderRadius: "5px", cursor: "pointer", backgroundColor: "#ff4552", color: "white"
  }
};

export default Home;
