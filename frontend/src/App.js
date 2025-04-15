import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";
import Login from "./Login";
import Home from "./Home";
import Dashboard from "./Dashboard";
import AuthSuccess from "./AuthSuccess";
import AuctionRoom from "./AuctionRoom";

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if there's a user already logged in from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // If user exists in localStorage, set state
    }

    // Set loading to false after 1 second
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/home" /> : <Login onLogin={setUser} />}
        />
        <Route
          path="/home"
          element={user ? <Home username={user.name} /> : <Navigate to="/" />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard username={user.name} /> : <Navigate to="/" />}
        />
        <Route
          path="/auth/success"
          element={<AuthSuccess onLogin={setUser} />}
        />
        <Route
          path="/auction-room/:auctionId"
          element={user ? <AuctionRoom username={user.name} /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
