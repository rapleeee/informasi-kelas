"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

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
        toast.error(err.error ?? "Terjadi kesalahan.");
        return;
      }
      toast.success(`Siswa berhasil ${isEdit ? "diperbarui" : "ditambahkan"}!`);
      onSuccess();
    } catch {
      toast.error("Gagal terhubung ke server.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="brutal-card w-full max-w-md animate-slide-in shadow-[8px_8px_0px_#000] bg-white">
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-border bg-primary text-primary-foreground">
          <h2 className="text-base font-black uppercase tracking-wider">
            {isEdit ? "Edit Siswa" : "Tambah Siswa"}
          </h2>
          <button
            onClick={onClose}
            className="text-primary-foreground hover:text-secondary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-black uppercase tracking-wider text-foreground mb-2">
              NIS
            </label>
            <input
              type="text"
              className="brutal-input w-full"
              placeholder="contoh: 20260001"
              {...register("nis")}
            />
            {errors.nis && (
              <p className="mt-2 text-xs font-bold text-white bg-destructive inline-block px-2 py-1 shadow-[2px_2px_0px_#000]">{errors.nis.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-wider text-foreground mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              className="brutal-input w-full"
              placeholder="contoh: Budi Santoso"
              {...register("namaLengkap")}
            />
            {errors.namaLengkap && (
              <p className="mt-2 text-xs font-bold text-white bg-destructive inline-block px-2 py-1 shadow-[2px_2px_0px_#000]">
                {errors.namaLengkap.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-wider text-foreground mb-2">
              Kelas
            </label>
            <select
              className="brutal-input w-full p-2"
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
              <p className="mt-2 text-xs font-bold text-white bg-destructive inline-block px-2 py-1 shadow-[2px_2px_0px_#000]">
                {errors.kelasId.message}
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-[3px] border-border bg-white text-foreground font-black uppercase tracking-wider hover:bg-muted hover:translate-x-1 hover:translate-y-1 transition-transform shadow-[4px_4px_0px_#000] hover:shadow-none"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="brutal-btn flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {isEdit ? "SIMPAN" : "TAMBAH"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
