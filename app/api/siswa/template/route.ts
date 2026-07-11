import { generateTemplateSiswa } from "@/lib/excel";

export async function GET() {
  const buffer = generateTemplateSiswa();

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="template_import_siswa.xlsx"',
    },
  });
}
