"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";

const kelasSchema = z.object({
  namaKelas: z.string().min(1, "Nama kelas tidak boleh kosong"),
  jurusan: z.string().min(1, "Jurusan tidak boleh kosong"),
});

type KelasForm = z.infer<typeof kelasSchema>;

interface Kelas {
  id: number;
  namaKelas: string;
  jurusan: string;
}

interface KelasFormModalProps {
  kelas?: Kelas;
  onClose: () => void;
  onSuccess: () => void;
}

export default function KelasFormModal({
  kelas,
  onClose,
  onSuccess,
}: KelasFormModalProps) {
  const isEdit = !!kelas;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<KelasForm>({
    resolver: zodResolver(kelasSchema),
    defaultValues: kelas
      ? { namaKelas: kelas.namaKelas, jurusan: kelas.jurusan }
      : undefined,
  });

  async function onSubmit(data: KelasForm) {
    setServerError(null);
    try {
      const url = isEdit ? `/api/kelas/${kelas!.id}` : "/api/kelas";
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? "Edit Kelas" : "Tambah Kelas"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nama Kelas
            </label>
            <input
              type="text"
              className="admin-input"
              placeholder="contoh: X-RPL-1"
              {...register("namaKelas")}
            />
            {errors.namaKelas && (
              <p className="mt-1 text-xs text-destructive">
                {errors.namaKelas.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Jurusan
            </label>
            <input
              type="text"
              className="admin-input"
              placeholder="contoh: Rekayasa Perangkat Lunak"
              {...register("jurusan")}
            />
            {errors.jurusan && (
              <p className="mt-1 text-xs text-destructive">
                {errors.jurusan.message}
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
              {isEdit ? "Simpan Perubahan" : "Tambah Kelas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
