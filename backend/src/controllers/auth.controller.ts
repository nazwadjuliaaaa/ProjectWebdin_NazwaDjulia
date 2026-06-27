import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      res.status(400).json({ message: "Nama, email, dan password wajib diisi." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password minimal 6 karakter." });
      return;
    }

    // Cek apakah email sudah terdaftar
    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      res.status(400).json({ message: "Email sudah terdaftar." });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Simpan user baru dengan role default 'viewer'
    const [result]: any = await db.query(
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)",
      [nama, email, hashedPassword, "viewer"]
    );

    res.status(201).json({
      message: "Registrasi berhasil.",
      data: {
        id: result.insertId,
        nama,
        email,
        role: "viewer",
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error in register:", error);
    res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email dan password wajib diisi." });
      return;
    }

    // Cari user berdasarkan email
    const [rows]: any = await db.query(
      "SELECT id, nama, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      res.status(401).json({ message: "Email atau password salah." });
      return;
    }

    const user = rows[0];

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Email atau password salah." });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        nama: user.nama,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login berhasil.",
      data: {
        token,
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error in login:", error);
    res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
  }
};

// GET /api/auth/profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Tidak terautentikasi." });
      return;
    }

    const [rows]: any = await db.query(
      "SELECT id, nama, email, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: "User tidak ditemukan." });
      return;
    }

    res.json({
      message: "Profil berhasil diambil.",
      data: rows[0],
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
  }
};
