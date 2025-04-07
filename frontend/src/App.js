import React, { useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";
import Login from "./Login";
import Home from "./Home";
import Dashboard from "./Dashboard";

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  if (!user) return <Login onLogin={(username) => setUser(username)} />;

  return (
    <>
      <Home username={user} />
      <Dashboard username={user} />
    </>
  );
}

export default App;
