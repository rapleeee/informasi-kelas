import * as XLSX from "xlsx";

export interface SiswaImportRow {
  nis: string;
  namaLengkap: string;
  kodeKelas: string;
}

export interface SiswaImportResult extends SiswaImportRow {
  rowIndex: number;
  valid: boolean;
  error?: string;
}

/**
 * Generate template Excel untuk import siswa
 */
export function generateTemplateSiswa(): Buffer {
  const wb = XLSX.utils.book_new();
  const header = [["NIS", "Nama Lengkap", "Kode Kelas"]];
  const contoh = [
    ["20260001", "Budi Santoso", "X-RPL-1"],
    ["20260002", "Siti Rahayu", "X-TKJ-1"],
  ];
  const ws = XLSX.utils.aoa_to_sheet([...header, ...contoh]);

  // Style lebar kolom
  ws["!cols"] = [{ wch: 15 }, { wch: 30 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

/**
 * Parse file Excel yang diupload menjadi array baris
 */
export function parseExcelSiswa(buffer: Buffer): SiswaImportRow[] {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    header: ["nis", "namaLengkap", "kodeKelas"],
    range: 1, // skip header row
    defval: "",
  });

  return rows.map((row) => ({
    nis: String(row.nis ?? "").trim(),
    namaLengkap: String(row.namaLengkap ?? "").trim(),
    kodeKelas: String(row.kodeKelas ?? "").trim(),
  }));
}

/**
 * Validasi baris import terhadap kelas yang tersedia dan NIS yang sudah ada
 */
export function validateImportRows(
  rows: SiswaImportRow[],
  availableKelas: string[],
  existingNis: string[]
): SiswaImportResult[] {
  return rows.map((row, idx) => {
    const rowIndex = idx + 2; // +2 karena header di row 1

    if (!row.nis) {
      return { ...row, rowIndex, valid: false, error: "NIS tidak boleh kosong" };
    }
    if (!row.namaLengkap) {
      return { ...row, rowIndex, valid: false, error: "Nama Lengkap tidak boleh kosong" };
    }
    if (!row.kodeKelas) {
      return { ...row, rowIndex, valid: false, error: "Kode Kelas tidak boleh kosong" };
    }
    if (existingNis.includes(row.nis)) {
      return { ...row, rowIndex, valid: false, error: `NIS ${row.nis} sudah terdaftar` };
    }
    if (!availableKelas.includes(row.kodeKelas)) {
      return {
        ...row,
        rowIndex,
        valid: false,
        error: `Kelas "${row.kodeKelas}" tidak ditemukan di master kelas`,
      };
    }

    return { ...row, rowIndex, valid: true };
  });
}
