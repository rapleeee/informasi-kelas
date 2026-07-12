"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "react-hot-toast";

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
        toast.error(err.error ?? "Terjadi kesalahan.");
        return;
      }
      toast.success("Pengaturan berhasil disimpan!");
      // Reset isDirty state by resetting with current data
      reset(data);
    } catch {
      toast.error("Gagal terhubung ke server.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Tanggal Pengumuman */}
      <div>
        <label className="block text-sm font-black uppercase text-foreground mb-2">
          Tanggal & Waktu Pengumuman
        </label>
        <input
          type="datetime-local"
          className="brutal-input w-full"
          {...register("tanggalPengumuman")}
        />
        {errors.tanggalPengumuman && (
          <p className="mt-2 text-xs font-bold text-white bg-destructive inline-block px-2 py-1 shadow-[2px_2px_0px_#000]">
            {errors.tanggalPengumuman.message}
          </p>
        )}
        <p className="mt-2 text-xs font-bold text-muted-foreground uppercase">
          Gunakan waktu WIB (UTC+7). Website akan otomatis tampil live setelah
          waktu ini.
        </p>
      </div>

      {/* Jadwal Datang */}
      <div>
        <label className="block text-sm font-black uppercase text-foreground mb-2">
          Jadwal Datang ke Sekolah
        </label>
        <input
          type="text"
          className="brutal-input w-full"
          placeholder="contoh: Rabu, 15 Juli 2026 pukul 07.00 WIB"
          {...register("jadwalDatang")}
        />
        {errors.jadwalDatang && (
          <p className="mt-2 text-xs font-bold text-white bg-destructive inline-block px-2 py-1 shadow-[2px_2px_0px_#000]">
            {errors.jadwalDatang.message}
          </p>
        )}
        <p className="mt-2 text-xs font-bold text-muted-foreground uppercase">
          Jadwal ini akan tampil di kartu informasi kelas siswa.
        </p>
      </div>

      {/* Judul Pengumuman */}
      <div>
        <label className="block text-sm font-black uppercase text-foreground mb-2">
          Judul Pengumuman
        </label>
        <input
          type="text"
          className="brutal-input w-full"
          placeholder="contoh: Pengumuman Resmi Pembagian Kelas TP 2026/2027"
          {...register("judulPengumuman")}
        />
        {errors.judulPengumuman && (
          <p className="mt-2 text-xs font-bold text-white bg-destructive inline-block px-2 py-1 shadow-[2px_2px_0px_#000]">
            {errors.judulPengumuman.message}
          </p>
        )}
      </div>

      {/* Deskripsi */}
      <div>
        <label className="block text-sm font-black uppercase text-foreground mb-2">
          Deskripsi Singkat
        </label>
        <textarea
          rows={3}
          className="brutal-input w-full resize-none"
          placeholder="Deskripsi yang tampil di bawah judul halaman publik..."
          {...register("deskripsiSingkat")}
        />
        {errors.deskripsiSingkat && (
          <p className="mt-2 text-xs font-bold text-white bg-destructive inline-block px-2 py-1 shadow-[2px_2px_0px_#000]">
            {errors.deskripsiSingkat.message}
          </p>
        )}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="brutal-btn px-6 py-3 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          SIMPAN PERUBAHAN
        </button>
      </div>
    </form>
  );
}
