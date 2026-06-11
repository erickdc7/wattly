"use client";

import { useRef, useState } from "react";
import { X, Image as ImageIcon, Copy } from "lucide-react";
import { MONTH_NAMES } from "@/context/TenantContext";

const fmt = (n) => n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtConsumo = (n) => Number.isInteger(n) ? n.toString() : parseFloat(n.toFixed(2)).toString();

function buildReceiptCanvas(data) {
  const {
    nombre, habitacion, periodoLabel, periodoMonth,
    lectActual, lectAnterior, consumo,
    charges, totalFixed, fixedPerTenant, activeTenantCount,
    otrosCargos, totalPagar
  } = data;

  const W = 520;
  const SCALE = 2;
  const pad = 32;
  const lineH = 22;

  const rows = [
    ["Cargo Fijo", charges.cargoFijo],
    ["Mant. y Reposición", charges.mantReposicion],
    ["Alumbramiento Público", charges.alumbradoPublico],
    ["I.G.V (18%)", charges.igv],
    ["Electrificación", charges.electrificacion],
  ];

  // Calcular altura total antes de crear el canvas
  const totalHeight =
    52 +  // header
    28 + 20 + 18 + 20 + 20 + // nombre section
    28 + rows.length * lineH + 8 + 12 + lineH + 28 + // cargos compartidos
    28 + lineH * 2 + lineH + lineH + 10 + lineH * 3 + 16 + // consumo
    16 + 100 + // total box
    10; // footer

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = totalHeight * SCALE;

  const ctx = canvas.getContext("2d");
  ctx.scale(SCALE, SCALE);

  let y = 0;

  // Background blanco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, totalHeight);

  // Header
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(0, 0, W, 52);
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 52);
  ctx.lineTo(W, 52);
  ctx.stroke();

  ctx.fillStyle = "#6b7280";
  ctx.font = "bold 9px system-ui";
  ctx.fillText("COMPROBANTE INDIVIDUAL", pad, 30);

  // Badge periodo
  ctx.fillStyle = "#d1fae5";
  ctx.beginPath();
  ctx.roundRect(W - pad - 80, 16, 72, 18, 4);
  ctx.fill();
  ctx.fillStyle = "#065f46";
  ctx.font = "bold 8px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(periodoLabel.toUpperCase(), W - pad - 44, 28);
  ctx.textAlign = "left";
  y = 52;

  // Nombre inquilino
  y += 28;
  ctx.fillStyle = "#9ca3af";
  ctx.font = "500 9px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("INQUILINO", W / 2, y);
  y += 20;
  ctx.fillStyle = "#111827";
  ctx.font = "bold 16px system-ui";
  ctx.fillText(nombre.toUpperCase(), W / 2, y);
  y += 18;
  ctx.fillStyle = "#047857";
  ctx.font = "600 11px system-ui";
  ctx.fillText(`Hab. ${habitacion}`, W / 2, y);
  y += 20;
  ctx.textAlign = "left";

  // Línea divisoria
  ctx.strokeStyle = "#e5e7eb";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(W - pad, y);
  ctx.stroke();
  ctx.setLineDash([]);
  y += 20;

  // Sección cargos compartidos
  ctx.font = "bold 8px system-ui";
  const text1 = "RESUMEN DEL MES (CARGOS COMPARTIDOS)";
  const w1 = ctx.measureText(text1).width + 12;
  ctx.fillStyle = "#ecfdf5";
  ctx.beginPath();
  ctx.roundRect(pad, y, w1, 18, 3);
  ctx.fill();
  ctx.fillStyle = "#065f46";
  ctx.textAlign = "left";
  ctx.fillText(text1, pad + 6, y + 12);
  y += 38;

  rows.forEach(([label, value]) => {
    ctx.fillStyle = "#374151";
    ctx.font = "13px system-ui";
    ctx.fillText(label, pad, y);
    ctx.fillStyle = "#111827";
    ctx.font = "500 13px system-ui";
    ctx.textAlign = "right";
    ctx.fillText(`S/ ${fmt(value)}`, W - pad, y);
    ctx.textAlign = "left";
    y += lineH;
  });

  y += 8;
  ctx.strokeStyle = "#f3f4f6";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(W - pad, y);
  ctx.stroke();
  y += 25;

  ctx.fillStyle = "#374151";
  ctx.font = "bold 13px system-ui";
  ctx.fillText(`Subtotal (${fmt(totalFixed)} ÷ ${activeTenantCount})`, pad, y);
  ctx.fillStyle = "#065f46";
  ctx.textAlign = "right";
  ctx.fillText(`S/ ${fmt(fixedPerTenant)}`, W - pad, y);
  ctx.textAlign = "left";
  y += 28;

  // Sección consumo individual
  ctx.font = "bold 8px system-ui";
  const text2 = "CÁLCULO DE CONSUMO INDIVIDUAL";
  const w2 = ctx.measureText(text2).width + 12;
  ctx.fillStyle = "#ecfdf5";
  ctx.beginPath();
  ctx.roundRect(pad, y, w2, 18, 3);
  ctx.fill();
  ctx.fillStyle = "#065f46";
  ctx.textAlign = "left";
  ctx.fillText(text2, pad + 6, y + 12);
  y += 38;

  const prevMonthIdx = periodoMonth - 2 < 0 ? 11 : periodoMonth - 2;
  const consumoRows = [
    [`Lectura Medidor (${MONTH_NAMES[periodoMonth - 1]})`, `${fmtConsumo(lectActual)} kWh`],
    [`Lectura Medidor (${MONTH_NAMES[prevMonthIdx]})`, `${fmtConsumo(lectAnterior)} kWh`],
  ];

  consumoRows.forEach(([label, value]) => {
    ctx.fillStyle = "#374151";
    ctx.font = "13px system-ui";
    ctx.fillText(label, pad, y);
    ctx.fillStyle = "#111827";
    ctx.font = "500 13px system-ui";
    ctx.textAlign = "right";
    ctx.fillText(value, W - pad, y);
    ctx.textAlign = "left";
    y += lineH;
  });

  ctx.fillStyle = "#065f46";
  ctx.font = "bold italic 13px system-ui";
  ctx.fillText("Consumo Total", pad, y);
  ctx.textAlign = "right";
  ctx.fillText(`${fmtConsumo(consumo)} kWh`, W - pad, y);
  ctx.textAlign = "left";
  y += lineH;

  y += 10;
  ctx.strokeStyle = "#f3f4f6";
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(W - pad, y);
  ctx.stroke();
  y += lineH;

  const consumoRows2 = [
    [`Consumo (${fmtConsumo(consumo)} x S/ ${charges.precioKwh.toFixed(4)})`, `S/ ${fmt(consumo * charges.precioKwh)}`],
    ["Cuota Compartida Fija", `S/ ${fmt(fixedPerTenant)}`],
    ["Otros (Luz, Lavadero, Baño)", `S/ ${fmt(otrosCargos)}`],
  ];

  consumoRows2.forEach(([label, value]) => {
    ctx.fillStyle = "#374151";
    ctx.font = "13px system-ui";
    ctx.fillText(label, pad, y);
    ctx.fillStyle = "#111827";
    ctx.font = "500 13px system-ui";
    ctx.textAlign = "right";
    ctx.fillText(value, W - pad, y);
    ctx.textAlign = "left";
    y += lineH;
  });

  y += 16;

  // Total box
  const gradient = ctx.createLinearGradient(pad, y, W - pad, y + 88);
  gradient.addColorStop(0, "#0d631b");
  gradient.addColorStop(1, "#2e7d32");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(pad, y, W - pad * 2, 88, 12);
  ctx.fill();

  ctx.fillStyle = "#6ee7b7";
  ctx.font = "bold 9px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("TOTAL A PAGAR", W / 2, y + 26);

  const totalStr = fmt(Math.ceil(totalPagar));
  ctx.font = "bold 40px system-ui";
  const totalWidth = ctx.measureText(totalStr).width;
  const totalX = W / 2 - (totalWidth / 2) + 16;

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "bold 18px system-ui";
  ctx.textAlign = "left";
  ctx.fillText("S/", totalX - 28, y + 68);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 40px system-ui";
  ctx.fillText(totalStr, totalX, y + 70);
  y += 100;



  return canvas;
}

