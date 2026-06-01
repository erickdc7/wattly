"use client";

import { useState } from "react";
import { X, CheckCircle2, AlertTriangle } from "lucide-react";

export function ManualInputModal({ charges, autoFilled, onApply, onClose }) {
  const [form, setForm] = useState({ ...charges });

  const update = (key, val) => {
    setForm({ ...form, [key]: parseFloat(val) || 0 });
  };

  const fields = [
    { key: "cargoFijo", label: "Cargo Fijo (S/)" },
    { key: "mantReposicion", label: "Mant. y Reposición (S/)" },
    { key: "alumbradoPublico", label: "Alumbrado Público (S/)" },
    { key: "igv", label: "IGV 18% (S/)" },
    { key: "electrificacion", label: "Electrificación (S/)" },
    { key: "precioKwh", label: "Precio por kWh (S/)" },
  ];

  const foundCount = autoFilled
    ? fields.filter(({ key }) => autoFilled[key] !== null && autoFilled[key] !== undefined).length
    : 0;

  return (
    <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center">
        <h3 className="font-['Manrope'] font-[700] text-lg text-[#191c1d]">
          {autoFilled ? "Confirmar Datos del Recibo" : "Ingresar Datos del Recibo"}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded cursor-pointer"><X size={20} /></button>
      </div>
      <p className="text-sm text-[#40493d]">
        {autoFilled
          ? `Se extrajeron ${foundCount}/6 valores del PDF. Revisa y completa los campos faltantes.`
          : "Ingrese los valores extraídos del recibo de luz (Luz del Sur / Enel)."}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ key, label }) => {
          const wasFound = autoFilled && autoFilled[key] !== null && autoFilled[key] !== undefined;
          const wasMissing = autoFilled && !wasFound;

          return (
            <div key={key} className="relative">
              <label className="text-xs font-[600] text-[#445963] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                {label}
                {wasFound && <CheckCircle2 size={13} className="text-emerald-500" />}
                {wasMissing && <AlertTriangle size={13} className="text-amber-500" />}
              </label>
              <input
                type="number"
                step="0.0001"
                value={form[key] || ""}
                placeholder={wasMissing ? "No encontrado" : "0"}
                onChange={(e) => update(key, e.target.value)}
                className={`w-full px-3 py-2 bg-[#f3f4f5] border rounded-lg text-sm focus:ring-2 focus:ring-[#0d631b]/20 focus:border-[#0d631b] outline-none ${
                  wasFound
                    ? "border-emerald-300 bg-emerald-50/30"
                    : wasMissing
                      ? "border-amber-300 bg-amber-50/30"
                      : "border-[#bfcaba]"
                }`}
              />
            </div>
          );
        })}
      </div>
      <button
        onClick={() => onApply(form)}
        className="w-full py-3 bg-[#0d631b] text-white rounded-lg font-['Manrope'] font-[600] text-sm hover:bg-[#2e7d32] transition-colors cursor-pointer"
      >
        Aplicar Datos
      </button>
    </div>
  );
}
