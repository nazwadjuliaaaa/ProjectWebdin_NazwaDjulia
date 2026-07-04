"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MahasiswaForm from "@/components/MahasiswaForm";
import MahasiswaTable from "@/components/MahasiswaTable";
import {
  createMahasiswa,
  deleteMahasiswa,
  getMahasiswa,
  updateMahasiswa,
  getProdi,
  Mahasiswa,
  Prodi,
} from "@/lib/api";
import { isLoggedIn, getUser, logout, UserData } from "@/lib/auth";

export default function MahasiswaPage() {
  const router = useRouter();
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  // Search, Filter & Pagination
  const [search, setSearch] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPage, setTotalPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Auth check
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    setCurrentUser(getUser());
  }, [router]);

  const canEdit = true;

  const loadProdi = async () => {
    try {
      const data = await getProdi();
      setProdiList(data);
    } catch (err) {
      console.error("Gagal memuat data prodi:", err);
    }
  };

  const loadMahasiswa = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getMahasiswa({
        search,
        prodi_id: prodiId,
        page,
        limit,
      });
      setMahasiswa(result.data);
      setTotalPage(result.meta.totalPage);
      setTotal(result.meta.total);
    } catch (err) {
      if (err instanceof Error && err.message.includes("Token")) {
        logout();
        router.push("/login");
        return;
      }
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data mahasiswa"
      );
    } finally {
      setLoading(false);
    }
  }, [search, prodiId, page, limit, router]);

  useEffect(() => {
    if (currentUser) {
      loadProdi();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadMahasiswa();
    }
  }, [page, loadMahasiswa, currentUser]);

  const handleSearch = () => {
    setPage(1);
    loadMahasiswa();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFilterChange = (value: string) => {
    setProdiId(value);
    setPage(1);
  };

  useEffect(() => {
    if (currentUser) {
      loadMahasiswa();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prodiId]);

  const handleSubmit = async (formData: FormData) => {
    try {
      setMessage("");
      setError("");

      if (selectedMahasiswa) {
        await updateMahasiswa(selectedMahasiswa.id, formData);
        setMessage("Data mahasiswa berhasil diperbarui");
      } else {
        await createMahasiswa(formData);
        setMessage("Data mahasiswa berhasil ditambahkan");
      }

      setSelectedMahasiswa(null);
      await loadMahasiswa();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Yakin ingin menghapus data mahasiswa ini?"
    );
    if (!confirmed) return;

    try {
      setMessage("");
      setError("");
      await deleteMahasiswa(id);
      setMessage("Data mahasiswa berhasil dihapus");
      await loadMahasiswa();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const pageOffset = (page - 1) * limit;

  if (!currentUser) {
    return (
      <main className="container">
        <div className="loading">
          <div className="spinner"></div>
          Memeriksa autentikasi...
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Link href="/">Sistem Kampus</Link>
        </div>
        <div className="navbar-menu">
          <Link href="/mahasiswa">
            <button className="btn-secondary nav-btn nav-active">Mahasiswa</button>
          </Link>

          <div className="navbar-user">
            <span className="navbar-user-info">
              {currentUser.nama}
              <span className="badge badge-sm">{currentUser.role}</span>
            </span>
            <button className="btn-danger nav-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="header">
        <div>
          <h1>Data Mahasiswa</h1>
          <p>
            {canEdit
              ? "Kelola data mahasiswa — tambah, edit, hapus, cari, dan filter."
              : "Lihat data mahasiswa — cari dan filter."}
          </p>
        </div>
      </div>

      {/* Messages */}
      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}

      {/* Form — hanya tampil untuk admin/operator */}
      {canEdit && (
        <MahasiswaForm
          selectedMahasiswa={selectedMahasiswa}
          prodiList={prodiList}
          onSubmit={handleSubmit}
          onCancelEdit={() => setSelectedMahasiswa(null)}
        />
      )}

      {/* Data Table Section */}
      <section className="card section-gap">
        <h2>Daftar Mahasiswa</h2>

        {/* Toolbar: Search + Filter */}
        <div className="toolbar">
          <div className="search-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari berdasarkan NIM atau nama..."
            />
          </div>

          <select
            className="filter-select"
            value={prodiId}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="">Semua Prodi</option>
            {prodiList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama_prodi}
              </option>
            ))}
          </select>

          <button className="btn-primary" onClick={handleSearch}>
            Cari
          </button>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="stats-bar">
            Menampilkan <strong>{mahasiswa.length}</strong> dari{" "}
            <strong>{total}</strong> mahasiswa
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            Memuat data...
          </div>
        ) : (
          <MahasiswaTable
            mahasiswa={mahasiswa}
            onEdit={canEdit ? setSelectedMahasiswa : undefined}
            onDelete={canEdit ? handleDelete : undefined}
            pageOffset={pageOffset}
            showActions={canEdit}
          />
        )}

        {/* Pagination */}
        {!loading && totalPage > 0 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(1)}>
              Awal
            </button>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>

            <span className="pagination-info">
              Halaman <strong>{page}</strong> dari <strong>{totalPage}</strong>
            </span>

            <button
              disabled={page >= totalPage}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
            <button
              disabled={page >= totalPage}
              onClick={() => setPage(totalPage)}
            >
              Akhir
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
