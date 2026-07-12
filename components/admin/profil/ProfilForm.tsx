"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

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

type ProfilForm = z.infer<typeof profilSchema>;

export default function ProfilForm() {
  const [showPasswordLama, setShowPasswordLama] = useState(false);
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfilForm>({
    resolver: zodResolver(profilSchema),
    defaultValues: async () => {
      try {
        const res = await fetch("/api/admin/profil");
        const data = await res.json();
        return { username: data.username, passwordLama: "", passwordBaru: "" };
      } catch {
        return { username: "", passwordLama: "", passwordBaru: "" };
      }
    },
  });

  async function onSubmit(data: ProfilForm) {
    try {
      const res = await fetch("/api/admin/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Gagal menyimpan profil.");
        return;
      }
      
      toast.success("Profil berhasil diperbarui!");
      reset({ username: data.username, passwordLama: "", passwordBaru: "" });
    } catch {
      toast.error("Gagal terhubung ke server.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-black uppercase text-foreground mb-2">
          Username
        </label>
        <input
          type="text"
          className="brutal-input w-full"
          {...register("username")}
        />
        {errors.username && (
          <p className="mt-2 text-xs font-bold text-white bg-destructive inline-block px-2 py-1 shadow-[2px_2px_0px_#000]">
            {errors.username.message}
          </p>
        )}
      </div>

      <div className="p-4 border-[3px] border-border bg-muted">
        <h3 className="font-black uppercase mb-4 tracking-wider">Ubah Password (Opsional)</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-black uppercase text-foreground mb-2">
              Password Lama
            </label>
            <div className="relative">
              <input
                type={showPasswordLama ? "text" : "password"}
                className="brutal-input w-full pr-12"
                {...register("passwordLama")}
              />
              <button
                type="button"
                onClick={() => setShowPasswordLama(!showPasswordLama)}
                className="absolute right-0 top-0 bottom-0 px-4 border-l-[3px] border-border bg-white hover:bg-muted transition-colors"
                tabIndex={-1}
              >
                {showPasswordLama ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.passwordLama && (
              <p className="mt-2 text-xs font-bold text-white bg-destructive inline-block px-2 py-1 shadow-[2px_2px_0px_#000]">
                {errors.passwordLama.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-black uppercase text-foreground mb-2">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPasswordBaru ? "text" : "password"}
                className="brutal-input w-full pr-12"
                {...register("passwordBaru")}
              />
              <button
                type="button"
                onClick={() => setShowPasswordBaru(!showPasswordBaru)}
                className="absolute right-0 top-0 bottom-0 px-4 border-l-[3px] border-border bg-white hover:bg-muted transition-colors"
                tabIndex={-1}
              >
                {showPasswordBaru ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.passwordBaru && (
              <p className="mt-2 text-xs font-bold text-white bg-destructive inline-block px-2 py-1 shadow-[2px_2px_0px_#000]">
                {errors.passwordBaru.message}
              </p>
            )}
            <p className="mt-2 text-xs font-bold text-muted-foreground uppercase">
              Kosongkan jika tidak ingin mengubah password.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="brutal-btn px-6 py-3 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          SIMPAN PROFIL
        </button>
      </div>
    </form>
  );
}
