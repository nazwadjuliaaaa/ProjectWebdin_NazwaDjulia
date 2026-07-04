// Pertemuan 15: CRUD Daftar User dan Reset Password
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import db from "../config/db";
import transporter from "../config/mail";
import { AuthRequest } from "../middlewares/auth.middleware";
import dotenv from "dotenv";

dotenv.config();

// GET /api/users
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query(
      "SELECT id, nama, email, role, created_at, updated_at FROM users ORDER BY id ASC"
    );

    res.json({
      message: "Data user berhasil diambil.",
      data: rows,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
  }
};

// POST /api/users
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nama, email, password, role } = req.body;

    if (!nama || !email || !password) {
      res.status(400).json({ message: "Nama, email, dan password wajib diisi." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password minimal 6 karakter." });
      return;
    }

    const validRoles = ["admin", "operator", "viewer"];
    if (role && !validRoles.includes(role)) {
      res.status(400).json({ message: "Role harus admin, operator, atau viewer." });
      return;
    }

    // Cek email duplikat
    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      res.status(400).json({ message: "Email sudah terdaftar." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result]: any = await db.query(
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)",
      [nama, email, hashedPassword, role || "viewer"]
    );

    res.status(201).json({
      message: "User berhasil ditambahkan.",
      data: {
        id: result.insertId,
        nama,
        email,
        role: role || "viewer",
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
  }
};

// PUT /api/users/:id
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nama, email, role } = req.body;

    const validRoles = ["admin", "operator", "viewer"];
    if (role && !validRoles.includes(role)) {
      res.status(400).json({ message: "Role harus admin, operator, atau viewer." });
      return;
    }

    // Cek email duplikat (selain user ini)
    if (email) {
      const [existing]: any = await db.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, id]
      );

      if (existing.length > 0) {
        res.status(400).json({ message: "Email sudah digunakan user lain." });
        return;
      }
    }

    const [result]: any = await db.query(
      "UPDATE users SET nama = ?, email = ?, role = ? WHERE id = ?",
      [nama, email, role, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "User tidak ditemukan." });
      return;
    }

    res.json({ message: "User berhasil diperbarui." });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Jangan hapus diri sendiri
    if (req.user && req.user.id === Number(id)) {
      res.status(400).json({ message: "Tidak bisa menghapus akun sendiri." });
      return;
    }

    const [result]: any = await db.query(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "User tidak ditemukan." });
      return;
    }

    res.json({ message: "User berhasil dihapus." });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
  }
};

function generateTemporaryPassword() {
  return Math.random().toString(36).slice(-10);
}

// PATCH /api/users/:id/reset-password (Admin reset password user)
export const resetPasswordByAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const [result]: any = await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "User tidak ditemukan." });
      return;
    }

    res.json({
      message: "Password berhasil direset.",
      temporaryPassword,
      note: "Tampilkan hanya sekali, lalu minta user mengganti password.",
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
  }
};


// POST /api/users/forgot-password (kirim email reset)
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email wajib diisi." });
      return;
    }

    const [rows]: any = await db.query(
      "SELECT id, nama, email FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      // Tetap kirim response sukses untuk keamanan
      res.json({ message: "Jika email terdaftar, link reset password telah dikirim." });
      return;
    }

    const user = rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 3600000); // 1 jam

    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_exp = ? WHERE id = ?",
      [resetToken, resetExpiry, user.id]
    );

    // Kirim email (opsional, jika SMTP dikonfigurasi)
    try {
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "Reset Password - Sistem Kampus",
        html: `
          <h2>Reset Password</h2>
          <p>Halo ${user.nama},</p>
          <p>Anda menerima email ini karena ada permintaan reset password.</p>
          <p>Token reset: <strong>${resetToken}</strong></p>
          <p>Token berlaku selama 1 jam.</p>
          <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        `,
      });
    } catch (mailError) {
      console.log("Email tidak terkirim (SMTP belum dikonfigurasi):", mailError);
    }

    res.json({
      message: "Jika email terdaftar, link reset password telah dikirim.",
      // Untuk development, tampilkan token (hapus di production)
      reset_token: resetToken,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
  }
};

// POST /api/users/reset-password (user reset pakai token)
export const resetPasswordWithToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      res.status(400).json({ message: "Token dan password baru wajib diisi." });
      return;
    }

    if (new_password.length < 6) {
      res.status(400).json({ message: "Password baru minimal 6 karakter." });
      return;
    }

    const [rows]: any = await db.query(
      "SELECT id FROM users WHERE reset_token = ? AND reset_token_exp > NOW()",
      [token]
    );

    if (rows.length === 0) {
      res.status(400).json({ message: "Token tidak valid atau sudah expired." });
      return;
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_exp = NULL WHERE id = ?",
      [hashedPassword, rows[0].id]
    );

    res.json({ message: "Password berhasil direset." });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
  }
};
