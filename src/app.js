import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectMongoDB } from "./db/mongodbConnection.js";
import crawler from "./utilities/crawler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, Node.js!");
});

const startServer = async () => {
  try {
    connectMongoDB(process.env.MONGO_URI);

    app.listen(PORT, () => {
      console.log(`Server started at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }

  await crawler();
};

startServer();
