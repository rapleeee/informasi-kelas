"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

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
        toast.error(err.error ?? "Terjadi kesalahan.");
        return;
      }
      toast.success(`Kelas berhasil ${isEdit ? "diperbarui" : "ditambahkan"}!`);
      onSuccess();
    } catch {
      toast.error("Gagal terhubung ke server.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="brutal-card w-full max-w-md animate-slide-in shadow-[8px_8px_0px_#000] bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-border bg-primary text-primary-foreground">
          <h2 className="text-base font-black uppercase tracking-wider">
            {isEdit ? "Edit Kelas" : "Tambah Kelas"}
          </h2>
          <button
            onClick={onClose}
            className="text-primary-foreground hover:text-secondary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-black uppercase tracking-wider text-foreground mb-2">
              Nama Kelas
            </label>
            <input
              type="text"
              className="brutal-input w-full"
              placeholder="contoh: X-RPL-1"
              {...register("namaKelas")}
            />
            {errors.namaKelas && (
              <p className="mt-2 text-xs font-bold text-white bg-destructive inline-block px-2 py-1 shadow-[2px_2px_0px_#000]">
                {errors.namaKelas.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-wider text-foreground mb-2">
              Jurusan
            </label>
            <input
              type="text"
              className="brutal-input w-full"
              placeholder="contoh: Rekayasa Perangkat Lunak"
              {...register("jurusan")}
            />
            {errors.jurusan && (
              <p className="mt-2 text-xs font-bold text-white bg-destructive inline-block px-2 py-1 shadow-[2px_2px_0px_#000]">
                {errors.jurusan.message}
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
