"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Users,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SiswaFormModal from "@/components/admin/siswa/SiswaFormModal";
import ImportExcelModal from "@/components/admin/siswa/ImportExcelModal";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";

interface Kelas {
  id: number;
  namaKelas: string;
  jurusan: string;
}

interface Siswa {
  id: number;
  nis: string;
  namaLengkap: string;
  kelasId: number;
  kelas: Kelas;
}

interface SiswaResponse {
  data: Siswa[];
  total: number;
  page: number;
  limit: number;
}

const LIMIT = 20;

export default function SiswaPage() {
  const [siswaRes, setSiswaRes] = useState<SiswaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editSiswa, setEditSiswa] = useState<Siswa | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Siswa | null>(null);

  const fetchSiswa = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(search ? { search } : {}),
      });
      const res = await fetch(`/api/siswa?${params}`);
      if (res.ok) setSiswaRes(await res.json());
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchSiswa();
  }, [fetchSiswa]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const totalPages = siswaRes ? Math.ceil(siswaRes.total / LIMIT) : 1;

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/siswa/${deleteTarget.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Gagal menghapus siswa.");
    }
    setDeleteTarget(null);
    fetchSiswa();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Siswa</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {siswaRes ? `Total ${siswaRes.total.toLocaleString("id-ID")} siswa` : "Memuat..."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open("/api/siswa/template", "_blank")}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-primary/40 text-sm font-medium text-primary hover:bg-primary/10 transition-all"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>
          <button
            onClick={() => { setEditSiswa(null); setModalOpen(true); }}
            className="flex items-center gap-2 bg-gradient-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari nama, NIS, atau kelas..."
          className="admin-input pl-9"
        />
      </div>

      {/* Table */}
      <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !siswaRes || siswaRes.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">
              {search ? "Siswa tidak ditemukan" : "Belum ada data siswa"}
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
                    NIS
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Nama Lengkap
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Kelas
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {siswaRes.data.map((siswa, idx) => (
                  <tr
                    key={siswa.id}
                    className="border-b border-border/50 hover:bg-white/3 transition-colors last:border-0"
                  >
                    <td className="px-5 py-4 text-muted-foreground">
                      {(page - 1) * LIMIT + idx + 1}
                    </td>
                    <td className="px-5 py-4 font-mono text-foreground text-xs">
                      {siswa.nis}
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">
                      {siswa.namaLengkap}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {siswa.kelas.namaKelas}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditSiswa(siswa); setModalOpen(true); }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(siswa)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-muted-foreground text-xs">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {modalOpen && (
        <SiswaFormModal
          siswa={editSiswa ?? undefined}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); fetchSiswa(); }}
        />
      )}

      {importOpen && (
        <ImportExcelModal
          onClose={() => setImportOpen(false)}
          onSuccess={() => { setImportOpen(false); fetchSiswa(); }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          title="Hapus Siswa"
          description={`Yakin ingin menghapus data siswa "${deleteTarget.namaLengkap}" (NIS: ${deleteTarget.nis})?`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
