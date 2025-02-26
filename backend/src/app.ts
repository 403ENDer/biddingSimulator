import express from "express";
import sequelize from "../config/db";

const app = express();

app.get("/", (req, res) => {
  console.log("Ready to fetch the request");
});

sequelize.sync();
app.listen(3000, () => {
  console.log("Server started");
});
