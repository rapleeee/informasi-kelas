"use client";

import { useState, useRef } from "react";
import {
  X,
  Upload,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";

interface PreviewRow {
  nis: string;
  namaLengkap: string;
  kodeKelas: string;
  valid: boolean;
  errors: string[];
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
}

interface ImportExcelModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportExcelModal({
  onClose,
  onSuccess,
}: ImportExcelModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const validCount = preview?.filter((r) => r.valid).length ?? 0;
  const invalidCount = preview ? preview.length - validCount : 0;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(null);
    setParseError(null);
    setImportResult(null);

    setParsing(true);
    try {
      const fd = new FormData();
      fd.append("file", selected);
      const res = await fetch("/api/siswa/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setParseError(data.error ?? "Gagal memproses file.");
        return;
      }
      setPreview(data.preview);
    } catch {
      setParseError("Gagal menghubungi server.");
    } finally {
      setParsing(false);
    }
  }

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("commit", "true");
      const res = await fetch("/api/siswa/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setParseError(data.error ?? "Gagal mengimpor data.");
        return;
      }
      setImportResult(data);
    } catch {
      setParseError("Gagal menghubungi server.");
    } finally {
      setImporting(false);
    }
  }

  function handleDownloadTemplate() {
    window.open("/api/siswa/template", "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-strong rounded-2xl w-full max-w-3xl border border-white/15 animate-fade-in-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Import Excel
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1">
          {importResult ? (
            /* ─── Hasil Import ─── */
            <div className="text-center py-8">
              <CheckCircle2 className="w-14 h-14 text-success mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">
                Import Berhasil!
              </h3>
              <p className="text-muted-foreground text-sm mb-1">
                {importResult.imported} siswa berhasil diimpor.
              </p>
              {importResult.skipped > 0 && (
                <p className="text-muted-foreground text-sm">
                  {importResult.skipped} baris dilewati (tidak valid).
                </p>
              )}
              <button
                onClick={onSuccess}
                className="mt-6 bg-gradient-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                Selesai
              </button>
            </div>
          ) : (
            <>
              {/* Tombol Download Template */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Upload file Excel dengan format yang benar. Kolom:{" "}
                  <span className="font-medium text-foreground">
                    NIS, Nama Lengkap, Kode Kelas
                  </span>
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline flex-shrink-0 ml-4"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Template
                </button>
              </div>

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-5 ${
                  file
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-white/3"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {parsing ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm">Memproses file...</p>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileSpreadsheet className="w-8 h-8 text-primary" />
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Klik untuk ganti file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8 opacity-40" />
                    <p className="text-sm">
                      Klik atau drag file Excel (.xlsx/.xls)
                    </p>
                  </div>
                )}
              </div>

              {/* Parse Error */}
              {parseError && (
                <div className="mb-4 bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-2.5 text-sm text-destructive">
                  {parseError}
                </div>
              )}

              {/* Preview Table */}
              {preview && preview.length > 0 && (
                <>
                  {/* Ringkasan */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-success">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {validCount} baris valid
                    </div>
                    {invalidCount > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-destructive">
                        <XCircle className="w-3.5 h-3.5" />
                        {invalidCount} baris error
                      </div>
                    )}
                  </div>

                  <div className="overflow-auto max-h-56 rounded-xl border border-border">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-card">
                        <tr className="border-b border-border">
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">
                            Status
                          </th>
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">
                            NIS
                          </th>
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">
                            Nama Lengkap
                          </th>
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">
                            Kode Kelas
                          </th>
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">
                            Keterangan
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, idx) => (
                          <tr
                            key={idx}
                            className={`border-b border-border/50 last:border-0 ${
                              row.valid ? "bg-success/5" : "bg-destructive/5"
                            }`}
                          >
                            <td className="px-3 py-2">
                              {row.valid ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-destructive" />
                              )}
                            </td>
                            <td className="px-3 py-2 font-medium text-foreground">
                              {row.nis || "-"}
                            </td>
                            <td className="px-3 py-2 text-foreground">
                              {row.namaLengkap || "-"}
                            </td>
                            <td className="px-3 py-2 text-foreground">
                              {row.kodeKelas || "-"}
                            </td>
                            <td className="px-3 py-2 text-destructive">
                              {row.errors.join(", ") || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!importResult && preview && (
          <div className="px-6 py-4 border-t border-border flex-shrink-0 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleImport}
              disabled={importing || validCount === 0}
              className="flex items-center gap-2 bg-gradient-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing && <Loader2 className="w-4 h-4 animate-spin" />}
              Simpan {validCount} Data Valid
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
