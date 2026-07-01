"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUser, logout, UserData } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(true);
    setUser({ id: 1, nama: "User Kelas", email: "guest@kampus.ac.id", role: "admin" });
  }, []);

  const handleLogout = () => {
    // skipped for tugas-kelas
  };

  return (
    <main className="container">
      <div className="card home-card">
        <h1>🎓 Sistem Informasi Mahasiswa</h1>
        <p>
          Aplikasi CRUD mahasiswa dengan fitur relasi tabel prodi, upload foto,
          search, filter, pagination, autentikasi JWT, role authorization, dan
          manajemen user. Built with Next.js + Express.js + MySQL.
        </p>

        {loggedIn && user ? (
          <div className="home-nav">
            <div className="home-welcome">
              Selamat datang, <strong>{user.nama}</strong>
              <span className="badge badge-sm">{user.role}</span>
            </div>

            <div className="home-buttons">
              <Link href="/mahasiswa">
                <button className="btn-primary">📋 Buka Data Mahasiswa</button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="home-buttons">
            <Link href="/login">
              <button className="btn-primary">🔑 Login / Register</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
