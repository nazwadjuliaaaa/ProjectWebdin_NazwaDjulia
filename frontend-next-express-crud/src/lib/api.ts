import { getToken } from "./auth";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

// ─── Types ──────────────────────────────────────────

export type Prodi = {
  id: number;
  nama_prodi: string;
};

export type Mahasiswa = {
  id: number;
  nim: string;
  nama: string;
  prodi_id: number;
  nama_prodi: string;
  angkatan: number;
  foto?: string | null;
};

export type MahasiswaMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type MahasiswaResponse = {
  message: string;
  meta: MahasiswaMeta;
  data: Mahasiswa[];
};

export type User = {
  id: number;
  nama: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  created_at?: string;
  updated_at?: string;
};

// ─── Helper: Auth Headers ───────────────────────────

function authHeaders(): Record<string, string> {
  const token = getToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

// ─── Auth API ───────────────────────────────────────

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result.data;
}

export async function registerUser(nama: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama, email, password }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result.data;
}

export async function getProfile() {
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result.data;
}

// ─── Prodi API ──────────────────────────────────────

export async function getProdi(): Promise<Prodi[]> {
  const response = await fetch(`${API_URL}/prodi`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const result = await response.json();

  if (!response.ok) throw new Error(result.message);
  return result.data || [];
}

// ─── Mahasiswa API ──────────────────────────────────

export async function getMahasiswa(params: {
  search?: string;
  prodi_id?: string;
  page?: number;
  limit?: number;
}): Promise<MahasiswaResponse> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.prodi_id) query.set("prodi_id", params.prodi_id);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const response = await fetch(`${API_URL}/mahasiswa?${query.toString()}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const result = await response.json();

  if (!response.ok) throw new Error(result.message);
  return result;
}

export async function createMahasiswa(formData: FormData): Promise<Mahasiswa> {
  const response = await fetch(`${API_URL}/mahasiswa`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result.data as Mahasiswa;
}

export async function updateMahasiswa(
  id: number,
  formData: FormData
): Promise<void> {
  const response = await fetch(`${API_URL}/mahasiswa/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
}

export async function deleteMahasiswa(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/mahasiswa/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
}

// ─── Users API (Admin) ─────────────────────────────

