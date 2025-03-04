import React from "react";
import Typewriter from "typewriter-effect";
import hammerGif from "./assets/hammer.gif";
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import GavelIcon from "@mui/icons-material/Gavel"; // Correct import for MUI v5

const Home = ({ username, onLogout }) => {
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
          <Typewriter
            options={{
              strings: ["Biddr"],
              autoStart: true,
              loop: true,
              delay: 100,
            }}
          />
        </h1>
        <img src={hammerGif} alt="Hammer GIF" style={styles.hammerGif} />
        <div style={styles.buttonContainer}>
          <button style={{ ...styles.btn, ...styles.createBtn }}>Create</button>
          <button style={{ ...styles.btn, ...styles.joinBtn }}>Join</button>
          <button style={{ ...styles.btn, ...styles.dashboardBtn}}>Dashboard</button>
        </div>
      </div>
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
  logo: {
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
  squareBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "800px",  // Fixed width
    height: "400px", // Equal height to maintain a square shape
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
    backgroundColor: "#ff4552"
  },
};

export default Home;
