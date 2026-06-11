"use client";

import { LayoutDashboard, Users, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Users, label: "Inquilinos", to: "/inquilinos" },
];

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const linkClass = (href) => {
    const isActive = pathname === href;
    return `flex items-center gap-3 px-4 py-2 rounded text-sm font-['Manrope'] ${
      isActive ? "text-[#0d631b] font-[700] bg-stone-100" : "text-stone-500"
    }`;
  };

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-200">
        <span className="text-xl font-bold tracking-tight text-[#0d631b] font-['Manrope']">Wattly</span>
        <button onClick={() => setOpen(!open)} className="p-2 cursor-pointer">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="bg-white border-b border-zinc-200 px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <Link key={item.label} href={item.to} onClick={() => setOpen(false)} className={linkClass(item.to)}>
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();

  const linkClass = (href) => {
    const isActive = pathname === href;
    return `flex items-center gap-3 px-4 py-3 rounded-sm transition-all font-['Manrope'] text-sm ${
      isActive
        ? "text-[#0d631b] font-[700] bg-emerald-50/80 rounded-lg"
        : "text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-lg"
    }`;
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-stone-50/80 backdrop-blur-xl py-6 px-4 shadow-[0_4px_20px_rgba(25,28,29,0.04)] h-screen sticky top-0 overflow-y-auto shrink-0">
      <div className="mb-8 px-2 flex flex-col gap-8">
        <span className="text-2xl font-bold tracking-tight text-[#0d631b] font-['Manrope']">Wattly</span>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 shrink-0 border-2 border-emerald-50 flex items-center justify-center">
            <span className="text-[#0d631b] font-bold text-sm font-['Manrope']">ED</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-500 font-['Manrope'] uppercase tracking-wider">Bienvenido</span>
            <span className="text-sm font-bold text-[#0d631b] font-['Manrope']">Erick Díaz</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link key={item.label} href={item.to} className={linkClass(item.to)}>
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
