"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, CheckCircle2 } from "lucide-react";

const pengaturanSchema = z.object({
  tanggalPengumuman: z.string().min(1, "Tanggal pengumuman wajib diisi"),
  jadwalDatang: z.string().min(1, "Jadwal datang wajib diisi"),
  judulPengumuman: z.string().min(1, "Judul pengumuman wajib diisi"),
  deskripsiSingkat: z.string().min(1, "Deskripsi wajib diisi"),
});

type PengaturanForm = z.infer<typeof pengaturanSchema>;

function toLocalDatetimeInput(isoString: string) {
  // Convert ISO string ke format yyyy-MM-ddTHH:mm untuk datetime-local input (WIB = UTC+7)
  const d = new Date(isoString);
  const offset = 7 * 60; // WIB = UTC+7
  const local = new Date(d.getTime() + offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function fromLocalDatetimeInput(value: string) {
  // Anggap input adalah WIB, convert ke UTC ISO string
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return value;
  // Buat Date dalam UTC dengan offset WIB dikurangi
  const d = new Date(`${datePart}T${timePart}:00.000+07:00`);
  return d.toISOString();
}

export default function PengaturanForm() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PengaturanForm>({
    resolver: zodResolver(pengaturanSchema),
  });

  useEffect(() => {
    fetch("/api/pengaturan")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          reset({
            tanggalPengumuman: toLocalDatetimeInput(data.tanggalPengumuman),
            jadwalDatang: data.jadwalDatang,
            judulPengumuman: data.judulPengumuman,
            deskripsiSingkat: data.deskripsiSingkat,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reset]);

  async function onSubmit(data: PengaturanForm) {
    setServerError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/pengaturan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tanggalPengumuman: fromLocalDatetimeInput(data.tanggalPengumuman),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setServerError(err.error ?? "Terjadi kesalahan.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setServerError("Gagal terhubung ke server.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      {/* Tanggal Pengumuman */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Tanggal & Waktu Pengumuman
        </label>
        <input
          type="datetime-local"
          className="admin-input"
          {...register("tanggalPengumuman")}
        />
        {errors.tanggalPengumuman && (
          <p className="mt-1 text-xs text-destructive">
            {errors.tanggalPengumuman.message}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Gunakan waktu WIB (UTC+7). Website akan otomatis tampil live setelah
          waktu ini.
        </p>
      </div>

      {/* Jadwal Datang */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Jadwal Datang ke Sekolah
        </label>
        <input
          type="text"
          className="admin-input"
          placeholder="contoh: Rabu, 15 Juli 2026 pukul 07.00 WIB"
          {...register("jadwalDatang")}
        />
        {errors.jadwalDatang && (
          <p className="mt-1 text-xs text-destructive">
            {errors.jadwalDatang.message}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Jadwal ini akan tampil di kartu informasi kelas siswa.
        </p>
      </div>

      {/* Judul Pengumuman */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Judul Pengumuman
        </label>
        <input
          type="text"
          className="admin-input"
          placeholder="contoh: Pengumuman Resmi Pembagian Kelas TP 2026/2027"
          {...register("judulPengumuman")}
        />
        {errors.judulPengumuman && (
          <p className="mt-1 text-xs text-destructive">
            {errors.judulPengumuman.message}
          </p>
        )}
      </div>

      {/* Deskripsi */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Deskripsi Singkat
        </label>
        <textarea
          rows={3}
          className="admin-input resize-none"
          placeholder="Deskripsi yang tampil di bawah judul halaman publik..."
          {...register("deskripsiSingkat")}
        />
        {errors.deskripsiSingkat && (
          <p className="mt-1 text-xs text-destructive">
            {errors.deskripsiSingkat.message}
          </p>
        )}
      </div>

      {serverError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-2.5 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-lg px-4 py-2.5 text-sm text-success">
          <CheckCircle2 className="w-4 h-4" />
          Pengaturan berhasil disimpan!
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="flex items-center gap-2 bg-gradient-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Simpan Perubahan
        </button>
      </div>
    </form>
  );
}
