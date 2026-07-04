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
router.get("/", verifyToken, getAllMahasiswa);

// POST, PUT, DELETE: hanya admin dan operator
router.post("/", verifyToken, uploadFotoMahasiswa.single("foto"), createMahasiswa);
router.put("/:id", verifyToken, uploadFotoMahasiswa.single("foto"), updateMahasiswa);
router.delete("/:id", verifyToken, deleteMahasiswa);

export default router;
