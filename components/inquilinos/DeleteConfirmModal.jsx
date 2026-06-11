"use client";

import { AlertTriangle } from "lucide-react";

export function DeleteConfirmModal({ tenant, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-['Manrope'] font-bold text-lg text-[#191c1d]">Eliminar Inquilino</h3>
            <p className="text-sm text-[#40493d] mt-2">
              ¿Estás seguro de que deseas eliminar a <span className="font-semibold text-[#191c1d]">{tenant.nombre}</span> (Hab. {tenant.habitacion})? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-zinc-100 text-zinc-600 rounded-lg font-['Manrope'] text-sm font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => { onConfirm(tenant.id); onClose(); }}
              className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-lg font-['Manrope'] text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer"
            >
              Sí, Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
