import express from "express";
import mongoose from "../config/db";
import auctionRoutes from "./routes/auction.routes";
import authRoutes from "./routes/auth.routes";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "../config/passport";

const app = express();
dotenv.config();

app.use(express.json());
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

app.listen(Number(port), host, () => {
  mongoose.connect;
  console.log(`Server started at http://${host}:${port}`);
});
