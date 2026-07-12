import PengaturanForm from "@/components/admin/pengaturan/PengaturanForm";

export default function PengaturanPage() {
  return (
    <div>
      <div className="mb-8 brutal-block bg-white p-6 shadow-[4px_4px_0px_#000]">
        <h1 className="heading-brutal text-3xl">Pengaturan</h1>
        <p className="text-foreground font-bold mt-2">
          Konfigurasi jadwal pengumuman dan informasi yang tampil di halaman publik.
        </p>
      </div>

      <div className="brutal-card p-6 shadow-[6px_6px_0px_#000]">
        <PengaturanForm />
      </div>
    </div>
  );
}
