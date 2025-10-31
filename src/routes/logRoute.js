import express from "express";

import logModel from "../models/logs.schema.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/logs:
 *   get:
 *     tags:
 *       - Logs
 *     summary: Retrieve a list of crawler logs
 *     description: Fetches a list of crawler logs filtered by pagination options.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: The page number for pagination.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         required: false
 *         description: The number of items per page.
 *       - in: query
 *         name: isDuplicate
 *         schema:
 *           type: boolean
 *           enum: [true, false]
 *         required: false
 *         description: Filter for duplicate
 *     responses:
 *       200:
 *         description: A successful response with a list of crawler logs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: A single crawler log.
 *                 currentPage:
 *                   type: integer
 *                   example: 0
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *       500:
 *         description: Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Mongodb connection timeout"
 */
router.get("/", async (req, res) => {
  try {
    const { page = 0, pageSize = 11, isDuplicate } = req.query;

    // Convert page and pageSize to integers for calculation purposes
    const currentPage = parseInt(page);
    const limit = Math.min(parseInt(pageSize), 100); // Limit the page size to 100 to avoid performance issues

    const filter = isDuplicate ? { isDuplicate } : {};
    const totalLogs = await logModel.countDocuments(filter);

    const totalPages = Math.ceil(totalLogs / limit);
    const start = currentPage * limit;

    const logs = await logModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(start)
      .limit(limit)
      .lean() // Use lean to improve query performance

    res.status(200).json({
      success: true,
      data: logs,
      currentPage,
      totalPages,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;