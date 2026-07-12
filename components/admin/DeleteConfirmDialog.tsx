"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmDialog({
  title,
  description,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      toast.success("Berhasil dihapus!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="brutal-card w-full max-w-sm animate-slide-in bg-white shadow-[8px_8px_0px_#000]">
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-border bg-destructive text-white">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-base font-black uppercase tracking-wider">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:text-black transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-6">
          <p className="text-sm font-bold text-foreground leading-relaxed uppercase tracking-wider">
            {description}
          </p>

          <div className="flex gap-4 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border-[3px] border-border bg-white text-foreground font-black uppercase tracking-wider hover:bg-muted transition-colors shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-50"
            >
              BATAL
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-destructive border-[3px] border-border text-white text-sm font-black uppercase tracking-wider py-3 px-4 shadow-[4px_4px_0px_#000] hover:bg-red-600 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              HAPUS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
