"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getUsers,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  resetPasswordApi,
  User,
} from "@/lib/api";
import { getUser, isLoggedIn } from "@/lib/auth";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formNama, setFormNama] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("viewer");
  const [formLoading, setFormLoading] = useState(false);

  // Reset password modal
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }

    const user = getUser();
    if (user?.role !== "admin") {
      router.push("/mahasiswa");
      return;
    }

    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data user.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormNama("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("viewer");
    setShowForm(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormNama(user.nama);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setMessage("");

    try {
      if (editingUser) {
        await updateUserApi(editingUser.id, {
          nama: formNama,
          email: formEmail,
          role: formRole,
        });
        setMessage("✅ User berhasil diperbarui.");
      } else {
        await createUserApi({
          nama: formNama,
          email: formEmail,
          password: formPassword,
          role: formRole,
        });
        setMessage("✅ User berhasil ditambahkan.");
      }

      setShowForm(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan user.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;

    try {
      setMessage("");
      setError("");
      await deleteUserApi(id);
      setMessage("✅ User berhasil dihapus.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus user.");
    }
  };

  const handleResetPassword = async () => {
    if (!resetUserId || !resetPassword) return;

    try {
      setMessage("");
      setError("");
      await resetPasswordApi(resetUserId, resetPassword);
      setMessage("✅ Password user berhasil direset.");
      setResetUserId(null);
      setResetPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal reset password.");
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "badge badge-admin";
      case "operator":
        return "badge badge-operator";
      default:
        return "badge badge-viewer";
    }
  };

  return (
    <main className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h1>👥 Manajemen User</h1>
          <p>Kelola akun pengguna sistem — tambah, edit, hapus, reset password.</p>
        </div>
        <div className="actions">
          <Link href="/mahasiswa">
            <button className="btn-secondary">📋 Mahasiswa</button>
          </Link>
          <Link href="/">
            <button className="btn-secondary">← Beranda</button>
          </Link>
        </div>
      </div>

      {/* Messages */}
      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">❌ {error}</div>}

      {/* Add User Button */}
      <div style={{ marginBottom: 20 }}>
        <button className="btn-primary" onClick={handleOpenCreate}>
          ➕ Tambah User
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2>{editingUser ? "✏️ Edit User" : "➕ Tambah User Baru"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid">
              <div className="form-group">
                <label htmlFor="user-nama">Nama</label>
                <input
                  id="user-nama"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Nama lengkap"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="user-email">Email</label>
                <input
                  id="user-email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  required
                />
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label htmlFor="user-password">Password</label>
                  <input
                    id="user-password"
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="user-role">Role</label>
                <select
                  id="user-role"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  required
                >
                  <option value="viewer">Viewer</option>
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={formLoading}
              >
                {formLoading ? "⏳ Menyimpan..." : "💾 Simpan"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCloseForm}
              >
                ✕ Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetUserId && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2>🔐 Reset Password</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 16, fontSize: 14 }}>
            Masukkan password baru untuk user ID #{resetUserId}
          </p>
          <div className="form-group" style={{ maxWidth: 400 }}>
            <label htmlFor="reset-pw">Password Baru</label>
            <input
              id="reset-pw"
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              minLength={6}
            />
          </div>
          <div className="actions">
            <button className="btn-primary" onClick={handleResetPassword}>
              🔐 Reset Password
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setResetUserId(null);
                setResetPassword("");
              }}
            >
              ✕ Batal
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <section className="card">
        <h2>📊 Daftar User</h2>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            Memuat data...
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada data user.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 600 }}>{user.nama}</td>
                    <td style={{ fontFamily: "monospace" }}>{user.email}</td>
                    <td>
                      <span className={getRoleBadgeClass(user.role)}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn-secondary"
                          onClick={() => handleOpenEdit(user)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            setResetUserId(user.id);
                            setResetPassword("");
                          }}
                        >
                          🔐 Reset PW
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(user.id)}
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
