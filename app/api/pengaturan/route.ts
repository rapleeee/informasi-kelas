import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const pengaturan = await prisma.pengaturan.findFirst({ where: { id: 1 } });
  return Response.json(pengaturan);
}

const updateSchema = z.object({
  tanggalPengumuman: z.string().datetime(),
  jadwalDatang: z.string().min(1),
  judulPengumuman: z.string().min(1),
  deskripsiSingkat: z.string().min(1),
});

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const pengaturan = await prisma.pengaturan.upsert({
    where: { id: 1 },
    update: {
      ...parsed.data,
      tanggalPengumuman: new Date(parsed.data.tanggalPengumuman),
    },
    create: {
      id: 1,
      ...parsed.data,
      tanggalPengumuman: new Date(parsed.data.tanggalPengumuman),
    },
  });

  return Response.json(pengaturan);
}
