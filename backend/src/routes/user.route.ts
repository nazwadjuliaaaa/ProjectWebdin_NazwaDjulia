import { Router } from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPasswordByAdmin,
  forgotPassword,
  resetPasswordWithToken,
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/role.middleware";

const router = Router();

// Public routes (untuk reset password via token)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordWithToken);

// Protected routes (admin only)
router.get("/", verifyToken, authorizeRole("admin"), getAllUsers);
router.post("/", verifyToken, authorizeRole("admin"), createUser);
router.put("/:id", verifyToken, authorizeRole("admin"), updateUser);
router.delete("/:id", verifyToken, authorizeRole("admin"), deleteUser);
router.post("/:id/reset-password", verifyToken, authorizeRole("admin"), resetPasswordByAdmin);

export default router;
