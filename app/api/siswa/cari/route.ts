import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nis = searchParams.get("nis");

  if (!nis) {
    return Response.json({ error: "Parameter NIS dibutuhkan" }, { status: 400 });
  }

  const siswa = await prisma.siswa.findUnique({
    where: { nis: nis.trim() },
    include: { kelas: true },
  });

  if (!siswa) {
    return Response.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
  }

  const pengaturan = await prisma.pengaturan.findFirst({ where: { id: 1 } });

  return Response.json({
    id: siswa.id,
    nis: siswa.nis,
    namaLengkap: siswa.namaLengkap,
    kelas: siswa.kelas.namaKelas,
    jurusan: siswa.kelas.jurusan,
    jadwalDatang: pengaturan?.jadwalDatang ?? "Rabu, 15 Juli 2026 pukul 07.00 WIB",
  });
}
