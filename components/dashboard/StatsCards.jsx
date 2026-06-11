"use client";

const fmt = (n) => n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function StatsCards({ totalFixed, precioKwh, activeCount, fixedPerTenant }) {
  const cards = [
    { label: "Cargos Fijos Totales", value: `S/ ${fmt(totalFixed)}` },
    { label: "Precio kWh", value: `S/ ${precioKwh.toFixed(4)}` },
    { label: "Inquilinos Activos", value: activeCount.toString() },
    { label: "Cuota Fija x Inquilino", value: `S/ ${fmt(fixedPerTenant)}` },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 flex-[1.5]">
      {cards.map((card) => (
        <div key={card.label} className="bg-white p-5 lg:p-6 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-xs font-bold text-[#445963] uppercase tracking-wider">{card.label}</span>
          <div className="mt-2">
            <span className="text-2xl lg:text-3xl font-bold font-['Manrope'] text-[#191c1d]">{card.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
