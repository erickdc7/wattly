import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "configuracion.json");

function readData() {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      nombrePropiedad: "Wattly",
      propietario: "Erick Díaz",
      totalHabitaciones: 5,
      otrosCargos: 2.0,
    };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// GET → return configuration
export async function GET() {
  const data = readData();
  return NextResponse.json(data);
}

// PUT → update configuration
export async function PUT(request) {
  const body = await request.json();

  const data = readData();
  const updated = { ...data, ...body };
  writeData(updated);

  return NextResponse.json(updated);
}
