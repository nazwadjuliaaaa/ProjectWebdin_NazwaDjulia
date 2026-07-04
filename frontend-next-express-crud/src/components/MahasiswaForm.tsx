"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Mahasiswa, Prodi, BACKEND_URL } from "@/lib/api";

type Props = {
  selectedMahasiswa: Mahasiswa | null;
  prodiList: Prodi[];
  onSubmit: (formData: FormData) => Promise<void>;
  onCancelEdit: () => void;
};

export default function MahasiswaForm({
  selectedMahasiswa,
  prodiList,
  onSubmit,
  onCancelEdit,
}: Props) {
  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [angkatan, setAngkatan] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedMahasiswa) {
      setNim(selectedMahasiswa.nim);
      setNama(selectedMahasiswa.nama);
      setProdiId(String(selectedMahasiswa.prodi_id));
      setAngkatan(String(selectedMahasiswa.angkatan));

      if (selectedMahasiswa.foto) {
        setPreviewUrl(
          `${BACKEND_URL}/uploads/mahasiswa/${selectedMahasiswa.foto}`
        );
      } else {
        setPreviewUrl(null);
      }
    } else {
      setNim("");
      setNama("");
      setProdiId("");
      setAngkatan(String(new Date().getFullYear()));
      setPreviewUrl(null);
    }

    // Reset file input
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }, [selectedMahasiswa]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nim", nim);
      formData.append("nama", nama);
      formData.append("prodi_id", prodiId);
      formData.append("angkatan", angkatan);

      if (fileRef.current?.files?.[0]) {
        formData.append("foto", fileRef.current.files[0]);
      }

      await onSubmit(formData);

      // Reset form
      setNim("");
      setNama("");
      setProdiId("");
      setAngkatan(String(new Date().getFullYear()));
      setPreviewUrl(null);
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>
        {selectedMahasiswa ? "Edit Mahasiswa" : "Tambah Mahasiswa"}
      </h2>

      <div className="grid">
        <div className="form-group">
          <label htmlFor="nim">NIM</label>
          <input
            id="nim"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
            placeholder="Contoh: 2201001"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="nama">Nama Lengkap</label>
          <input
            id="nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama mahasiswa"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="prodi_id">Program Studi</label>
          <select
            id="prodi_id"
            value={prodiId}
            onChange={(e) => setProdiId(e.target.value)}
            required
          >
            <option value="">— Pilih Prodi —</option>
            {prodiList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_prodi}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="angkatan">Angkatan</label>
          <input
            id="angkatan"
            type="number"
            value={angkatan}
            onChange={(e) => setAngkatan(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="foto">Foto Mahasiswa</label>
          <input
            id="foto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            ref={fileRef}
            onChange={handleFileChange}
          />
        </div>

        {previewUrl && (
          <div className="form-group">
            <label>Preview Foto</label>
            <div className="photo-preview-container">
              <img
                src={previewUrl}
                alt="Preview"
                className="photo-preview"
              />
              <span className="photo-preview-label">
                {selectedMahasiswa?.foto
                  ? "Foto saat ini (upload baru untuk ganti)"
                  : "Foto yang akan diupload"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading
            ? "Menyimpan..."
            : selectedMahasiswa
            ? "Update"
            : "Simpan"}
        </button>

        {selectedMahasiswa && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancelEdit}
          >
            Batal Edit
          </button>
        )}
      </div>
    </form>
  );
}
