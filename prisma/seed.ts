import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ---- Admin ----
  const adminPassword = await bcrypt.hash("Admin@1234", 12);
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@smkpesat.sch.id",
      password: adminPassword,
    },
  });
  console.log("✅ Admin:", admin.username);

  // ---- Master Kelas ----
  const kelasList = [
    { namaKelas: "X-RPL-1", jurusan: "Rekayasa Perangkat Lunak" },
    { namaKelas: "X-RPL-2", jurusan: "Rekayasa Perangkat Lunak" },
    { namaKelas: "X-RPL-3", jurusan: "Rekayasa Perangkat Lunak" },
    { namaKelas: "X-TKJ-1", jurusan: "Teknik Komputer dan Jaringan" },
    { namaKelas: "X-TKJ-2", jurusan: "Teknik Komputer dan Jaringan" },
    { namaKelas: "X-MM-1", jurusan: "Multimedia" },
    { namaKelas: "X-MM-2", jurusan: "Multimedia" },
    { namaKelas: "X-AK-1", jurusan: "Akuntansi dan Keuangan Lembaga" },
  ];

  for (const kelas of kelasList) {
    await prisma.kelas.upsert({
      where: { namaKelas: kelas.namaKelas },
      update: {},
      create: kelas,
    });
  }
  console.log(`✅ Master Kelas: ${kelasList.length} kelas`);

  // ---- Pengaturan ----
  await prisma.pengaturan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      tanggalPengumuman: new Date("2026-07-13T00:00:00.000Z"), // 13 Juli 2026 07:00 WIB = 00:00 UTC
      jadwalDatang: "Rabu, 15 Juli 2026 pukul 07.00 WIB",
      judulPengumuman: "Pengumuman Resmi Pembagian Kelas TP 2026/2027",
      deskripsiSingkat:
        "Selamat datang di keluarga besar SMK Informatika Pesat! Pengumuman pembagian kelas Tahun Pelajaran 2026/2027 kini telah tersedia. Masukkan NIS kamu untuk mengetahui informasi kelasmu.",
    },
  });
  console.log("✅ Pengaturan default");

  console.log("🎉 Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
