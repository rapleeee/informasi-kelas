import { prisma } from "@/lib/prisma";
import { Users, School, Radio, Calendar } from "lucide-react";

async function getStats() {
  const [totalSiswa, totalKelas, pengaturan] = await Promise.all([
    prisma.siswa.count(),
    prisma.kelas.count(),
    prisma.pengaturan.findFirst({ where: { id: 1 } }),
  ]);
  return { totalSiswa, totalKelas, pengaturan };
}

export default async function DashboardPage() {
  const { totalSiswa, totalKelas, pengaturan } = await getStats();

  const isLive = pengaturan
    ? new Date() >= new Date(pengaturan.tanggalPengumuman)
    : false;

  const tglPengumuman = pengaturan
    ? new Date(pengaturan.tanggalPengumuman).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    : "-";

  const statCards = [
    {
      label: "Total Siswa",
      value: totalSiswa.toLocaleString("id-ID"),
      icon: Users,
      color: "text-foreground",
      bg: "bg-white",
    },
    {
      label: "Total Kelas",
      value: totalKelas.toLocaleString("id-ID"),
      icon: School,
      color: "text-foreground",
      bg: "bg-white",
    },
    {
      label: "Status Pengumuman",
      value: isLive ? "LIVE" : "Countdown",
      icon: Radio,
      color: isLive ? "text-white" : "text-foreground",
      bg: isLive ? "bg-success" : "bg-accent",
    },
    {
      label: "Jadwal Datang",
      value: pengaturan?.jadwalDatang ?? "-",
      icon: Calendar,
      color: "text-foreground",
      bg: "bg-white",
      small: true,
    },
  ];

  return (
    <div>
      <div className="mb-8 brutal-block bg-white p-6 shadow-[4px_4px_0px_#000]">
        <h1 className="heading-brutal text-3xl">Dashboard</h1>
        <p className="text-foreground font-bold mt-2">
          Selamat datang di panel admin SMK Informatika Pesat.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map(({ label, value, icon: Icon, color, bg, small }) => (
          <div
            key={label}
            className={`brutal-block p-5 shadow-[4px_4px_0px_#000] ${bg}`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className={`text-xs font-black uppercase tracking-wider ${color}`}>
                {label}
              </p>
              <div className={`w-8 h-8 flex items-center justify-center border-2 border-border bg-white`}>
                <Icon className={`w-4 h-4 text-foreground`} />
              </div>
            </div>
            <p
              className={`font-black ${color} ${small ? "text-lg leading-snug" : "text-4xl"}`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Info Pengumuman */}
      <div className="brutal-card p-6 shadow-[6px_6px_0px_#000]">
        <h2 className="text-lg font-black text-primary mb-6 uppercase tracking-wider border-b-4 border-border pb-2 inline-block">
          Detail Pengumuman
        </h2>
        <dl className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <dt className="text-xs font-bold text-muted-foreground uppercase tracking-widest sm:w-48 flex-shrink-0">
              Judul Pengumuman
            </dt>
            <dd className="text-sm font-black text-foreground bg-muted px-2 py-1 border-2 border-border">
              {pengaturan?.judulPengumuman ?? "-"}
            </dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <dt className="text-xs font-bold text-muted-foreground uppercase tracking-widest sm:w-48 flex-shrink-0">
              Tanggal Pengumuman
            </dt>
            <dd className="text-sm font-bold text-foreground">
              {tglPengumuman}
            </dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <dt className="text-xs font-bold text-muted-foreground uppercase tracking-widest sm:w-48 flex-shrink-0">
              Jadwal Datang
            </dt>
            <dd className="text-sm font-bold text-foreground">
              {pengaturan?.jadwalDatang ?? "-"}
            </dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <dt className="text-xs font-bold text-muted-foreground uppercase tracking-widest sm:w-48 flex-shrink-0 mt-1">
              Deskripsi
            </dt>
            <dd className="text-sm font-semibold text-foreground leading-relaxed max-w-2xl bg-white border-2 border-border p-3">
              {pengaturan?.deskripsiSingkat ?? "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
