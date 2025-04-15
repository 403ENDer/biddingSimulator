import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, IconButton, CircularProgress
} from "@mui/material";
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import GavelIcon from "@mui/icons-material/Gavel";
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';


const Dashboard = ({ username, onLogout }) => {
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const playerId = localStorage.getItem("playerId");
  console.log("Player ID:", playerId); // Debugging line
  

  useEffect(() => {
    fetchUserAuctions();
  }, []);

  const fetchUserAuctions = async () => {
    setLoading(true);
    setError(null);
  
    const token = localStorage.getItem("token");
    console.log("Token:", token); // Debugging line
  
    if (!token) {
      setError("Missing token.");
      setLoading(false);
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:3333/api/auctions/player?playerId=${playerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) throw new Error("Failed to fetch auctions");
  
      const data = await res.json();
      console.log("Fetched data:", data);
      setAuctions(data.auctions || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  


  const handleUpdate = (auction) => {
    setSelectedAuction({ ...auction });
    setOpenUpdateDialog(true);
  };

  const handleDelete = (auction) => {
    setSelectedAuction(auction);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await fetch(`http://localhost:3333/api/auctions/?id=${selectedAuction._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOpenDeleteDialog(false);
      fetchUserAuctions();
    } catch (error) {
      console.error("Error deleting auction:", error);
    }
  };

  const submitUpdate = async () => {
    try {
      await fetch(`http://localhost:3333/api/auctions/?id=${selectedAuction._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: selectedAuction.name,
          slots: selectedAuction.slots,
          items: selectedAuction.items
        }),
      });
      setOpenUpdateDialog(false);
      fetchUserAuctions();
    } catch (error) {
      console.error("Error updating auction:", error);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...selectedAuction.items];
    updatedItems[index][field] = value;
    setSelectedAuction({ ...selectedAuction, items: updatedItems });
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

      {/* Auctions */}
      <div style={styles.squareBox}>
      <h3 style={{fontSize:"30px"}}>
          <ReceiptLongIcon style={{ verticalAlign: "middle", marginRight: "5px"}} />
          Your Auctions
      </h3>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : auctions.length === 0 ? (
          <p>No auctions created yet.</p>
        ) : (
          auctions.map((auction) => (
            <div key={auction._id} style={styles.auctionCard}>
              <div style={styles.cardHeader}>
                <h4 style={{fontSize:"23px"}}>{auction.name}</h4>
                <div>
                  <IconButton onClick={() => handleUpdate(auction)}>
                    <SystemUpdateAltIcon style={{ color: "#ff4552" }} />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(auction)}>
                    <DeleteIcon style={{ color: "#ff4552" }} />
                  </IconButton>
                </div>
              </div>
              <p>
              <EmojiEventsIcon style={{ verticalAlign: "middle", marginRight: "5px" }} />
              Slots: {auction.slots}
              </p>
              <div style={styles.itemContainer}>
                {auction.items?.map((item, i) => (
                  <button key={i} style={styles.itemBtn}>
                    {item.name} - ₹{item.price}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update Dialog */}
      <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} fullWidth>
        <DialogTitle>Update Auction</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={selectedAuction?.name || ""}
            onChange={(e) =>
              setSelectedAuction({ ...selectedAuction, name: e.target.value })
            }
            margin="dense"
          />
          <TextField
            fullWidth
            type="number"
            label="Slots"
            value={selectedAuction?.slots || ""}
            onChange={(e) =>
              setSelectedAuction({ ...selectedAuction, slots: Number(e.target.value) })
            }
            margin="dense"
          />
          {selectedAuction?.items?.map((item, idx) => (
            <div key={idx} style={{ marginBottom: 10 }}>
              <TextField
                label={`Item ${idx + 1} Name`}
                value={item.name}
                onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                style={{ marginRight: 10 }}
              />
              <TextField
                label="Price"
                type="number"
                value={item.price}
                onChange={(e) => handleItemChange(idx, "price", Number(e.target.value))}
              />
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
          <Button onClick={submitUpdate} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this auction?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Shared Styles
const styles = {
  homeContainer: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    height: "100vh", backgroundColor: "#f8f9fa",
  },
  headerBox: {
    position: "absolute", top: "20px", left: "20px", right: "20px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 20px", backgroundColor: "#fff",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", borderRadius: "8px"
  },
  logo: {
    display: "flex", alignItems: "center", fontSize: "24px",
    fontWeight: "bold", color: "#ff4552"
  },
  headerRight: {
    display: "flex", alignItems: "center", gap: "15px"
  },
  welcomeText: {
    fontSize: "16px", fontWeight: "500"
  },
  icon: {
    fontSize: "20px", cursor: "pointer"
  },
  squareBox: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
    width: "600px", height: "auto", maxHeight: "65vh", overflowY: "auto",
    backgroundColor: "#fff", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px", textAlign: "center", padding: "20px", marginTop: "130px",
  },
  auctionCard: {
    width: "100%", backgroundColor: "#ffe2e5", borderRadius: "10px",
    padding: "15px", marginBottom: "15px", textAlign: "left"
  },
  cardHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center"
  },
  itemContainer: {
    display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px"
  },
  itemBtn: {
    backgroundColor: "#ff4552", color: "white", border: "none",
    padding: "5px 10px", borderRadius: "5px", fontWeight: "bold"
  }
};

export default Dashboard;
