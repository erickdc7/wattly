"use client";

import { Search, Edit3, Trash2, Calendar } from "lucide-react";
import { useState } from "react";

function formatFecha(iso) {
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

export function TenantTable({ tenants, onEdit, onDelete, onToggleActive }) {
  const [search, setSearch] = useState("");

  const filtered = tenants.filter(
    (t) =>
      t.nombre.toLowerCase().includes(search.toLowerCase()) ||
      t.habitacion.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 lg:px-8 py-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-['Manrope'] text-lg font-[700] text-[#191c1d]">Lista de Inquilinos</h2>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar inquilino..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#f3f4f5] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#0d631b]/20 outline-none"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-[#f3f4f5]/50">
              <th className="px-4 lg:px-8 py-4 text-xs font-[700] text-[#445963] uppercase tracking-wider">Inquilino</th>
              <th className="px-4 lg:px-6 py-4 text-xs font-[700] text-[#445963] uppercase tracking-wider text-center">Habitación</th>
              <th className="px-4 lg:px-6 py-4 text-xs font-[700] text-[#445963] uppercase tracking-wider text-center">Fecha Ingreso</th>
              <th className="px-4 lg:px-6 py-4 text-xs font-[700] text-[#445963] uppercase tracking-wider text-center">Última Lectura</th>
              <th className="px-4 lg:px-6 py-4 text-xs font-[700] text-[#445963] uppercase tracking-wider text-center">Estado</th>
              <th className="px-4 lg:px-8 py-4 text-xs font-[700] text-[#445963] uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-sm text-zinc-400">
                  No se encontraron inquilinos
                </td>
              </tr>
            )}
            {filtered.map((tenant) => (
              <tr key={tenant.id} className={`hover:bg-[#f3f4f5] transition-colors ${!tenant.activo ? "opacity-60" : ""}`}>
                <td className="px-4 lg:px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <span className="text-[#0d631b] font-[700] text-xs font-['Manrope']">
                        {tenant.nombre.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-['Manrope'] font-[600] text-[#191c1d] text-sm">{tenant.nombre}</span>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 text-sm text-[#40493d] text-center">{tenant.habitacion}</td>
                <td className="px-4 lg:px-6 py-4 text-sm text-[#40493d] text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Calendar size={13} className="text-zinc-400" />
                    {formatFecha(tenant.fechaIngreso)}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 text-center">
                  {tenant.lecturaAnterior > 0 ? (
                    <span className="font-mono text-sm text-[#40493d]">{tenant.lecturaAnterior.toLocaleString()}</span>
                  ) : (
                    <span className="text-zinc-300 text-sm">—</span>
                  )}
                </td>
                <td className="px-4 lg:px-6 py-4 text-center">
                  <button
                    onClick={() => onToggleActive(tenant)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${tenant.activo ? "bg-[#0d631b]" : "bg-[#e1e3e4]"}`}
                  >
                    <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${tenant.activo ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </td>
                <td className="px-4 lg:px-8 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(tenant)}
                      className="p-2 bg-zinc-50 text-[#40493d] rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(tenant)}
                      className="p-2 bg-zinc-50 text-zinc-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
