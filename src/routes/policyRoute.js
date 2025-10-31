import express from "express";

import policyModel from "../models/policies.schema.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/policies:
 *   get:
 *     tags:
 *       - Policies
 *     summary: Retrieve a list of HR policies
 *     description: Fetches a list of HR policies filtered by pagination options.
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
 *     responses:
 *       200:
 *         description: A successful response with a list of HR policies.
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
 *                     description: A single HR policy.
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
    const { page = 0, pageSize = 11 } = req.query;

    // Convert page and pageSize to integers for calculation purposes
    const currentPage = parseInt(page);
    const limit = Math.min(parseInt(pageSize), 100); // Limit the page size to 100 to avoid performance issues

    const filter = { isDeleted: false };
    const totalpolicies = await policyModel.countDocuments(filter);

    const totalPages = Math.ceil(totalpolicies / limit);
    const start = currentPage * limit;

    const policies = await policyModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(start)
      .limit(limit)
      .lean() // Use lean to improve query performance

    res.status(200).json({
      success: true,
      data: policies,
      currentPage,
      totalPages,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/policies/{id}:
 *   delete:
 *     tags:
 *       - Policies
 *     summary: Soft delete a HR policy by ID
 *     description: Soft deletes a HR policy by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the policy to delete.
 *     responses:
 *       200:
 *         description: Successfully soft deleted the policy.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Policy soft-deleted successfully"
 *       404:
 *         description: Policy not found.
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
 *                   example: "Policy not found"
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPolicy = await policyModel.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } }
    );

    if (deletedPolicy.matchedCount < 1) {
      return res
        .status(404)
        .json({ success: false, message: "Policy not found" });
    }

    res.status(200).json({ success: true, message: "Policy soft-deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;