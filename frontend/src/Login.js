import React, { useState } from "react"; 
import * as Components from "./Components"; 
import Typewriter from "typewriter-effect"; 
import hammerGif from "./assets/hammer.gif"; 
import signin from "./assets/signin.gif"; 
import GoogleIcon from "@mui/icons-material/Google";  

const Login = ({ onLogin }) => { 
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState(""); 

    const handleLogin = () => { 
        if (email.trim() !== "") { 
            onLogin(email); 
        } 
    }; 

    const handleGoogleLogin = () => { 
        
        window.location.href = "http://localhost:3333/api/auth/google"; 
    }; 

    return ( 
        <Components.Container> 
            {/* Sign In Section */} 
            <Components.SignInContainer signinIn={true}> 
                <Components.Form> 
                    <Components.Title style={{ color: "#ff4554" }}>Sign in</Components.Title> 
                    
                    <img 
                        src={signin} 
                        alt="Sign in Animation" 
                        style={{ width: "120px", margin: "10px auto" }} 
                    /> 
                    
                    <Components.Button 
                        onClick={handleGoogleLogin} 
                        style={{ 
                            backgroundColor: "#ff4264", 
                            color: "#fff", 
                            marginTop: "10px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center" 
                        }} 
                    > 
                        <GoogleIcon style={{ marginRight: "8px" }} /> 
                        Sign in with Google 
                    </Components.Button> 
                </Components.Form> 
            </Components.SignInContainer> 

            {/* Overlay Container */} 
            <Components.OverlayContainer signinIn={true}> 
                <Components.Overlay signinIn={true}> 
                    <Components.RightOverlayPanel signinIn={true}> 
                        <Components.Title style={{ fontSize: "36px" }}> 
                            <Typewriter 
                                options={{ 
                                    strings: ["Hello, Biddr!"], 
                                    autoStart: true, 
                                    loop: true, 
                                    delay: 100 
                                }} 
                            /> 
                        </Components.Title> 
                        <img 
                            src={hammerGif} 
                            alt="Hammer GIF" 
                            style={{ width: "100px", marginTop: "10px" }} 
                        /> 
                        <Components.Title style={{ marginTop: "20px", fontSize: "16px" }}> 
                            <Typewriter 
                                options={{ 
                                    strings: ["Ready ! set !! bid !!!"], 
                                    autoStart: true, 
                                    loop: true, 
                                    delay: 100 
                                }} 
                            /> 
                        </Components.Title> 
                    </Components.RightOverlayPanel> 
                </Components.Overlay> 
            </Components.OverlayContainer> 
        </Components.Container> 
    ); 
}; 

export default Login;
