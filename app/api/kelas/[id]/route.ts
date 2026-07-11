import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { NextRequest } from "next/server";

const updateSchema = z.object({
  namaKelas: z.string().min(1).optional(),
  jurusan: z.string().min(1).optional(),
});

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/kelas/[id]">
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

  const kelas = await prisma.kelas.update({
    where: { id: parseInt(id) },
    data: parsed.data,
  });

  return Response.json(kelas);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/kelas/[id]">
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  // Cek apakah masih ada siswa
  const siswaDiKelas = await prisma.siswa.count({
    where: { kelasId: parseInt(id) },
  });

  if (siswaDiKelas > 0) {
    return Response.json(
      { error: `Kelas masih memiliki ${siswaDiKelas} siswa. Pindahkan siswa terlebih dahulu.` },
      { status: 409 }
    );
  }

  await prisma.kelas.delete({ where: { id: parseInt(id) } });
  return Response.json({ success: true });
}
