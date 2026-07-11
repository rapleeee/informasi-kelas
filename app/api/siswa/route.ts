import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET all siswa (admin only)
export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { nis: { contains: search, mode: "insensitive" as const } },
          { namaLengkap: { contains: search, mode: "insensitive" as const } },
          { kelas: { namaKelas: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [siswa, total] = await Promise.all([
    prisma.siswa.findMany({
      where,
      include: { kelas: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.siswa.count({ where }),
  ]);

  return Response.json({ data: siswa, total, page, limit });
}

const createSchema = z.object({
  nis: z.string().min(1, "NIS tidak boleh kosong"),
  namaLengkap: z.string().min(1, "Nama tidak boleh kosong"),
  kelasId: z.number().int().positive(),
});

// POST create siswa (admin only)
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Cek NIS sudah ada
  const existing = await prisma.siswa.findUnique({
    where: { nis: parsed.data.nis },
  });
  if (existing) {
    return Response.json({ error: "NIS sudah terdaftar" }, { status: 409 });
  }

  const siswa = await prisma.siswa.create({
    data: parsed.data,
    include: { kelas: true },
  });

  return Response.json(siswa, { status: 201 });
}
