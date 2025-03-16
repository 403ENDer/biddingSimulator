import React, { useState } from "react";
import Typewriter from "typewriter-effect";
import hammerGif from "./assets/hammer.gif";
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import GavelIcon from "@mui/icons-material/Gavel";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

const Home = ({ username, onLogout }) => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [auctionDetails, setAuctionDetails] = useState({ title: "", startingBid: "" });
  const [auctionId, setAuctionId] = useState("");

  // Handlers for opening/closing modals
  const handleCreateOpen = () => setOpenCreate(true);
  const handleCreateClose = () => setOpenCreate(false);
  const handleJoinOpen = () => setOpenJoin(true);
  const handleJoinClose = () => setOpenJoin(false);

  // Handling form submission (Replace with actual API call)
  const handleCreateAuction = () => {
    console.log("Auction Created:", auctionDetails);
    handleCreateClose();
  };

  const handleJoinAuction = () => {
    console.log("Joining Auction with ID:", auctionId);
    handleJoinClose();
  };

  return (
    <div style={styles.homeContainer}>
      {/* Header Box */}
      <div style={styles.headerBox}>
        <h2 style={{ display: "flex", alignItems: "center", fontSize: "24px", fontWeight: "bold", color: "#ff4552" }}>
          <GavelIcon style={{ fontSize: "30px", marginRight: "10px", color: "#ff4552" }} />Biddr
        </h2>
        <div style={styles.headerRight}>
          <span style={styles.welcomeText}>Welcome, {username}</span>
          <FaBell style={styles.icon} />
          <FaSignOutAlt style={styles.icon} onClick={onLogout} />
        </div>
      </div>

      {/* Main Square Content Box */}
      <div style={styles.squareBox}>
        <h1 style={styles.typewriter}>
          <Typewriter options={{ strings: ["Biddr"], autoStart: true, loop: true, delay: 100 }} />
        </h1>
        <img src={hammerGif} alt="Hammer GIF" style={styles.hammerGif} />
        <div style={styles.buttonContainer}>
          <button style={{ ...styles.btn, ...styles.createBtn }} onClick={handleCreateOpen}>
            Create
          </button>
          <button style={{ ...styles.btn, ...styles.joinBtn }} onClick={handleJoinOpen}>
            Join
          </button>
          <button style={{ ...styles.btn, ...styles.dashboardBtn }}>Dashboard</button>
        </div>
      </div>

      {/* Create Auction Dialog */}
      <Dialog open={openCreate} onClose={handleCreateClose}>
        <DialogTitle style={{ color: "#ff4552" }}>Create Auction</DialogTitle>
        <DialogContent>
          <TextField
            label="Auction Title"
            fullWidth
            margin="dense"
            value={auctionDetails.title}
            onChange={(e) => setAuctionDetails({ ...auctionDetails, title: e.target.value })}
          />
          <TextField
            label="Starting Bid"
            type="number"
            fullWidth
            margin="dense"
            value={auctionDetails.startingBid}
            onChange={(e) => setAuctionDetails({ ...auctionDetails, startingBid: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose} color="secondary">Cancel</Button>
          <Button onClick={handleCreateAuction} color="primary">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Join Auction Dialog */}
      <Dialog open={openJoin} onClose={handleJoinClose}>
      <DialogTitle style={{ color: "#ff4552" }}>Join Auction</DialogTitle>
        <DialogContent>
          <TextField
            label="Auction ID"
            fullWidth
            margin="dense"
            value={auctionId}
            onChange={(e) => setAuctionId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleJoinClose} color="secondary">Cancel</Button>
          <Button onClick={handleJoinAuction} color="primary">Join</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const styles = {
  homeContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f8f9fa",
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
    borderRadius: "8px",
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
  squareBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "800px",
    height: "400px",
    backgroundColor: "#fff",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    textAlign: "center",
    padding: "20px",
    marginTop: "130px",
  },
  typewriter: {
    fontSize: "36px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  hammerGif: {
    width: "100px",
    marginBottom: "20px",
  },
  buttonContainer: {
    display: "flex",
    gap: "20px",
  },
  btn: {
    padding: "10px 20px",
    fontSize: "18px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    color: "white",
  },
  createBtn: {
    backgroundColor: "#ff4552",
  },
  joinBtn: {
    backgroundColor: "#ff4552",
  },
  dashboardBtn: {
    backgroundColor: "#ff4552",
  },
};

export default Home;