export function ReceiptPanel({
  tenant,
  charges,
  periodoMonth,
  periodoLabel,
  totalFixed,
  fixedPerTenant,
  activeTenantCount,
  otrosCargos,
  onClose,
}) {
  const receiptRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const lectActual = tenant._lecturaActual || 0;
  const lectAnterior = tenant.lecturaAnterior || 0;
  const consumo = Math.max(0, lectActual - lectAnterior);
  const prevMonthIdx = periodoMonth - 2 < 0 ? 11 : periodoMonth - 2;
  const totalPagar = consumo * charges.precioKwh + fixedPerTenant + otrosCargos;

  const getCanvasData = () => ({
    nombre: tenant.nombre,
    habitacion: tenant.habitacion,
    periodoLabel,
    periodoMonth,
    lectActual,
    lectAnterior,
    consumo,
    charges,
    totalFixed,
    fixedPerTenant,
    activeTenantCount,
    otrosCargos,
    totalPagar,
  });

  const handleDownload = () => {
    try {
      const canvas = buildReceiptCanvas(getCanvasData());
      const link = document.createElement("a");
      link.download = `recibo-${tenant.nombre.replace(/\s/g, "-")}-${periodoLabel.replace(/\s/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Error al generar imagen:", err);
      alert(`Error: ${err?.message || err}`);
    }
  };

  const handleCopy = async () => {
    try {
      const canvas = buildReceiptCanvas(getCanvasData());
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch {
          const link = document.createElement("a");
          link.download = `recibo-${tenant.nombre.replace(/\s/g, "-")}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      }, "image/png");
    } catch (err) {
      console.error("Error al copiar:", err);
      alert(`Error: ${err?.message || err}`);
    }
  };

  return (
    <aside className="w-full lg:w-112.5 shrink-0">
      <div ref={receiptRef} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-zinc-200">
        <div className="p-5 lg:p-6 bg-zinc-50 flex items-center justify-between border-b border-zinc-200">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-['Manrope']">Comprobante Individual</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-[#0d631b] rounded font-bold uppercase">{periodoLabel}</span>
            <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded cursor-pointer"><X size={16} /></button>
          </div>
        </div>
        <div className="p-6 lg:p-8 space-y-6">
          <div className="text-center pb-6 border-b border-dashed border-zinc-200">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-tighter mb-1">Inquilino</p>
            <h2 className="text-xl lg:text-2xl font-extrabold font-['Manrope'] text-[#191c1d] tracking-tight uppercase">{tenant.nombre}</h2>
            <p className="text-sm text-emerald-700 font-semibold">Hab. {tenant.habitacion}</p>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-[#0d631b] uppercase tracking-widest mb-3 bg-emerald-50 px-2 py-1 rounded w-fit">Resumen del Mes (Cargos Compartidos)</h4>
            <div className="space-y-2 px-1">
              {[["Cargo Fijo", charges.cargoFijo], ["Mant. y Reposición", charges.mantReposicion], ["Alumbramiento Público", charges.alumbradoPublico], ["I.G.V (18%)", charges.igv], ["Electrificación", charges.electrificacion]].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-[#40493d]">{l}</span>
                  <span className="font-medium text-[#191c1d]">S/ {fmt(v)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-zinc-100 flex justify-between text-sm font-bold">
                <span className="text-zinc-600">Subtotal Compartido ({fmt(totalFixed)} ÷ {activeTenantCount})</span>
                <span className="text-emerald-700">S/ {fmt(fixedPerTenant)}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-[#0d631b] uppercase tracking-widest mb-3 bg-emerald-50 px-2 py-1 rounded w-fit">Cálculo de Consumo Individual</h4>
            <div className="space-y-2 px-1">
              <div className="flex justify-between text-sm">
                <span className="text-[#40493d]">Lectura Medidor ({MONTH_NAMES[periodoMonth - 1]})</span>
                <span className="font-medium text-[#191c1d]">{fmtConsumo(lectActual)} kWh</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#40493d]">Lectura Medidor ({MONTH_NAMES[prevMonthIdx]})</span>
                <span className="font-medium text-[#191c1d]">{fmtConsumo(lectAnterior)} kWh</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#0d631b] italic"><span>Consumo Total</span><span>{fmtConsumo(consumo)} kWh</span></div>
              <div className="pt-2 flex justify-between text-sm"><span className="text-[#40493d]">Consumo ({fmtConsumo(consumo)} x S/ {charges.precioKwh.toFixed(4)})</span><span className="font-medium text-[#191c1d]">S/ {fmt(consumo * charges.precioKwh)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#40493d]">Cuota Compartida Fija</span><span className="font-medium text-[#191c1d]">S/ {fmt(fixedPerTenant)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#40493d]">Otros (Luz, Lavadero, Baño)</span><span className="font-medium text-[#191c1d]">S/ {fmt(otrosCargos)}</span></div>
            </div>
          </div>

          <div className="bg-linear-to-br from-[#0d631b] to-[#2e7d32] p-6 rounded-xl text-center space-y-1 mt-6">
            <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Total a Pagar</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-bold text-white/60">S/</span>
              <p className="text-4xl lg:text-5xl font-black font-['Manrope'] text-white">{fmt(Math.ceil(totalPagar))}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 py-3 lg:py-4 px-6 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-bold font-['Manrope'] hover:bg-zinc-50 transition-colors shadow-sm text-sm cursor-pointer">
              <ImageIcon size={18} /> Descargar Recibo
            </button>
            <button onClick={handleCopy} className="w-full flex items-center justify-center gap-2 py-3 lg:py-4 px-6 bg-zinc-800 text-white rounded-xl font-bold font-['Manrope'] hover:bg-zinc-700 transition-colors shadow-sm text-sm cursor-pointer">
              <Copy size={18} /> {copySuccess ? "¡Copiado!" : "Copiar Recibo"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}