"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { GraduationCap, Eye, EyeOff, Loader2, LogIn } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username tidak boleh kosong"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setServerError(null);
    const result = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError("Username atau password salah.");
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-dvh bg-pattern flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="badge-brutal mb-4 block w-fit mx-auto shadow-[2px_2px_0px_#000]">
            SMK Informatika Pesat
          </div>
        </div>

        {/* Card */}
        <div className="brutal-card p-8 shadow-[8px_8px_0px_#000]">
          <h2 className="text-xl font-black uppercase text-foreground mb-8 text-center border-b-[3px] border-border pb-4">
            Masuk
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-black uppercase tracking-wider text-foreground mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className="brutal-input w-full"
                placeholder="Masukkan username"
                {...register("username")}
              />
              {errors.username && (
                <p className="mt-2 text-xs font-bold text-white bg-destructive inline-block px-2 py-1 shadow-[2px_2px_0px_#000]">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-black uppercase tracking-wider text-foreground mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="brutal-input w-full pr-12"
                  placeholder="Masukkan password"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 px-4 border-l-[3px] border-border bg-muted hover:bg-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-foreground" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-xs font-bold text-white bg-destructive inline-block px-2 py-1 shadow-[2px_2px_0px_#000]">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="brutal-block bg-destructive text-white px-4 py-3 font-bold shadow-[4px_4px_0px_#000]">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="brutal-btn w-full py-4 flex items-center justify-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    MEMVERIFIKASI...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    MASUK
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center font-bold text-foreground text-xs mt-10 tracking-widest uppercase">
          © 2026 SMK Informatika Pesat
        </p>
      </div>
    </div>
  );
}
