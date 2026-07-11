"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";

const siswaSchema = z.object({
  nis: z.string().min(1, "NIS tidak boleh kosong"),
  namaLengkap: z.string().min(1, "Nama tidak boleh kosong"),
  kelasId: z.number({ error: "Pilih kelas" }).int().positive("Pilih kelas"),
});

type SiswaForm = z.infer<typeof siswaSchema>;

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

interface SiswaFormModalProps {
  siswa?: Siswa;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SiswaFormModal({
  siswa,
  onClose,
  onSuccess,
}: SiswaFormModalProps) {
  const isEdit = !!siswa;
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SiswaForm>({
    resolver: zodResolver(siswaSchema),
    defaultValues: siswa
      ? { nis: siswa.nis, namaLengkap: siswa.namaLengkap, kelasId: siswa.kelasId }
      : undefined,
  });

  useEffect(() => {
    fetch("/api/kelas")
      .then((r) => r.json())
      .then(setKelasList)
      .catch(() => {});
  }, []);

  async function onSubmit(data: SiswaForm) {
    setServerError(null);
    try {
      const url = isEdit ? `/api/siswa/${siswa!.id}` : "/api/siswa";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        setServerError(err.error ?? "Terjadi kesalahan.");
        return;
      }
      onSuccess();
    } catch {
      setServerError("Gagal terhubung ke server.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-strong rounded-2xl w-full max-w-md border border-white/15 animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? "Edit Siswa" : "Tambah Siswa"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              NIS
            </label>
            <input
              type="text"
              className="admin-input"
              placeholder="contoh: 20260001"
              {...register("nis")}
            />
            {errors.nis && (
              <p className="mt-1 text-xs text-destructive">{errors.nis.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              className="admin-input"
              placeholder="contoh: Budi Santoso"
              {...register("namaLengkap")}
            />
            {errors.namaLengkap && (
              <p className="mt-1 text-xs text-destructive">
                {errors.namaLengkap.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Kelas
            </label>
            <select
              className="admin-input"
              {...register("kelasId", { valueAsNumber: true })}
            >
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKelas} — {k.jurusan}
                </option>
              ))}
            </select>
            {errors.kelasId && (
              <p className="mt-1 text-xs text-destructive">
                {errors.kelasId.message}
              </p>
            )}
          </div>

          {serverError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-2.5 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-primary text-white text-sm font-semibold py-2.5 px-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Tambah Siswa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
