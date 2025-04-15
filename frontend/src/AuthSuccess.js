// AuthSuccess.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthSuccess = ({ onLogin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      const decoded = jwtDecode(token);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(decoded)); // Save user info to localStorage
      localStorage.setItem("playerId", decoded.id); // Save player ID to localStorage

      // Call onLogin to update the user state in App.js
      onLogin(decoded); // Pass the full decoded user object to App.js
      navigate("/home"); // Redirect to the home page
    } else {
      navigate("/"); // In case token is missing
    }
  }, [navigate, onLogin]);

  return null;
};

export default AuthSuccess;
