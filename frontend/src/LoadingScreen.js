import React, { useState, useEffect } from "react";
import Typewriter from "typewriter-effect";
import hammerGif from "./assets/hammer.gif";

// Random Quotes
const quotes = [
    "Going once, going twice... Sold!",
    "Place your bids wisely!",
    "The thrill of the auction starts now!",
    "Bid like there's no tomorrow!",
    "Every bid counts!",
    "A deal is only as good as the bidder!",
    "Fasten your seatbelt, the bidding war is about to begin!",
    "Bid high, bid often!",
    "Almost there… Your auction treasures await!",
    "The auction of a lifetime is just a click away!",
    "We’re gathering all the goods for you… Stay tuned!",
];

const LoadingScreen = () => {
    const [randomQuote, setRandomQuote] = useState("");
    const [progress, setProgress] = useState(0); // Track the progress

    useEffect(() => {
        setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);

        // Update progress every second
        const interval = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress >= 100) {
                    clearInterval(interval); // Stop when progress reaches 100
                    return 100;
                }
                return prevProgress + 10; // Increase by 10% each second
            });
        }, 1000);

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    return (
        <div style={styles.loadingContainer}>
            <img src={hammerGif} alt="Hammer GIF" style={styles.hammerGif} />

            <h1 style={styles.typewriterText}>
                <Typewriter options={{ strings: ["Biddr"], autoStart: true, loop: true, delay: 100 }} />
            </h1>

            <p style={styles.quote}>{randomQuote}</p>

            {/* Progress Bar */}
            <div style={styles.progressBarContainer}>
                <div
                    className="progress-bar"
                    style={{ ...styles.progressBar, width: `${progress}%` }} // Dynamically update width
                ></div>
            </div>
        </div>
    );
};

// 🔹 Styles
const styles = {
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "50vh",
        backgroundColor: "#f8f9fa",
    },
    hammerGif: { width: "100px", marginBottom: "10px" },
    typewriterText: { fontSize: "2rem", fontWeight: "bold", marginBottom: "10px" },
    quote: { fontSize: "1.2rem", fontStyle: "italic", color: "#555", marginBottom: "20px" },
    progressBarContainer: {
        width: "80%",
        height: "10px",
        backgroundColor: "#ddd",
        borderRadius: "5px",
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#ff4552",
        transition: "width 1s linear", 
    },
};

export default LoadingScreen;
