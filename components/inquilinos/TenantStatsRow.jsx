"use client";

import { Users, Check, X } from "lucide-react";

export function TenantStatsRow({ total, active }) {
  const inactive = total - active;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
          <Users size={20} className="text-[#0d631b]" />
        </div>
        <div>
          <span className="text-xs font-bold text-[#445963] uppercase tracking-wider block">Total</span>
          <span className="text-2xl font-bold font-['Manrope'] text-[#191c1d]">{total}</span>
        </div>
      </div>
      <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
          <Check size={20} className="text-[#0d631b]" />
        </div>
        <div>
          <span className="text-xs font-bold text-[#445963] uppercase tracking-wider block">Activos</span>
          <span className="text-2xl font-bold font-['Manrope'] text-emerald-700">{active}</span>
        </div>
      </div>
      <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
          <X size={20} className="text-zinc-500" />
        </div>
        <div>
          <span className="text-xs font-bold text-[#445963] uppercase tracking-wider block">Inactivos</span>
          <span className="text-2xl font-bold font-['Manrope'] text-zinc-500">{inactive}</span>
        </div>
      </div>
    </div>
  );
}
