"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
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
  error?: string;
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
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const validCount = preview?.filter((r) => r.valid).length ?? 0;
  const invalidCount = preview ? preview.length - validCount : 0;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(null);
    setImportResult(null);

    setParsing(true);
    try {
      const fd = new FormData();
      fd.append("file", selected);
      const res = await fetch("/api/siswa/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal memproses file.");
        return;
      }
      setPreview(data.preview);
    } catch {
      toast.error("Gagal menghubungi server.");
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
        toast.error(data.error ?? "Gagal mengimpor data.");
        return;
      }
      setImportResult(data);
      toast.success("Import berhasil!");
    } catch {
      toast.error("Gagal menghubungi server.");
    } finally {
      setImporting(false);
    }
  }

  function handleDownloadTemplate() {
    window.open("/api/siswa/template", "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="brutal-card w-full max-w-3xl animate-slide-in flex flex-col max-h-[90vh] shadow-[8px_8px_0px_#000] bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-border bg-primary text-primary-foreground flex-shrink-0">
          <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6" />
            Import Excel
          </h2>
          <button
            onClick={onClose}
            className="text-primary-foreground hover:text-secondary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 bg-background">
          {importResult ? (
            /* ─── Hasil Import ─── */
            <div className="text-center py-8 brutal-block bg-white p-8">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4 drop-shadow-[2px_2px_0px_#000]" />
              <h3 className="heading-brutal text-2xl mb-2">
                IMPORT BERHASIL!
              </h3>
              <p className="font-bold text-foreground mb-1 uppercase tracking-wider">
                {importResult.imported} siswa berhasil diimpor.
              </p>
              {importResult.skipped > 0 && (
                <p className="font-bold text-destructive uppercase tracking-wider">
                  {importResult.skipped} baris dilewati (tidak valid).
                </p>
              )}
              <button
                onClick={onSuccess}
                className="brutal-btn mt-6 px-8 py-3 text-sm"
              >
                SELESAI
              </button>
            </div>
          ) : (
            <>
              {/* Tombol Download Template */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 brutal-block bg-white p-4">
                <p className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Upload file Excel dengan format yang benar.
                  <br />
                  Kolom: NIS, Nama Lengkap, Kode Kelas
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="brutal-btn-secondary px-4 py-2 text-xs flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  TEMPLATE
                </button>
              </div>

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-[3px] border-dashed rounded-none p-10 text-center cursor-pointer transition-colors mb-6 brutal-block ${
                  file
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
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
                  <div className="flex flex-col items-center gap-3 font-bold uppercase text-primary">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p>MEMPROSES FILE...</p>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-3 font-bold uppercase">
                    <FileSpreadsheet className="w-10 h-10 text-primary" />
                    <p className="text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground bg-white px-2 py-1 border-[2px] border-border shadow-[2px_2px_0px_#000]">
                      Klik untuk ganti file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 font-bold uppercase text-muted-foreground">
                    <Upload className="w-10 h-10" />
                    <p>KLIK ATAU DRAG FILE EXCEL (.xlsx/.xls)</p>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              {preview && preview.length > 0 && (
                <div className="brutal-block bg-white p-4">
                  {/* Ringkasan */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider bg-success text-white px-3 py-1.5 shadow-[2px_2px_0px_#000] border-2 border-border">
                      <CheckCircle2 className="w-4 h-4" />
                      {validCount} VALID
                    </div>
                    {invalidCount > 0 && (
                      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider bg-destructive text-white px-3 py-1.5 shadow-[2px_2px_0px_#000] border-2 border-border">
                        <XCircle className="w-4 h-4" />
                        {invalidCount} ERROR
                      </div>
                    )}
                  </div>

                  <div className="overflow-auto max-h-56 border-[3px] border-border">
                    <table className="data-table">
                      <thead className="sticky top-0 z-10">
                        <tr>
                          <th>Status</th>
                          <th>NIS</th>
                          <th>Nama Lengkap</th>
                          <th>Kode Kelas</th>
                          <th>Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, idx) => (
                          <tr
                            key={idx}
                            className={row.valid ? "row-valid" : "row-error"}
                          >
                            <td className="text-center">
                              {row.valid ? (
                                <CheckCircle2 className="w-5 h-5 text-success inline" />
                              ) : (
                                <XCircle className="w-5 h-5 text-destructive inline" />
                              )}
                            </td>
                            <td>{row.nis || "-"}</td>
                            <td>{row.namaLengkap || "-"}</td>
                            <td>{row.kodeKelas || "-"}</td>
                            <td className="text-destructive font-bold">
                              {row.error || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!importResult && preview && (
          <div className="px-6 py-4 border-t-[3px] border-border bg-white flex-shrink-0 flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 border-[3px] border-border bg-white text-foreground font-black uppercase tracking-wider hover:bg-muted transition-colors shadow-[4px_4px_0px_#000]"
            >
              BATAL
            </button>
            <button
              onClick={handleImport}
              disabled={importing || validCount === 0}
              className="brutal-btn px-6 py-3 flex items-center gap-2 disabled:opacity-60"
            >
              {importing && <Loader2 className="w-5 h-5 animate-spin" />}
              SIMPAN {validCount} DATA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
