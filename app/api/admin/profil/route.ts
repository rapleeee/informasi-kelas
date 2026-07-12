import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const profilSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  passwordLama: z.string().optional(),
  passwordBaru: z.string().optional(),
}).superRefine((val, ctx) => {
  if (val.passwordBaru && !val.passwordLama) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Masukkan password lama untuk mengubah password",
      path: ["passwordLama"],
    });
  }
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.admin.findUnique({
    where: { username: session.user.name },
    select: { username: true },
  });

  if (!admin) {
    return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(admin);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = profilSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { username, passwordLama, passwordBaru } = parsed.data;

    const currentAdmin = await prisma.admin.findUnique({
      where: { username: session.user.name },
    });

    if (!currentAdmin) {
      return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
    }

    if (username !== currentAdmin.username) {
      const existing = await prisma.admin.findUnique({
        where: { username },
      });
      if (existing) {
        return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
      }
    }

    let updatedPassword = currentAdmin.password;

    if (passwordBaru && passwordLama) {
      const isMatch = await bcrypt.compare(passwordLama, currentAdmin.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Password lama salah" }, { status: 400 });
      }
      updatedPassword = await bcrypt.hash(passwordBaru, 10);
    }

    await prisma.admin.update({
      where: { id: currentAdmin.id },
      data: {
        username,
        password: updatedPassword,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profil update error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
