"use client";

import { useState } from "react";
import { X, UserPlus, Edit3 } from "lucide-react";

export function TenantFormModal({
  title,
  subtitle,
  initialData,
  submitLabel = "Agregar Inquilino",
  onClose,
  onSubmit,
}) {
  const today = new Date();

  const [form, setForm] = useState({
    nombre: initialData?.nombre || "",
    habitacion: initialData?.habitacion || "",
    fechaIngreso: initialData?.fechaIngreso || today.toISOString().split("T")[0],
    medidorId: initialData?.medidorId || "",
    lecturaAnterior: initialData?.lecturaAnterior?.toString() || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.habitacion.trim()) return;

    onSubmit({
      nombre: form.nombre.trim(),
      habitacion: form.habitacion.trim(),
      medidorId: form.medidorId.trim() || `#${Math.floor(1000 + Math.random() * 9000)}`,
      activo: initialData?.activo ?? true,
      fechaIngreso: form.fechaIngreso,
      lecturaAnterior: parseFloat(form.lecturaAnterior) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              {initialData ? <Edit3 size={20} className="text-[#0d631b]" /> : <UserPlus size={20} className="text-[#0d631b]" />}
            </div>
            <div>
              <h3 className="font-['Manrope'] font-bold text-lg text-[#191c1d]">{title}</h3>
              <p className="text-xs text-[#40493d]">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer">
            <X size={20} className="text-zinc-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#445963] uppercase tracking-wider block mb-1.5">
                Nombre Completo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Pedro Ramírez"
                required
                className="w-full px-3 py-2.5 bg-[#f3f4f5] border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0d631b]/20 focus:border-[#0d631b] outline-none transition-all"
              />
            </div>

            {/* Habitación */}
            <div>
              <label className="text-xs font-semibold text-[#445963] uppercase tracking-wider block mb-1.5">
                Nro. Habitación <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.habitacion}
                onChange={(e) => setForm({ ...form, habitacion: e.target.value })}
                placeholder="Ej: 501"
                required
                className="w-full px-3 py-2.5 bg-[#f3f4f5] border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0d631b]/20 focus:border-[#0d631b] outline-none transition-all"
              />
            </div>

            {/* Fecha Ingreso */}
            <div>
              <label className="text-xs font-semibold text-[#445963] uppercase tracking-wider block mb-1.5">
                Fecha de Ingreso <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.fechaIngreso}
                onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-[#f3f4f5] border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0d631b]/20 focus:border-[#0d631b] outline-none transition-all"
              />
            </div>

            {/* Medidor ID */}
            <div>
              <label className="text-xs font-semibold text-[#445963] uppercase tracking-wider block mb-1.5">
                ID Medidor
              </label>
              <input
                type="text"
                value={form.medidorId}
                onChange={(e) => setForm({ ...form, medidorId: e.target.value })}
                placeholder="Ej: #8821 (auto si vacío)"
                className="w-full px-3 py-2.5 bg-[#f3f4f5] border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0d631b]/20 focus:border-[#0d631b] outline-none transition-all"
              />
            </div>

            {/* Lectura Anterior */}
            <div>
              <label className="text-xs font-semibold text-[#445963] uppercase tracking-wider block mb-1.5">
                Lectura al Ingreso (kWh)
              </label>
              <input
                type="number"
                value={form.lecturaAnterior}
                onChange={(e) => setForm({ ...form, lecturaAnterior: e.target.value })}
                placeholder="Ej: 12450"
                className="w-full px-3 py-2.5 bg-[#f3f4f5] border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0d631b]/20 focus:border-[#0d631b] outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-zinc-100 text-zinc-600 rounded-lg font-['Manrope'] text-sm font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-[#0d631b] text-white rounded-lg font-['Manrope'] text-sm font-semibold hover:bg-[#2e7d32] transition-colors shadow-sm cursor-pointer"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
