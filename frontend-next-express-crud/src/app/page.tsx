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
    setLoggedIn(isLoggedIn());
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setUser(null);
    router.push("/login");
  };

  return (
    <main className="container">
      <div className="card home-card">
        <h1>Sistem Informasi Mahasiswa</h1>
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
                <button className="btn-primary">Data Mahasiswa</button>
              </Link>

              {user.role === "admin" && (
                <Link href="/users">
                  <button className="btn-secondary">Manajemen User</button>
                </Link>
              )}

              <button className="btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="home-buttons">
            <Link href="/login">
              <button className="btn-primary">Login / Register</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
