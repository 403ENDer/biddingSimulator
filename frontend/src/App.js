import React, { useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";
import Login from "./Login";
import Home from "./Home";

function App() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return loading ? (
        <LoadingScreen />
    ) : user ? (
        <Home username={user} />
    ) : (
        <Login onLogin={(username) => setUser(username)} />
    );
}

export default App;
