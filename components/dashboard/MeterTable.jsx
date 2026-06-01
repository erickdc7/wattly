"use client";

import { History } from "lucide-react";
import React, { useState, useEffect } from "react";

const fmtConsumo = (n) => Number.isInteger(n) ? n.toString() : parseFloat(n.toFixed(2)).toString();

function MeterRow({
  tenant, mesAnteriorShort, mesActualShort,
  onToggleActive, onUpdateLectura, onSelectTenant,
  selectedTenantId, onShowHistory
}) {
  const lectAnterior = tenant.lecturaAnterior || 0;
  const lectActual = tenant._lecturaActual || 0;
  const isVacant = !tenant.activo;
  const fueraDeRango = tenant._fuera_de_rango === true;

  const [rawInput, setRawInput] = React.useState(
    lectActual > 0 ? String(lectActual) : ""
  );

  // Sincronizar si el valor externo cambia (cambio de mes)
  React.useEffect(() => {
    setRawInput(lectActual > 0 ? String(lectActual) : "");
  }, [tenant.id, lectActual]);

  const consumo = Math.max(0, (parseFloat(rawInput) || 0) - lectAnterior);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setRawInput(val);
      const numeric = parseFloat(val) || 0;
      onUpdateLectura(tenant, numeric);
    }
  };

  return (
    <tr className={`hover:bg-[#f3f4f5] transition-colors ${isVacant ? "opacity-60 bg-zinc-50/50" : ""} ${fueraDeRango ? "opacity-40" : ""}`}>
      <td className="px-4 lg:px-8 py-4 lg:py-5">
        <div className="flex items-center gap-2">
          <div className="font-['Manrope'] font-[600] text-[#191c1d] text-sm">
            Hab. {tenant.habitacion} - {tenant.nombre}
          </div>
          <button
            onClick={() => onShowHistory(tenant)}
            className="p-1 hover:bg-zinc-100 rounded transition-colors cursor-pointer shrink-0"
            title="Ver historial"
          >
            <History size={14} className="text-zinc-400" />
          </button>
        </div>
      </td>
      <td className="px-4 lg:px-6 py-4 lg:py-5 text-center">
        <button
          onClick={() => onToggleActive(tenant)}
          disabled={fueraDeRango}
          className={`relative w-11 h-6 rounded-full transition-colors ${fueraDeRango ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${tenant.activo ? "bg-[#0d631b]" : "bg-[#e1e3e4]"}`}
        >
          <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${tenant.activo ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </td>
      <td className="px-4 lg:px-6 py-4 lg:py-5 font-mono text-sm text-[#40493d] text-center">
        {fueraDeRango || tenant._es_mes_ingreso
          ? <span className="text-zinc-300">—</span>
          : lectAnterior > 0
            ? `${lectAnterior.toLocaleString()} kWh`
            : <span className="text-zinc-300">—</span>
        }
      </td>
      <td className="px-4 lg:px-6 py-4 lg:py-5 text-center">
        <input
          type="text"
          value={fueraDeRango ? "" : rawInput}
          placeholder={fueraDeRango ? "—" : "0"}
          onChange={handleChange}
          disabled={isVacant || fueraDeRango}
          className={`w-24 px-3 py-1.5 bg-[#f3f4f5] border-none rounded-lg text-sm font-[600] text-center focus:ring-2 focus:ring-[#0d631b]/20 outline-none ${isVacant || fueraDeRango ? "text-zinc-400 cursor-not-allowed" : "text-[#0d631b]"}`}
        />
      </td>
      <td className="px-4 lg:px-6 py-4 lg:py-5 text-center">
        <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-[500] ${isVacant || fueraDeRango || consumo === 0 ? "bg-zinc-200 text-zinc-500" : "bg-emerald-100 text-emerald-800"}`}>
          {fueraDeRango ? "—" : `${fmtConsumo(consumo)} kWh`}
        </span>
      </td>
      <td className="px-4 lg:px-8 py-4 lg:py-5 text-center">
        {isVacant || fueraDeRango ? (
          <button className="px-4 py-2 border border-zinc-300 text-zinc-400 rounded-lg text-sm font-[700] cursor-not-allowed font-['Manrope']">
            {fueraDeRango ? "Sin ingreso" : "Bloqueado"}
          </button>
        ) : (
          <button
            onClick={() => onSelectTenant(tenant.id)}
            className={`px-4 py-2 border rounded-lg text-sm font-[700] transition-all cursor-pointer font-['Manrope'] ${selectedTenantId === tenant.id ? "bg-[#0d631b] text-white border-[#0d631b]" : "border-[#0d631b] text-[#0d631b] hover:bg-[#0d631b] hover:text-white"}`}
          >
            Ver Recibo
          </button>
        )}
      </td>
    </tr>
  );
}

export function MeterTable({
  tenants,
  periodoLabel,
  mesAnteriorShort,
  mesActualShort,
  onToggleActive,
  onUpdateLectura,
  onSelectTenant,
  selectedTenantId,
  onShowHistory,
}) {
  return (
    <div className="flex-grow bg-white rounded-xl shadow-sm overflow-hidden h-fit min-w-0">
      <div className="px-4 lg:px-8 py-5 lg:py-6 border-b border-zinc-100/50 flex justify-between items-center">
        <h2 className="font-['Manrope'] text-lg lg:text-xl font-[700] text-[#191c1d]">Tabla de Control de Medidores</h2>
        <span className="text-xs px-3 py-1 bg-emerald-50 text-[#0d631b] rounded-full font-[700] uppercase">{periodoLabel}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="bg-[#f3f4f5]/50">
              <th className="px-4 lg:px-8 py-4 text-xs font-[700] text-[#445963] uppercase tracking-wider">Inquilino</th>
              <th className="px-4 lg:px-6 py-4 text-xs font-[700] text-[#445963] uppercase tracking-wider text-center">Estado</th>
              <th className="px-4 lg:px-6 py-4 text-xs font-[700] text-[#445963] uppercase tracking-wider text-center">
                <span className="block">Lect. Anterior</span>
                <span className="text-[10px] font-[500] text-zinc-400 normal-case">({mesAnteriorShort})</span>
              </th>
              <th className="px-4 lg:px-6 py-4 text-xs font-[700] text-[#445963] uppercase tracking-wider text-center">
                <span className="block">Lect. Actual</span>
                <span className="text-[10px] font-[500] text-zinc-400 normal-case">({mesActualShort})</span>
              </th>
              <th className="px-4 lg:px-6 py-4 text-xs font-[700] text-[#445963] uppercase tracking-wider text-center">Consumo</th>
              <th className="px-4 lg:px-8 py-4 text-xs font-[700] text-[#445963] uppercase tracking-wider text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {tenants.map((tenant) => (
              <MeterRow
                key={tenant.id}
                tenant={tenant}
                mesAnteriorShort={mesAnteriorShort}
                mesActualShort={mesActualShort}
                onToggleActive={onToggleActive}
                onUpdateLectura={onUpdateLectura}
                onSelectTenant={onSelectTenant}
                selectedTenantId={selectedTenantId}
                onShowHistory={onShowHistory}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}