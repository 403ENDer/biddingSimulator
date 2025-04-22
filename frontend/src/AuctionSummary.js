import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";  // Use useNavigate instead of useHistory
import GavelIcon from "@mui/icons-material/Gavel";
import { FaSignOutAlt } from "react-icons/fa";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Button from "@mui/material/Button";

const AuctionSummary = ({ username, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();  // Use useNavigate hook here
  const { auctionSummary, winnerData } = location.state || {};

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  useEffect(() => {
    if (winnerData && winnerData.length > 0) {
      setSnackbarMsg("Auction finished successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } else {
      setSnackbarMsg("No winner information available.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [winnerData]);

  const handleBackToAuctionRoom = () => {
    navigate(`/auction-room/${auctionSummary.id}`, { state: { auctionSummary } }); // Use navigate instead of history.push
  };

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

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
          <FaSignOutAlt style={styles.icon} onClick={onLogout} />
        </div>
      </div>

      {/* Auction Summary Section */}
      <div style={styles.summaryBox}>
        <h3>Auction Summary</h3>
        <div style={styles.details}>
          <h4>Auction ID: {auctionSummary?.id}</h4>
          <p><strong>Items Auctioned:</strong> {auctionSummary?.items.length}</p>
        </div>

        {winnerData && winnerData.length > 0 ? (
          <div style={styles.winnerList}>
            <h4>Winners</h4>
            <ul>
              {winnerData.map((winner, idx) => (
                <li key={idx}>
                  <strong>{winner.name}</strong> won with a purse of ₹{winner.purse}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No winner data available.</p>
        )}

        <div style={styles.buttonContainer}>
          <Button variant="contained" color="primary" onClick={handleBackToAuctionRoom}>
            Back to Auction Room
          </Button>
        </div>
      </div>

      {/* Snackbar for showing messages */}
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
  logo: {
    display: "flex",
    alignItems: "center",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#ff4552",
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
  summaryBox: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    width: "800px",
    textAlign: "center",
  },
  details: {
    marginBottom: "20px",
  },
  winnerList: {
    marginTop: "20px",
    textAlign: "left",
  },
  buttonContainer: {
    marginTop: "20px",
  },
};

export default AuctionSummary;
