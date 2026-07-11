import PengaturanForm from "@/components/admin/pengaturan/PengaturanForm";

export default function PengaturanPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Konfigurasi jadwal pengumuman dan informasi yang tampil di halaman publik.
        </p>
      </div>

      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <PengaturanForm />
      </div>
    </div>
  );
}
