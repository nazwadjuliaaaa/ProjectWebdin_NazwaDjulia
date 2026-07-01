import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import mahasiswaRoutes from "./routes/mahasiswa.route";
import prodiRoutes from "./routes/prodi.route";
// import authRoutes from "./routes/auth.route";
// import userRoutes from "./routes/user.route";

const app = express();

app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Agar file di folder uploads bisa diakses oleh frontend
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "Backend Express berjalan" });
});

// app.use("/api/auth", authRoutes);
app.use("/api/prodi", prodiRoutes);
app.use("/api/mahasiswa", mahasiswaRoutes);
// app.use("/api/users", userRoutes);

// Global error handler — menangkap error Multer dan error lainnya
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "Ukuran file terlalu besar. Maksimal 2 MB." });
      return;
    }
    res.status(400).json({ message: `Upload error: ${err.message}` });
    return;
  }

  if (err) {
    res.status(400).json({ message: err.message || "Terjadi kesalahan." });
    return;
  }

  next();
});

export default app;
