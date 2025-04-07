import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import { FaBell, FaSignOutAlt } from "react-icons/fa";

const Home = ({ username }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createData, setCreateData] = useState({ name: "", slots: "", items: "" });
  const [joinAuctionId, setJoinAuctionId] = useState("");

  const handleCreateAuction = async () => {
    try {
      const response = await fetch("http://localhost:3333/api/auctions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: createData.name,
          slots: parseInt(createData.slots),
          items: createData.items.split(",").map((item) => {
            const [name, price] = item.trim().split(":");
            return { name, price: parseFloat(price) };
          }),
        }),
      });
      const result = await response.json();
      alert(result.message || "Auction created!");
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating auction:", err);
    }
  };

  const handleJoinAuction = async () => {
    try {
      const response = await fetch("http://localhost:3333/api/auctions/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ auctionId: joinAuctionId }),
      });
      const result = await response.json();
      alert(result.message || "Joined auction!");
      setShowJoinModal(false);
    } catch (err) {
      console.error("Error joining auction:", err);
    }
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.headerBox}>
        <h2 style={{ display: "flex", alignItems: "center", fontSize: "24px", fontWeight: "bold", color: "#ff4552" }}>
          <GavelIcon style={{ fontSize: "30px", marginRight: "10px", color: "#ff4552" }} />Biddr
        </h2>
        <div style={styles.headerRight}>
          <span style={styles.welcomeText}>Welcome, {username}</span>
          <FaBell style={styles.icon} />
          <FaSignOutAlt style={styles.icon} />
        </div>
      </div>

      {/* Buttons */}
      <div style={styles.buttonContainer}>
        <button style={styles.btn} onClick={() => setShowCreateModal(true)}>
          Create Auction
        </button>
        <button style={{ ...styles.btn, backgroundColor: "#f44336" }} onClick={() => setShowJoinModal(true)}>
          Join Auction
        </button>
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <DialogTitle>Create Auction</DialogTitle>
        <DialogContent style={styles.dialogContent}>
          <TextField
            label="Auction Name"
            value={createData.name}
            onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Slots"
            type="number"
            value={createData.slots}
            onChange={(e) => setCreateData({ ...createData, slots: e.target.value })}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Items (name:price,name:price)"
            value={createData.items}
            onChange={(e) => setCreateData({ ...createData, items: e.target.value })}
            fullWidth
            margin="dense"
            helperText="Example: Apple:10, Banana:5"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button onClick={handleCreateAuction} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Join Modal */}
      <Dialog open={showJoinModal} onClose={() => setShowJoinModal(false)}>
        <DialogTitle>Join Auction</DialogTitle>
        <DialogContent style={styles.dialogContent}>
          <TextField
            label="Auction ID"
            value={joinAuctionId}
            onChange={(e) => setJoinAuctionId(e.target.value)}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJoinModal(false)}>Cancel</Button>
          <Button onClick={handleJoinAuction} variant="contained" color="secondary">
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    height: "100vh",
  },
  headerBox: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  welcomeText: {
    fontSize: "16px",
    fontWeight: "500",
  },
  icon: {
    fontSize: "20px",
    cursor: "pointer",
  },
  buttonContainer: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "center",
    gap: "30px",
  },
  btn: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "12px 25px",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  dialogContent: {
    width: "400px",
    display: "flex",
    flexDirection: "column",
  },
};

export default Home;
