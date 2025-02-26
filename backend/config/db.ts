import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",
    logging: false,
  }
);

sequelize
  .authenticate()

  .then(() => console.log("PostgreSQL connected"))
  .catch((err) => console.error("Connection error:", err));

export default sequelize;
