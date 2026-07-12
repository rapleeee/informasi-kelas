"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b-[3px] border-border bg-white flex items-center justify-between px-4 z-40 shadow-[0_4px_0px_#000]">
        <div className="font-black uppercase tracking-widest text-lg">Admin Panel</div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 border-[3px] border-border bg-primary text-primary-foreground shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 w-64 z-50 transform transition-transform md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
         <Sidebar onClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full md:ml-64 pt-16 md:pt-0 overflow-x-hidden">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
