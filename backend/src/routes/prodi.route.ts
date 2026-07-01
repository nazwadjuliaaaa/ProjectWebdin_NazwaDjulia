import { Router } from "express";
import { getAllProdi } from "../controllers/prodi.controller";

const router = Router();

// Semua user bebas melihat data prodi tanpa login
router.get("/", getAllProdi);

export default router;
