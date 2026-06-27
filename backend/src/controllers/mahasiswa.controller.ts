import { Request, Response } from "express";
import db from "../config/db";

export const getAllMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = String(req.query.search || "");
    const prodiId = req.query.prodi_id ? Number(req.query.prodi_id) : null;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const offset = (page - 1) * limit;

    let where = "WHERE 1=1";
    const params: any[] = [];

    if (search) {
      where += " AND (m.nim LIKE ? OR m.nama LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (prodiId) {
      where += " AND m.prodi_id = ?";
      params.push(prodiId);
    }

    const [countRows]: any = await db.query(
      `SELECT COUNT(*) AS total FROM mahasiswa m ${where}`,
      params
    );

    const total = countRows[0].total;

    const [rows] = await db.query(
      `SELECT
        m.id,
        m.nim,
        m.nama,
        m.angkatan,
        m.foto,
        p.id AS prodi_id,
        p.nama_prodi
      FROM mahasiswa m
      JOIN prodi p ON m.prodi_id = p.id
      ${where}
      ORDER BY m.id DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      message: "Data mahasiswa berhasil diambil",
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: rows,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error in getAllMahasiswa:", error);
    res.status(500).json({ message: "Terjadi kesalahan server", error: err.message });
  }
};

export const createMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nim, nama, prodi_id, angkatan } = req.body;
    const foto = req.file ? req.file.filename : null;

    if (!nim || !nama || !prodi_id || !angkatan) {
      res.status(400).json({
        message: "NIM, nama, prodi, dan angkatan wajib diisi",
      });
      return;
    }

    const [existing]: any = await db.query(
      "SELECT id FROM mahasiswa WHERE nim = ?",
      [nim]
    );

    if (existing.length > 0) {
      res.status(400).json({ message: "NIM sudah digunakan" });
      return;
    }

    const [result]: any = await db.query(
      `INSERT INTO mahasiswa (nim, nama, prodi_id, angkatan, foto)
       VALUES (?, ?, ?, ?, ?)`,
      [nim, nama, Number(prodi_id), Number(angkatan), foto]
    );

    res.status(201).json({
      message: "Mahasiswa berhasil ditambahkan",
      data: { id: result.insertId, nim, nama, prodi_id, angkatan, foto },
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error in createMahasiswa:", error);
    res.status(500).json({ message: "Gagal menambahkan data mahasiswa", error: err.message });
  }
};

export const updateMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nim, nama, prodi_id, angkatan } = req.body;

    const fields = ["nim = ?", "nama = ?", "prodi_id = ?", "angkatan = ?"];
    const values: any[] = [nim, nama, Number(prodi_id), Number(angkatan)];

    if (req.file) {
      fields.push("foto = ?");
      values.push(req.file.filename);
    }

    values.push(id);

    const [result]: any = await db.query(
      `UPDATE mahasiswa SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
      return;
    }

    res.json({ message: "Mahasiswa berhasil diperbarui" });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: "Gagal memperbarui data mahasiswa", error: err.message });
  }
};

export const deleteMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [result]: any = await db.query(
      "DELETE FROM mahasiswa WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
      return;
    }

    res.json({
      message: "Data mahasiswa berhasil dihapus",
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: "Gagal menghapus data mahasiswa", error: err.message });
  }
};
