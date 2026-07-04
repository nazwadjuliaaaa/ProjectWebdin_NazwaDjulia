// Pertemuan 13: Auth helper — menggunakan localStorage untuk menyimpan token dan data user

export type UserData = {
  id: number;
  nama: string;
  email: string;
  role: "admin" | "operator" | "viewer";
};

type AuthData = {
  token: string;
  user: UserData;
};

const AUTH_KEY = "auth_data";

export function saveAuth(data: AuthData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
  }
}

export function getAuth(): AuthData | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthData;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  const auth = getAuth();
  return auth?.token || null;
}

export function getUser(): UserData | null {
  const auth = getAuth();
  return auth?.user || null;
}

export function getUserRole(): string | null {
  const user = getUser();
  return user?.role || null;
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}
