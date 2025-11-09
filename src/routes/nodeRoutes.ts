import express from "express";
import { createNode, deleteNode, getEmployeesForNode, getManagersForNode, updateNode } from "../controllers/nodeController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createNode);
router.put("/:id", protect, updateNode);
router.delete("/:id", protect, deleteNode);
router.get("/:nodeId/employees", protect, getEmployeesForNode);
router.get("/:nodeId/managers", protect, getManagersForNode);

export default router;
