// Pertemuan 13: Login & Register page
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regNama, setRegNama] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await loginUser(loginEmail, loginPassword);
      saveAuth(data);
      setMessage("Login berhasil! Mengalihkan...");
      setTimeout(() => router.push("/mahasiswa"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (regPassword !== regConfirm) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      await registerUser(regNama, regEmail, regPassword);
      setMessage("Registrasi berhasil! Silakan login.");
      setActiveTab("login");
      setLoginEmail(regEmail);
      setLoginPassword("");
      setRegNama("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="login-wrapper">
        <div className="login-card card">
          {/* Logo / Title */}
          <div className="login-header">
            <h1>Sistem Kampus</h1>
            <p>Masuk untuk mengakses data mahasiswa</p>
          </div>

          {/* Messages */}
          {message && <div className="message success">{message}</div>}
          {error && <div className="message error">{error}</div>}

          {/* Tab Switcher */}
          <div className="tab-switcher">
            <button
              className={`tab ${activeTab === "login" ? "tab-active" : ""}`}
              onClick={() => {
                setActiveTab("login");
                setError("");
                setMessage("");
              }}
            >
              Login
            </button>
            <button
              className={`tab ${activeTab === "register" ? "tab-active" : ""}`}
              onClick={() => {
                setActiveTab("register");
                setError("");
                setMessage("");
              }}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary btn-full"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label htmlFor="reg-nama">Nama Lengkap</label>
                <input
                  id="reg-nama"
                  value={regNama}
                  onChange={(e) => setRegNama(e.target.value)}
                  placeholder="Nama lengkap"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm">Konfirmasi Password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="Ulangi password"
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary btn-full"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Daftar"}
              </button>
            </form>
          )}
          
        </div>
      </div>
    </main>
  );
}
