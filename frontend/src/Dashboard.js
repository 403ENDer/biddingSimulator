import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, IconButton
} from "@mui/material";
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import GavelIcon from "@mui/icons-material/Gavel";
import { FaBell, FaSignOutAlt } from "react-icons/fa";

const Dashboard = ({ username, onLogout }) => {
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    fetchUserAuctions();
  }, []);

  const fetchUserAuctions = async () => {
    try {
      const res = await fetch("http://localhost:3333/api/auctions/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setAuctions(data.auctions || []);
    } catch (error) {
      console.error("Error fetching auctions:", error);
    }
  };

  const handleUpdate = (auction) => {
    setSelectedAuction({ ...auction }); // clone to editable object
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
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerBox}>
        <h2 style={{ display: "flex", alignItems: "center", color: "#ff4552" }}>
          <GavelIcon style={{ marginRight: "10px" }} /> Biddr
        </h2>
        <div style={styles.headerRight}>
          <span style={styles.welcomeText}>Welcome, {username}</span>
          <FaBell style={styles.icon} />
          <FaSignOutAlt style={styles.icon} onClick={onLogout} />
        </div>
      </div>

      {/* Auction List */}
      <div style={styles.listContainer}>
        {auctions.map((auction) => (
          <div key={auction._id} style={styles.auctionCard}>
            <div style={styles.cardHeader}>
              <h3>{auction.name}</h3>
              <div>
                <IconButton onClick={() => handleUpdate(auction)}>
                  <SystemUpdateAltIcon style={styles.actionIcon} />
                </IconButton>
                <IconButton onClick={() => handleDelete(auction)}>
                  <DeleteIcon style={styles.actionIcon} />
                </IconButton>
              </div>
            </div>
            <p>Slots: {auction.slots}</p>
            <div style={styles.itemContainer}>
              {auction.items?.map((item, i) => (
                <button key={i} style={styles.itemBtn}>
                  {item.name} - ${item.price}
                </button>
              ))}
            </div>
          </div>
        ))}
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

// Styles (same as before)
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  headerBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    marginBottom: "30px",
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
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  auctionCard: {
    backgroundColor: "#ff4551",
    color: "#fff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionIcon: {
    color: "#fff",
  },
  itemContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "10px",
  },
  itemBtn: {
    backgroundColor: "#fff",
    color: "#ff4551",
    border: "none",
    borderRadius: "5px",
    padding: "5px 10px",
    fontWeight: "bold",
  },
};

export default Dashboard;
