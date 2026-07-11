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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Master Kelas</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Kelola daftar kelas yang tersedia
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-gradient-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Tambah Kelas
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama kelas atau jurusan..."
          className="admin-input pl-9"
        />
      </div>

      {/* Table */}
      <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <School className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">
              {search ? "Kelas tidak ditemukan" : "Belum ada kelas"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs text-muted-foreground uppercase tracking-wider font-medium w-12">
                    No
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Nama Kelas
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Jurusan
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Jumlah Siswa
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((kelas, idx) => (
                  <tr
                    key={kelas.id}
                    className="border-b border-border/50 hover:bg-white/3 transition-colors last:border-0"
                  >
                    <td className="px-5 py-4 text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">
                      {kelas.namaKelas}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {kelas.jurusan}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {kelas._count.siswa} siswa
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(kelas)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(kelas)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
