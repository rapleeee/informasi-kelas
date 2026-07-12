"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  School,
  Settings,
  LogOut,
  GraduationCap,
  ChevronRight,
  User,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/dashboard/siswa", label: "Data Siswa", icon: Users },
  { href: "/admin/dashboard/kelas", label: "Master Kelas", icon: School },
  { href: "/admin/dashboard/pengaturan", label: "Pengaturan", icon: Settings },
  { href: "/admin/dashboard/profil", label: "Profil Admin", icon: User },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex flex-col w-64 h-full overflow-y-auto bg-white border-r-[3px] border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b-[3px] border-border">
        <div className="flex items-center justify-center w-10 h-10 border-[3px] border-border bg-primary flex-shrink-0 shadow-[2px_2px_0px_#000]">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs font-black uppercase text-secondary leading-none mb-1">Admin Panel</p>
          <p className="text-base font-black uppercase text-foreground leading-none">SMK Pesat</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-3 font-bold uppercase text-sm border-[3px] border-transparent transition-all group ${
                active
                  ? "bg-primary text-primary-foreground border-border shadow-[3px_3px_0px_#000]"
                  : "text-foreground hover:border-border hover:bg-muted"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-primary-foreground" : "text-primary group-hover:text-primary"}`} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-4 h-4 text-primary-foreground" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-6 border-t-[3px] border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 border-[3px] border-border font-black uppercase text-sm bg-destructive text-white hover:bg-white hover:text-destructive shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
