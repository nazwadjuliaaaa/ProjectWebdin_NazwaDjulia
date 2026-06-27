import { Router } from "express";
import {
  getAllMahasiswa,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
} from "../controllers/mahasiswa.controller";
import { uploadFotoMahasiswa } from "../middlewares/upload.middleware";
import { verifyToken } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/role.middleware";

const router = Router();

// GET: semua role boleh melihat data
router.get("/", verifyToken, authorizeRole("admin", "operator", "viewer"), getAllMahasiswa);

// POST, PUT, DELETE: hanya admin dan operator
router.post("/", verifyToken, authorizeRole("admin", "operator"), uploadFotoMahasiswa.single("foto"), createMahasiswa);
router.put("/:id", verifyToken, authorizeRole("admin", "operator"), uploadFotoMahasiswa.single("foto"), updateMahasiswa);
router.delete("/:id", verifyToken, authorizeRole("admin", "operator"), deleteMahasiswa);

export default router;
