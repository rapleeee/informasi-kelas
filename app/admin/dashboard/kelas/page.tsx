"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, School } from "lucide-react";
import KelasFormModal from "@/components/admin/kelas/KelasFormModal";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";

interface Kelas {
  id: number;
  namaKelas: string;
  jurusan: string;
  _count: { siswa: number };
}

export default function KelasPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editKelas, setEditKelas] = useState<Kelas | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Kelas | null>(null);

  const fetchKelas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/kelas");
      if (res.ok) {
        const data = await res.json();
        setKelasList(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKelas();
  }, [fetchKelas]);

  const filtered = kelasList.filter(
    (k) =>
      k.namaKelas.toLowerCase().includes(search.toLowerCase()) ||
      k.jurusan.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd() {
    setEditKelas(null);
    setModalOpen(true);
  }

  function handleEdit(kelas: Kelas) {
    setEditKelas(kelas);
    setModalOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/kelas/${deleteTarget.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Gagal menghapus kelas.");
    }
    setDeleteTarget(null);
    fetchKelas();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 brutal-block bg-white p-6 shadow-[4px_4px_0px_#000]">
        <div>
          <h1 className="heading-brutal text-3xl">Master Kelas</h1>
          <p className="text-foreground font-bold mt-1">
            Kelola daftar kelas yang tersedia
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="brutal-btn px-5 py-3 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          TAMBAH KELAS
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama kelas atau jurusan..."
          className="brutal-input w-full pl-12 py-3"
        />
      </div>

      {/* Table */}
      <div className="brutal-block bg-white shadow-[6px_6px_0px_#000] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <School className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm font-bold uppercase">
              {search ? "Kelas tidak ditemukan" : "Belum ada kelas"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12">No</th>
                  <th>Nama Kelas</th>
                  <th>Jurusan</th>
                  <th>Jumlah Siswa</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((kelas, idx) => (
                  <tr key={kelas.id}>
                    <td className="text-center">{idx + 1}</td>
                    <td className="font-black text-primary">
                      {kelas.namaKelas}
                    </td>
                    <td>{kelas.jurusan}</td>
                    <td>
                      <span className="badge-brutal">
                        {kelas._count.siswa} siswa
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(kelas)}
                          className="p-2 border-[3px] border-border bg-white text-foreground hover:bg-primary hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(kelas)}
                          className="p-2 border-[3px] border-border bg-white text-destructive hover:bg-destructive hover:text-white transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalOpen && (
        <KelasFormModal
          kelas={editKelas ?? undefined}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchKelas();
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          title="Hapus Kelas"
          description={`Yakin ingin menghapus kelas "${deleteTarget.namaKelas}"? Kelas tidak dapat dihapus jika masih ada siswa.`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
