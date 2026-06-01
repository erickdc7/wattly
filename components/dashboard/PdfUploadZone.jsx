"use client";

import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";

export function PdfUploadZone({ onPdfProcessed }) {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      onPdfProcessed(null, "Por favor selecciona un archivo PDF");
      return;
    }

    setProcessing(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-pdf", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        // Even if some fields are null, still open the modal with what we have
        onPdfProcessed(data, null);
      } else {
        // Show the specific error from the API
        const errorDetail = data.error || data.details || "Error al procesar el PDF";
        setErrorMsg(errorDetail);
        // Still open the manual modal so user can enter data
        onPdfProcessed(null, errorDetail);
      }
    } catch (err) {
      console.error("Upload error:", err);
      const msg = "Error de conexión al subir el PDF";
      setErrorMsg(msg);
      onPdfProcessed(null, msg);
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`flex-1 bg-white rounded-xl p-8 border-2 border-dashed flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-colors group ${
        processing
          ? "border-amber-400 bg-amber-50/50 cursor-wait"
          : dragOver
            ? "border-[#0d631b] bg-emerald-50"
            : "border-[#bfcaba]/30 hover:border-[#0d631b]/50"
      }`}
      onClick={() => !processing && fileInputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleInputChange} />

      {processing ? (
        <>
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <Loader2 className="text-amber-600 animate-spin" size={28} />
          </div>
          <div>
            <h3 className="font-['Manrope'] font-[700] text-lg text-[#191c1d]">Procesando PDF...</h3>
            <p className="text-sm text-[#40493d] max-w-xs mx-auto">Extrayendo datos del recibo de luz. Por favor espera.</p>
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="text-[#0d631b]" size={28} />
          </div>
          <div>
            <h3 className="font-['Manrope'] font-[700] text-lg text-[#191c1d]">Subir Recibo Maestro</h3>
            <p className="text-sm text-[#40493d] max-w-xs mx-auto">Arrastra y suelta el PDF de la factura aquí o haz clic para buscar archivos</p>
          </div>
          {errorMsg && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg max-w-xs">{errorMsg}</p>
          )}
        </>
      )}
    </div>
  );
}
