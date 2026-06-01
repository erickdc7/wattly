"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTenants, MONTH_NAMES, MONTH_SHORT, getPrevMonth } from "@/context/TenantContext";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { PdfUploadZone } from "@/components/dashboard/PdfUploadZone";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { MeterTable } from "@/components/dashboard/MeterTable";
import { ReceiptPanel } from "@/components/dashboard/ReceiptPanel";
import { ManualInputModal } from "@/components/dashboard/ManualInputModal";
import { HistoryModal } from "@/components/dashboard/HistoryModal";

const defaultCharges = {
  cargoFijo: 0,
  mantReposicion: 0,
  alumbradoPublico: 0,
  igv: 0,
  electrificacion: 0,
  precioKwh: 0,
};

export function DashboardPage() {
  const { tenants, updateTenant, config, loading } = useTenants();
  const [charges, setCharges] = useState(defaultCharges);
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [autoFilledData, setAutoFilledData] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [lecturas, setLecturas] = useState({});

  // Period selector — default to current month
  const now = new Date();
  const [periodoMonth, setPeriodoMonth] = useState(now.getMonth() + 1);
  const [periodoYear, setPeriodoYear] = useState(now.getFullYear());

  const prev = getPrevMonth(periodoMonth, periodoYear);
  const periodoLabel = `${MONTH_NAMES[periodoMonth - 1]} ${periodoYear}`;
  const mesActualShort = MONTH_SHORT[periodoMonth - 1];
  const mesAnteriorShort = MONTH_SHORT[prev.month - 1];

  const otrosCargos = config?.otrosCargos ?? 2.0;

  // Calcular el mes mínimo navegable basado en el inquilino más antiguo
  const { minMonth, minYear } = useMemo(() => {
    if (!tenants || tenants.length === 0) return { minMonth: now.getMonth() + 1, minYear: now.getFullYear() };
    let earliest = null;
    for (const t of tenants) {
      if (!t.fechaIngreso) continue;
      const d = new Date(t.fechaIngreso + "T00:00:00");
      if (!earliest || d < earliest) earliest = d;
    }
    if (!earliest) return { minMonth: now.getMonth() + 1, minYear: now.getFullYear() };
    return { minMonth: earliest.getMonth() + 1, minYear: earliest.getFullYear() };
  }, [tenants]);

  // Fetch historial
  const fetchHistorial = useCallback(async () => {
    try {
      const res = await fetch("/api/historial", { cache: "no-store" });
      const data = await res.json();
      setHistorial(data);
    } catch (err) {
      console.error("Error fetching historial:", err);
    }
  }, []);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  // Load saved charges from historial for current period
  useEffect(() => {
    const mesName = MONTH_NAMES[periodoMonth - 1].toLowerCase();
    const record = historial.find(
      (h) => h.mes.toLowerCase() === mesName && h.anio === periodoYear
    );
    if (record) {
      setCharges({
        cargoFijo: record.cargosCompartidos?.cargoFijo || 0,
        mantReposicion: record.cargosCompartidos?.mantReposicion || 0,
        alumbradoPublico: record.cargosCompartidos?.alumbradoPublico || 0,
        igv: record.cargosCompartidos?.igv || 0,
        electrificacion: record.cargosCompartidos?.electrificacion || 0,
        precioKwh: record.precioKwh || 0,
      });
      // Load saved lecturas from recibos
      const saved = {};
      for (const r of record.recibosCalculados || []) {
        saved[r.inquilinoId] = r.lecturaActual || 0;
      }
      setLecturas(saved);
    } else {
      setCharges(defaultCharges);
      setLecturas({});
    }
  }, [historial, periodoMonth, periodoYear]);

  // Period navigation
  const goToPrevPeriod = () => {
    if (periodoYear < minYear || (periodoYear === minYear && periodoMonth <= minMonth)) return;
    setPeriodoMonth(prev.month);
    setPeriodoYear(prev.year);
    setSelectedTenantId(null);
  };
  const goToNextPeriod = () => {
    const next = periodoMonth === 12 ? { month: 1, year: periodoYear + 1 } : { month: periodoMonth + 1, year: periodoYear };
    if (next.year > now.getFullYear() || (next.year === now.getFullYear() && next.month > now.getMonth() + 1)) return;
    setPeriodoMonth(next.month);
    setPeriodoYear(next.year);
    setSelectedTenantId(null);
  };
  const isCurrentMonth = periodoMonth === now.getMonth() + 1 && periodoYear === now.getFullYear();

  // Tenants with transient _lecturaActual for current period
  const tenantsWithLecturas = useMemo(() => {
    const mesName = MONTH_NAMES[periodoMonth - 1].toLowerCase();

    const currentRecord = historial.find(
      (h) => h.mes.toLowerCase() === mesName && h.anio === periodoYear
    );
    const prevRecord = historial.find(
      (h) =>
        h.mes.toLowerCase() === MONTH_NAMES[prev.month - 1].toLowerCase() &&
        h.anio === prev.year
    );

    return tenants.map((t) => {
      const fechaIngreso = t.fechaIngreso ? new Date(t.fechaIngreso + "T00:00:00") : null;
      const mesIngresoNum = fechaIngreso ? fechaIngreso.getMonth() + 1 : 1;
      const anioIngreso = fechaIngreso ? fechaIngreso.getFullYear() : 2000;

      // Mes anterior al ingreso → fuera de rango
      const mesAnteriorAlIngreso =
        periodoYear < anioIngreso ||
        (periodoYear === anioIngreso && periodoMonth < mesIngresoNum);

      if (mesAnteriorAlIngreso) {
        return {
          ...t,
          lecturaAnterior: null,
          _lecturaActual: null,
          _fuera_de_rango: true,
        };
      }

      // Estamos EN el mes de ingreso del inquilino
      const esMesDeIngreso =
        periodoYear === anioIngreso && periodoMonth === mesIngresoNum;

      if (esMesDeIngreso) {
        // lecturaAnterior → vacío
        // lecturaActual → lo que tenga guardado en historial,
        //   o si no hay historial, la lectura al ingreso (t.lecturaAnterior)
        const currentRecibo = currentRecord?.recibosCalculados?.find(
          (r) => String(r.inquilinoId) === String(t.id)
        );
        const lectActualGuardada = currentRecibo?.lecturaActual > 0
          ? currentRecibo.lecturaActual
          : lecturas[t.id] > 0
            ? lecturas[t.id]
            : t.lecturaAnterior || 0;

        return {
          ...t,
          lecturaAnterior: null,
          _lecturaActual: lectActualGuardada,
          _es_mes_ingreso: true,
          _fuera_de_rango: false,
        };
      }

      // Meses posteriores al ingreso — lógica normal
      const currentRecibo = currentRecord?.recibosCalculados?.find(
        (r) => String(r.inquilinoId) === String(t.id)
      );
      const prevRecibo = prevRecord?.recibosCalculados?.find(
        (r) => String(r.inquilinoId) === String(t.id)
      );

      // Prioridad: lecturaAnterior del registro actual → lecturaActual del mes anterior → baseline
      const prevMesEsIngreso =
        prev.year === anioIngreso && prev.month === mesIngresoNum;

      const lecturaAnteriorCorrecta =
        prevRecibo?.lecturaActual > 0
          ? prevRecibo.lecturaActual
          : prevMesEsIngreso
            ? (t.lecturaAnterior || null)
            : currentRecibo?.lecturaAnterior > 0
              ? currentRecibo.lecturaAnterior
              : null;

      return {
        ...t,
        lecturaAnterior: lecturaAnteriorCorrecta,
        _lecturaActual: lecturas[t.id] || 0,
        _es_mes_ingreso: false,
        _fuera_de_rango: false,
      };
    });
  }, [tenants, lecturas, historial, periodoMonth, periodoYear, prev.month, prev.year]);

  const activeTenants = useMemo(() => tenantsWithLecturas.filter((t) => t.activo), [tenantsWithLecturas]);
  const totalFixed = charges.cargoFijo + charges.mantReposicion + charges.alumbradoPublico + charges.igv + charges.electrificacion;
  const fixedPerTenant = activeTenants.length > 0 ? totalFixed / activeTenants.length : 0;
  const selectedTenant = tenantsWithLecturas.find((t) => t.id === selectedTenantId) || null;

  const handleUpdateLectura = useCallback(async (tenant, value) => {
    const numericValue = typeof value === "string" ? (parseFloat(value) || 0) : value;
    const rawValue = typeof value === "string" ? value : String(value);

    setLecturas((prev) => ({ ...prev, [tenant.id]: numericValue }));

    const mesName = MONTH_NAMES[periodoMonth - 1].toLowerCase();
    const existing = historial.find(
      (h) => h.mes.toLowerCase() === mesName && h.anio === periodoYear
    );

    let updatedRecord;

    if (existing) {
      let updatedRecibos = (existing.recibosCalculados || []).map((r) =>
        String(r.inquilinoId) === String(tenant.id)
          ? { ...r, lecturaActual: value, consumoKwh: Math.max(0, value - (r.lecturaAnterior || 0)) }
          : r
      );
      // Si el inquilino no estaba en recibos aún, agregarlo
      const yaEsta = updatedRecibos.some(r => String(r.inquilinoId) === String(tenant.id));
      if (!yaEsta) {
        updatedRecibos.push({
          inquilinoId: tenant.id,
          nombre: tenant.nombre,
          habitacion: tenant.habitacion,
          lecturaAnterior: tenant.lecturaAnterior || 0,
          lecturaActual: value,
          consumoKwh: Math.max(0, value - (tenant.lecturaAnterior || 0)),
          costoConsumo: 0,
          cuotaFija: 0,
          otros: otrosCargos,
          totalAPagar: 0,
        });
      }
      updatedRecord = { ...existing, recibosCalculados: updatedRecibos };
    } else {
      // Crear registro mínimo si no existe aún para este mes
      updatedRecord = {
        id: Date.now(),
        mes: mesName,
        anio: periodoYear,
        archivoPdf: null,
        precioKwh: charges.precioKwh || 0,
        cargosCompartidos: {
          cargoFijo: charges.cargoFijo || 0,
          mantReposicion: charges.mantReposicion || 0,
          alumbradoPublico: charges.alumbradoPublico || 0,
          igv: charges.igv || 0,
          electrificacion: charges.electrificacion || 0,
          totalCompartido: 0,
        },
        inquilinosActivos: 0,
        cuotaFijaPorInquilino: 0,
        recibosCalculados: [{
          inquilinoId: tenant.id,
          nombre: tenant.nombre,
          habitacion: tenant.habitacion,
          lecturaAnterior: tenant.lecturaAnterior || 0,
          lecturaActual: value,
          consumoKwh: Math.max(0, value - (tenant.lecturaAnterior || 0)),
          costoConsumo: 0,
          cuotaFija: 0,
          otros: otrosCargos,
          totalAPagar: 0,
        }],
      };
    }

    // Actualizar historial local sin refetch
    setHistorial((prev) =>
      existing
        ? prev.map((h) => (h.id === existing.id ? updatedRecord : h))
        : [...prev, updatedRecord]
    );

    // Guardar en API
    try {
      await fetch("/api/historial", {
        method: existing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          existing ? { id: existing.id, ...updatedRecord } : updatedRecord
        ),
      });
    } catch (err) {
      console.error("Error saving lectura:", err);
    }
  }, [periodoMonth, periodoYear, historial, charges, otrosCargos]);

  const handleToggleActive = (tenant) => {
    updateTenant(tenant.id, { activo: !tenant.activo });
  };

  // PDF processing result
  const handlePdfProcessed = (data, error) => {
    if (error) {
      alert(error);
      setShowManualModal(true);
      setAutoFilledData(null);
      return;
    }
    // Merge extracted values into charges format
    const merged = {
      cargoFijo: data.cargoFijo ?? charges.cargoFijo,
      mantReposicion: data.mantReposicion ?? charges.mantReposicion,
      alumbradoPublico: data.alumbradoPublico ?? charges.alumbradoPublico,
      igv: data.igv ?? charges.igv,
      electrificacion: data.electrificacion ?? charges.electrificacion,
      precioKwh: data.precioKwh ?? charges.precioKwh,
    };
    setCharges(merged);
    setAutoFilledData(data);
    setShowManualModal(true);
  };

  // Apply charges and save to historial
  const handleApplyCharges = async (form) => {
    setCharges(form);
    setShowManualModal(false);
    setAutoFilledData(null);

    const mesName = MONTH_NAMES[periodoMonth - 1].toLowerCase();
    const existing = historial.find(
      (h) => h.mes.toLowerCase() === mesName && h.anio === periodoYear
    );

    const totalF = form.cargoFijo + form.mantReposicion + form.alumbradoPublico + form.igv + form.electrificacion;
    const activeCount = activeTenants.filter(t => !t._fuera_de_rango).length;
    const cuotaFija = activeCount > 0 ? totalF / activeCount : 0;

    const recibos = activeTenants
      .filter(t => !t._fuera_de_rango)
      .map((t) => {
        // Leer lecturaActual desde historial guardado primero,
        // luego desde estado lecturas como fallback
        const existingRecibo = existing?.recibosCalculados?.find(
          (r) => String(r.inquilinoId) === String(t.id)
        );
        const lectActual =
          existingRecibo?.lecturaActual > 0
            ? existingRecibo.lecturaActual
            : lecturas[t.id] || 0;
        const lectAnterior = t.lecturaAnterior || 0;
        const consumo = Math.max(0, lectActual - lectAnterior);

        return {
          inquilinoId: t.id,
          nombre: t.nombre,
          habitacion: t.habitacion,
          lecturaAnterior: lectAnterior,
          lecturaActual: lectActual,
          consumoKwh: consumo,
          costoConsumo: parseFloat((consumo * form.precioKwh).toFixed(2)),
          cuotaFija: parseFloat(cuotaFija.toFixed(2)),
          otros: otrosCargos,
          totalAPagar: parseFloat((consumo * form.precioKwh + cuotaFija + otrosCargos).toFixed(2)),
        };
      });

    const record = {
      mes: mesName,
      anio: periodoYear,
      archivoPdf: autoFilledData?.archivoPdf || existing?.archivoPdf || null,
      precioKwh: form.precioKwh,
      cargosCompartidos: {
        cargoFijo: form.cargoFijo,
        mantReposicion: form.mantReposicion,
        alumbradoPublico: form.alumbradoPublico,
        igv: form.igv,
        electrificacion: form.electrificacion,
        totalCompartido: parseFloat(totalF.toFixed(2)),
      },
      inquilinosActivos: activeCount,
      cuotaFijaPorInquilino: parseFloat(cuotaFija.toFixed(2)),
      recibosCalculados: recibos,
    };

    try {
      let saved;
      if (existing) {
        const res = await fetch("/api/historial", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id, ...record }),
        });
        saved = await res.json();
      } else {
        const res = await fetch("/api/historial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
        });
        saved = await res.json();
      }

      // Actualizar historial local sin fetchHistorial para no resetear lecturas
      const savedRecord = { ...record, id: saved?.id || existing?.id || Date.now() };
      setHistorial((prev) =>
        existing
          ? prev.map((h) => (h.id === existing.id ? savedRecord : h))
          : [...prev, savedRecord]
      );
    } catch (err) {
      console.error("Error saving historial:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400 text-sm">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Section */}
      <section>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            <PeriodSelector
              month={periodoMonth}
              year={periodoYear}
              onPrev={goToPrevPeriod}
              onNext={goToNextPeriod}
              isCurrentMonth={isCurrentMonth}
              minMonth={minMonth}
              minYear={minYear}
            />
            <PdfUploadZone onPdfProcessed={handlePdfProcessed} />
          </div>
          <StatsCards
            totalFixed={totalFixed}
            precioKwh={charges.precioKwh}
            activeCount={activeTenants.length}
            fixedPerTenant={fixedPerTenant}
          />
        </div>
      </section>

      {/* Table + Receipt */}
      <section className="flex flex-col lg:flex-row gap-8">
        <MeterTable
          tenants={tenantsWithLecturas}
          periodoLabel={periodoLabel}
          mesAnteriorShort={mesAnteriorShort}
          mesActualShort={mesActualShort}
          onToggleActive={handleToggleActive}
          onUpdateLectura={handleUpdateLectura}
          onSelectTenant={setSelectedTenantId}
          selectedTenantId={selectedTenantId}
          onShowHistory={setShowHistoryModal}
        />
        {selectedTenant && (
          <ReceiptPanel
            tenant={selectedTenant}
            charges={charges}
            periodoMonth={periodoMonth}
            periodoLabel={periodoLabel}
            totalFixed={totalFixed}
            fixedPerTenant={fixedPerTenant}
            activeTenantCount={activeTenants.length}
            otrosCargos={otrosCargos}
            onClose={() => setSelectedTenantId(null)}
          />
        )}
      </section>

      {/* Manual/Confirm Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { setShowManualModal(false); setAutoFilledData(null); }}>
          <ManualInputModal
            charges={charges}
            autoFilled={autoFilledData}
            onApply={handleApplyCharges}
            onClose={() => { setShowManualModal(false); setAutoFilledData(null); }}
          />
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowHistoryModal(null)}>
          <HistoryModal tenant={showHistoryModal} historial={historial} onClose={() => setShowHistoryModal(null)} />
        </div>
      )}
    </div>
  );
}
