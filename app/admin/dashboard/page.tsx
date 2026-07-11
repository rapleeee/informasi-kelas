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
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
    {
      label: "Total Kelas",
      value: totalKelas.toLocaleString("id-ID"),
      icon: School,
      color: "text-secondary",
      bg: "bg-secondary/10 border-secondary/20",
    },
    {
      label: "Status Pengumuman",
      value: isLive ? "LIVE" : "Countdown",
      icon: Radio,
      color: isLive ? "text-success" : "text-accent",
      bg: isLive
        ? "bg-success/10 border-success/20"
        : "bg-accent/10 border-accent/20",
    },
    {
      label: "Jadwal Datang",
      value: pengaturan?.jadwalDatang ?? "-",
      icon: Calendar,
      color: "text-muted-foreground",
      bg: "bg-white/5 border-white/10",
      small: true,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Selamat datang di panel admin SMK Informatika Pesat.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg, small }) => (
          <div
            key={label}
            className={`glass-strong rounded-2xl p-5 border ${bg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {label}
              </p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p
              className={`font-bold ${color} ${small ? "text-sm leading-snug" : "text-2xl"}`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Info Pengumuman */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
          Detail Pengumuman
        </h2>
        <dl className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <dt className="text-xs text-muted-foreground w-44 flex-shrink-0">
              Judul Pengumuman
            </dt>
            <dd className="text-sm text-foreground font-medium">
              {pengaturan?.judulPengumuman ?? "-"}
            </dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <dt className="text-xs text-muted-foreground w-44 flex-shrink-0">
              Tanggal Pengumuman
            </dt>
            <dd className="text-sm text-foreground">{tglPengumuman}</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <dt className="text-xs text-muted-foreground w-44 flex-shrink-0">
              Jadwal Datang
            </dt>
            <dd className="text-sm text-foreground">
              {pengaturan?.jadwalDatang ?? "-"}
            </dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start gap-1">
            <dt className="text-xs text-muted-foreground w-44 flex-shrink-0">
              Deskripsi
            </dt>
            <dd className="text-sm text-muted-foreground leading-relaxed">
              {pengaturan?.deskripsiSingkat ?? "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
