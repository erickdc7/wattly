"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTH_NAMES } from "@/context/TenantContext";

export function PeriodSelector({ month, year, onPrev, onNext, isCurrentMonth, minMonth, minYear }) {
  const label = `${MONTH_NAMES[month - 1]} ${year}`;
  const isMinMonth = year < minYear || (year === minYear && month <= minMonth);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
      <button
        onClick={onPrev}
        disabled={isMinMonth}
        className={`p-2 rounded-lg transition-colors ${isMinMonth ? "text-zinc-300 cursor-not-allowed" : "hover:bg-zinc-100 cursor-pointer text-[#445963]"}`}
      >
        <ChevronLeft size={20} />
      </button>
      <div className="text-center">
        <p className="text-[10px] font-[700] text-[#445963] uppercase tracking-widest">Período de Facturación</p>
        <h3 className="font-['Manrope'] font-[700] text-lg text-[#0d631b]">{label}</h3>
      </div>
      <button
        onClick={onNext}
        disabled={isCurrentMonth}
        className={`p-2 rounded-lg transition-colors ${isCurrentMonth ? "text-zinc-300 cursor-not-allowed" : "hover:bg-zinc-100 cursor-pointer text-[#445963]"}`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}