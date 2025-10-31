import express from "express";

import crawler from "../utilities/crawler.js";

const router = express.Router();

router.get("/", async (req, res) => {
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