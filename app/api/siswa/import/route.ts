import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseExcelSiswa, validateImportRows } from "@/lib/excel";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Parse Excel
  const rows = parseExcelSiswa(buffer);

  if (rows.length === 0) {
    return Response.json({ error: "File Excel kosong atau tidak valid" }, { status: 400 });
  }

  // Ambil semua kelas dan NIS yang sudah ada
  const [allKelas, allSiswa] = await Promise.all([
    prisma.kelas.findMany({ select: { namaKelas: true } }),
    prisma.siswa.findMany({ select: { nis: true } }),
  ]);

  const availableKelas = allKelas.map((k) => k.namaKelas);
  const existingNis = allSiswa.map((s) => s.nis);

  // Validasi baris
  const validated = validateImportRows(rows, availableKelas, existingNis);

  // Jika hanya preview (tidak ada flag commit), kembalikan hasil validasi
  const isCommit = formData.get("commit") === "true";

  if (!isCommit) {
    return Response.json({ preview: validated });
  }

  // Import hanya baris yang valid
  const validRows = validated.filter((r) => r.valid);

  if (validRows.length === 0) {
    return Response.json({ error: "Tidak ada baris yang valid untuk diimpor" }, { status: 400 });
  }

  // Buat map kelas name → id
  const kelasMap = new Map<string, number>();
  const kelasAll = await prisma.kelas.findMany({ select: { id: true, namaKelas: true } });
  kelasAll.forEach((k) => kelasMap.set(k.namaKelas, k.id));

  // Batch insert
  await prisma.siswa.createMany({
    data: validRows.map((row) => ({
      nis: row.nis,
      namaLengkap: row.namaLengkap,
      kelasId: kelasMap.get(row.kodeKelas)!,
    })),
    skipDuplicates: true,
  });

  return Response.json({
    success: true,
    imported: validRows.length,
    skipped: validated.length - validRows.length,
  });
}
