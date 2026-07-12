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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 brutal-block bg-white p-6 shadow-[4px_4px_0px_#000]">
        <div>
          <h1 className="heading-brutal text-3xl">Data Siswa</h1>
          <p className="text-foreground font-bold mt-1">
            {siswaRes ? `Total ${siswaRes.total.toLocaleString("id-ID")} siswa` : "Memuat..."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.open("/api/siswa/template", "_blank")}
            className="px-4 py-2 flex items-center justify-center gap-1.5 border-[3px] border-border bg-white text-foreground hover:bg-muted font-black uppercase text-sm shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="px-4 py-2 flex items-center justify-center gap-1.5 border-[3px] border-border bg-secondary text-secondary-foreground hover:bg-white font-black uppercase text-sm shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>
          <button
            onClick={() => { setEditSiswa(null); setModalOpen(true); }}
            className="brutal-btn px-4 py-2 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari nama, NIS, atau kelas..."
          className="brutal-input w-full pl-12 py-3"
        />
      </div>

      {/* Table */}
      <div className="brutal-block bg-white shadow-[6px_6px_0px_#000] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !siswaRes || siswaRes.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm font-bold uppercase">
              {search ? "Siswa tidak ditemukan" : "Belum ada data siswa"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12">No</th>
                  <th>NIS</th>
                  <th>Nama Lengkap</th>
                  <th>Kelas</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {siswaRes.data.map((siswa, idx) => (
                  <tr key={siswa.id}>
                    <td className="text-center">
                      {(page - 1) * LIMIT + idx + 1}
                    </td>
                    <td className="font-mono text-foreground text-xs font-bold bg-muted px-2 border-r-2 border-border">
                      {siswa.nis}
                    </td>
                    <td className="font-black text-primary">
                      {siswa.namaLengkap}
                    </td>
                    <td>
                      <span className="badge-brutal">
                        {siswa.kelas.namaKelas}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditSiswa(siswa); setModalOpen(true); }}
                          className="p-2 border-[3px] border-border bg-white text-foreground hover:bg-primary hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(siswa)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 brutal-block bg-white p-4 shadow-[4px_4px_0px_#000]">
          <p className="font-black uppercase text-sm">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border-[3px] border-border bg-white font-bold hover:bg-primary hover:text-white disabled:opacity-40 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 border-[3px] border-border bg-white font-bold hover:bg-primary hover:text-white disabled:opacity-40 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
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
