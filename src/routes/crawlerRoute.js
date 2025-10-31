import express from "express";

import crawler from "../utilities/crawler.js";
import authenticateToken from "../middlewares/apiAuth.js";
import apiLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get("/", authenticateToken, apiLimiter, async (req, res) => {
  try {
    await crawler();

    res.status(200).json({
      success: true,
      message: "Crawler execution is completed."
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;