import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { NextRequest } from "next/server";

// GET single siswa
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/siswa/[id]">
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const siswa = await prisma.siswa.findUnique({
    where: { id: parseInt(id) },
    include: { kelas: true },
  });

  if (!siswa) {
    return Response.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
  }

  return Response.json(siswa);
}

const updateSchema = z.object({
  nis: z.string().min(1).optional(),
  namaLengkap: z.string().min(1).optional(),
  kelasId: z.number().int().positive().optional(),
});

// PUT update siswa
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/siswa/[id]">
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Cek NIS conflict jika NIS diubah
  if (parsed.data.nis) {
    const conflict = await prisma.siswa.findFirst({
      where: {
        nis: parsed.data.nis,
        NOT: { id: parseInt(id) },
      },
    });
    if (conflict) {
      return Response.json({ error: "NIS sudah dipakai siswa lain" }, { status: 409 });
    }
  }

  const siswa = await prisma.siswa.update({
    where: { id: parseInt(id) },
    data: parsed.data,
    include: { kelas: true },
  });

  return Response.json(siswa);
}

// DELETE siswa
export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/siswa/[id]">
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  await prisma.siswa.delete({ where: { id: parseInt(id) } });

  return Response.json({ success: true });
}
