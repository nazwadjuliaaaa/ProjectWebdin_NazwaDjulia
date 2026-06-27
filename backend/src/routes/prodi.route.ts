import { Router } from "express";
import { getAllProdi } from "../controllers/prodi.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

// Semua user yang login bisa melihat data prodi
router.get("/", verifyToken, getAllProdi);

export default router;
