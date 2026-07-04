"use client";

import { Mahasiswa, BACKEND_URL } from "@/lib/api";

type Props = {
  mahasiswa: Mahasiswa[];
  onEdit?: (item: Mahasiswa) => void;
  onDelete?: (id: number) => Promise<void>;
  pageOffset: number;
  showActions?: boolean;
};

export default function MahasiswaTable({
  mahasiswa,
  onEdit,
  onDelete,
  pageOffset,
  showActions = true,
}: Props) {
  if (mahasiswa.length === 0) {
    return (
      <div className="empty-state">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
          />
        </svg>
        <p>Belum ada data mahasiswa</p>
        <p className="sub">Tambahkan mahasiswa baru menggunakan form di atas</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Foto</th>
            <th>NIM</th>
            <th>Nama</th>
            <th>Program Studi</th>
            <th>Angkatan</th>
            {showActions && <th>Aksi</th>}
          </tr>
        </thead>

        <tbody>
          {mahasiswa.map((item, index) => (
            <tr key={item.id}>
              <td>{pageOffset + index + 1}</td>
              <td>
                {item.foto ? (
                  <img
                    src={`${BACKEND_URL}/uploads/mahasiswa/${item.foto}`}
                    alt={item.nama}
                    className="avatar"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {item.nama.charAt(0).toUpperCase()}
                  </div>
                )}
              </td>
              <td style={{ fontFamily: "var(--font-geist-mono), monospace", fontWeight: 500 }}>
                {item.nim}
              </td>
              <td style={{ fontWeight: 600 }}>{item.nama}</td>
              <td>
                <span className="badge">{item.nama_prodi}</span>
              </td>
              <td>{item.angkatan}</td>
              {showActions && (
                <td>
                  <div className="actions">
                    <button
                      className="btn-secondary"
                      onClick={() => onEdit?.(item)}
                      title="Edit mahasiswa"
                    >
                      Edit
                    </button>

                    <button
                      className="btn-danger"
                      onClick={() => onDelete?.(item.id)}
                      title="Hapus mahasiswa"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
