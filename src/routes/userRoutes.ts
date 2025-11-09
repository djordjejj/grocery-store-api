import express from "express";
import { createUser, deleteUser, getEmployeesByNode, updateUser } from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createUser);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);
router.get("/:nodeId/employees", protect, getEmployeesByNode);

export default router;
