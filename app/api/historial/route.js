import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "historial.json");

function readData() {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes");
  const anio = searchParams.get("anio");

  let data = readData();
  if (mes) data = data.filter((h) => h.mes.toLowerCase() === mes.toLowerCase());
  if (anio) data = data.filter((h) => h.anio === parseInt(anio));

  return NextResponse.json(data);
}

export async function POST(request) {
  const body = await request.json();
  const data = readData();

  const newRecord = {
    id: body.id || Date.now(),   // ← USA EL ID DEL BODY SI VIENE, si no genera uno
    mes: body.mes || "",
    anio: body.anio || new Date().getFullYear(),
    archivoPdf: body.archivoPdf || null,
    precioKwh: body.precioKwh || 0,
    cargosCompartidos: body.cargosCompartidos || {
      cargoFijo: 0,
      mantReposicion: 0,
      alumbradoPublico: 0,
      igv: 0,
      electrificacion: 0,
      totalCompartido: 0,
    },
    inquilinosActivos: body.inquilinosActivos || 0,
    cuotaFijaPorInquilino: body.cuotaFijaPorInquilino || 0,
    recibosCalculados: body.recibosCalculados || [],
  };

  // Evitar duplicados — si ya existe un registro con ese id, actualizar en vez de agregar
  const existingIndex = data.findIndex((h) => h.id === newRecord.id);
  if (existingIndex !== -1) {
    data[existingIndex] = { ...data[existingIndex], ...newRecord };
  } else {
    data.push(newRecord);
  }

  writeData(data);
  return NextResponse.json(newRecord, { status: 201 });
}

export async function PUT(request) {
  const body = await request.json();
  const { id, ...fieldsToUpdate } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const data = readData();
  const index = data.findIndex((h) => h.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  data[index] = { ...data[index], ...fieldsToUpdate };
  writeData(data);
  return NextResponse.json(data[index]);
}