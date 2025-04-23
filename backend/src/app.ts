import express from "express";
import mongoose from "../config/db.js";
import auctionRoutes from "./routes/auction.routes.js";
import authRoutes from "./routes/auth.routes.js";
import playerRoute from "./routes/bidding.routes.js";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "../config/passport.js";
import { createServer } from "http";
import { setupWebSocket } from "./socket.io.js";
import cors from "cors";

const app = express();
const server = createServer(app);
setupWebSocket(server);
dotenv.config();


app.use(cors({
  origin: "http://localhost:3000",  // Allow requests from your frontend's origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],  // Allow specific HTTP methods
  credentials: true,  // Allow cookies or authentication headers if needed
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

const port = process.env.PORT || 3333;
const host = process.env.HOST || "localhost";
// Using Routes
app.use("/api/auctions", auctionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/player", playerRoute);

server.listen(Number(port), host, () => {
  mongoose.connect;
  console.log(`Server started at http://${host}:${port}`);
});
