import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { connectMongoDB } from "./db/mongodbConnection.js";
import swaggerSpecs from "./config/swaggerOptions.js";
import crawler from "./utilities/crawler.js";
import policyRoute from "./routes/policyRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use("/api/v1/policies", policyRoute);

const startServer = async () => {
  try {
    connectMongoDB(process.env.MONGO_URI);

    app.listen(PORT, () => {
      console.log(`Server started at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }

  // await crawler();
};

startServer();
