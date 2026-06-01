"use client";

import { X, History } from "lucide-react";
import { MONTH_SHORT } from "@/context/TenantContext";

export function HistoryModal({ tenant, historial, onClose }) {
  // Build history rows from historial records that include this tenant
  const historyRows = [];

  // Sort historial by year/month
  const sorted = [...historial].sort((a, b) => {
    if (a.anio !== b.anio) return a.anio - b.anio;
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    return meses.indexOf(a.mes.toLowerCase()) - meses.indexOf(b.mes.toLowerCase());
  });

  for (const record of sorted) {
    const recibo = (record.recibosCalculados || []).find(
      (r) => r.inquilinoId === tenant.id
    );
    if (recibo) {
      historyRows.push({
        periodo: `${record.mes} ${record.anio}`,
        lectAnterior: recibo.lecturaAnterior,
        lectActual: recibo.lecturaActual,
        consumo: recibo.consumoKwh,
        total: recibo.totalAPagar,
      });
    }
  }

  const fechaFormatted = (() => {
    const d = new Date(tenant.fechaIngreso + "T00:00:00");
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  })();

  return (
    <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <History size={20} className="text-[#0d631b]" />
          </div>
          <div>
            <h3 className="font-['Manrope'] font-[700] text-lg text-[#191c1d]">Historial de Lecturas</h3>
            <p className="text-xs text-[#40493d]">Hab. {tenant.habitacion} — {tenant.nombre}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer">
          <X size={20} className="text-zinc-400" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-[#40493d]">
          <span className="font-[600]">Fecha de ingreso:</span>
          <span className="px-2 py-0.5 bg-emerald-50 text-[#0d631b] rounded font-[600] text-xs">{fechaFormatted}</span>
        </div>

        {historyRows.length === 0 ? (
          <div className="text-center py-8 text-sm text-zinc-400">
            No hay registros de facturación para este inquilino.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#f3f4f5]/50">
                  <th className="px-3 py-2.5 text-[10px] font-[700] text-[#445963] uppercase tracking-wider">Período</th>
                  <th className="px-3 py-2.5 text-[10px] font-[700] text-[#445963] uppercase tracking-wider text-right">Lect. Anterior</th>
                  <th className="px-3 py-2.5 text-[10px] font-[700] text-[#445963] uppercase tracking-wider text-right">Lect. Actual</th>
                  <th className="px-3 py-2.5 text-[10px] font-[700] text-[#445963] uppercase tracking-wider text-right">Consumo</th>
                  <th className="px-3 py-2.5 text-[10px] font-[700] text-[#445963] uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {historyRows.reverse().map((row, i) => (
                  <tr key={i} className="hover:bg-[#f3f4f5] transition-colors">
                    <td className="px-3 py-2.5">
                      <span className="font-[600] text-[#191c1d] capitalize">{row.periodo}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-[#40493d]">{row.lectAnterior?.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-[#40493d]">{row.lectActual?.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-[500] ${row.consumo === 0 ? "bg-zinc-200 text-zinc-500" : "bg-emerald-100 text-emerald-800"}`}>
                        {row.consumo} kWh
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-[600] text-[#0d631b]">S/ {row.total?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
