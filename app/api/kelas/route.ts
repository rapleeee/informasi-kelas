import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET all kelas (publik - dibutuhkan untuk dropdown form)
export async function GET() {
  const kelas = await prisma.kelas.findMany({
    include: {
      _count: { select: { siswa: true } },
    },
    orderBy: { namaKelas: "asc" },
  });

  return Response.json(kelas);
}

const createSchema = z.object({
  namaKelas: z.string().min(1, "Nama kelas tidak boleh kosong"),
  jurusan: z.string().min(1, "Jurusan tidak boleh kosong"),
});

// POST create kelas (admin only)
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

  const existing = await prisma.kelas.findUnique({
    where: { namaKelas: parsed.data.namaKelas },
  });
  if (existing) {
    return Response.json({ error: "Nama kelas sudah ada" }, { status: 409 });
  }

  const kelas = await prisma.kelas.create({ data: parsed.data });
  return Response.json(kelas, { status: 201 });
}
