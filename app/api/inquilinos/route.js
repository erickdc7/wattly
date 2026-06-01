import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "inquilinos.json");

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

// GET → return all tenants
export async function GET() {
  const data = readData();
  return NextResponse.json(data);
}

// POST → add a new tenant
export async function POST(request) {
  const body = await request.json();
  const data = readData();

  const newTenant = {
    id: Date.now(),
    nombre: body.nombre || "",
    habitacion: body.habitacion || "",
    medidorId: body.medidorId || `#${Math.floor(1000 + Math.random() * 9000)}`,
    lecturaAnterior: body.lecturaAnterior || 0,
    activo: body.activo !== undefined ? body.activo : true,
    fechaIngreso: body.fechaIngreso || new Date().toISOString().split("T")[0],
  };

  data.push(newTenant);
  writeData(data);

  return NextResponse.json(newTenant, { status: 201 });
}

// PUT → update a tenant by id
export async function PUT(request) {
  const body = await request.json();
  const { id, ...fieldsToUpdate } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const data = readData();
  const index = data.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  data[index] = { ...data[index], ...fieldsToUpdate };
  writeData(data);

  return NextResponse.json(data[index]);
}

// DELETE → remove a tenant by id (query param)
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id"));

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  let data = readData();
  const before = data.length;
  data = data.filter((t) => t.id !== id);

  if (data.length === before) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  writeData(data);
  return NextResponse.json({ success: true });
}
