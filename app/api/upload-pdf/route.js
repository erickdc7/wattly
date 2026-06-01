import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execFileAsync = promisify(execFile);
const PDFS_DIR = path.join(process.cwd(), "public", "pdfs");
const PARSE_SCRIPT = path.join(process.cwd(), "lib", "parse-pdf.cjs");

// POST → accept PDF, save to public/pdfs/, parse and extract values
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No se proporcionó un archivo PDF" }, { status: 400 });
    }

    // Ensure pdfs directory exists
    if (!fs.existsSync(PDFS_DIR)) {
      fs.mkdirSync(PDFS_DIR, { recursive: true });
    }

    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filepath = path.join(PDFS_DIR, filename);
    fs.writeFileSync(filepath, buffer);

    console.log(`\n📄 PDF recibido: ${filename} (${buffer.length} bytes)`);

    // ── Parse PDF via child process (avoids ESM/worker issues) ──
    let text = "";
    try {
      const { stdout } = await execFileAsync("node", [PARSE_SCRIPT, filepath], { timeout: 15000 });
      const parsed = JSON.parse(stdout.trim());
      text = parsed.text || "";
      console.log(`✅ PDF parseado exitosamente (${text.length} caracteres)`);
    } catch (parseErr) {
      console.error("❌ Error al parsear PDF:", parseErr.message);
      return NextResponse.json(
        { error: `Error al leer el PDF: ${parseErr.message}` },
        { status: 500 }
      );
    }

    console.log(`\n📝 Texto extraído (primeros 500 chars):\n---\n${text.substring(0, 500)}\n---\n`);

    // ── Extract values ──
    const extracted = {
      cargoFijo: null,
      mantReposicion: null,
      alumbradoPublico: null,
      igv: null,
      electrificacion: null,
      precioKwh: null,
      archivoPdf: filename,
    };

    // Strategy 1: Parse the label-value block (Luz del Sur format)
    // Labels appear as separate lines, followed by numeric value lines
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const cargoFijoIdx = lines.findIndex((l) => /^cargo\s*fijo$/i.test(l));

    if (cargoFijoIdx >= 0) {
      console.log(`📋 Bloque de cargos encontrado en línea ${cargoFijoIdx}: "${lines[cargoFijoIdx]}"`);

      // Skip label lines until we hit the first numeric value
      let i = cargoFijoIdx;
      while (i < lines.length && !/^-?\d+[.,]\d{2}$/.test(lines[i])) {
        i++;
      }

      // Collect consecutive numeric values
      const values = [];
      for (let j = i; j < lines.length && values.length < 10; j++) {
        const numMatch = lines[j].match(/^-?([\d]+[.,]\d{2})$/);
        if (numMatch) {
          values.push(parseFloat(numMatch[1].replace(",", ".")));
        } else {
          break;
        }
      }

      console.log(`📊 Valores numéricos: [${values.join(", ")}]`);

      // Luz del Sur order:
      // 0: Cargo Fijo, 1: Mant y Reposición, 2: Alumbrado Público
      // 3: Interés Compensatorio, 4: SUBTOTAL
      // 5: IGV, 6: Electrificación Rural
      if (values.length >= 7) {
        extracted.cargoFijo = values[0];
        extracted.mantReposicion = values[1];
        extracted.alumbradoPublico = values[2];
        extracted.igv = values[5];
        extracted.electrificacion = values[6];
      } else if (values.length >= 3) {
        extracted.cargoFijo = values[0] || null;
        extracted.mantReposicion = values[1] || null;
        extracted.alumbradoPublico = values[2] || null;
      }
    }

    // Strategy 2: Regex fallback for any missed fields
    if (extracted.cargoFijo === null) {
      extracted.cargoFijo = extractRegex(text, [/cargo\s*fijo[^0-9]*([\d]+[.,]\d{2})/i]);
    }
    if (extracted.mantReposicion === null) {
      extracted.mantReposicion = extractRegex(text, [
        /mant[.\s]*(?:y\s*)?repos[^0-9]*([\d]+[.,]\d{2})/i,
        /reposici[oó]n[^0-9]*([\d]+[.,]\d{2})/i,
      ]);
    }
    if (extracted.alumbradoPublico === null) {
      extracted.alumbradoPublico = extractRegex(text, [/alumbrado[^0-9]*([\d]+[.,]\d{2})/i]);
    }
    if (extracted.igv === null) {
      extracted.igv = extractRegex(text, [/\bIGV\b[^0-9]*([\d]+[.,]\d{2})/i]);
    }
    if (extracted.electrificacion === null) {
      extracted.electrificacion = extractRegex(text, [/electrificaci[oó]n[^0-9]*([\d]+[.,]\d{2})/i]);
    }

    // Precio kWh — "X 0.5823 Consumo" or standalone 0.XXXX near kWh
    extracted.precioKwh = extractRegex(text, [
      /X\s+(0[.,]\d{4})\s+Consumo/i,
      /kWh[\s\S]{0,30}?(0[.,]\d{4})/i,
      /(0[.,]\d{4})\s*Consumo/i,
      /(0[.,]\d{4})/,
    ]);

    // Log results
    console.log("\n🔍 Resultados de extracción:");
    const fieldLabels = {
      cargoFijo: "Cargo Fijo",
      mantReposicion: "Mant. y Reposición",
      alumbradoPublico: "Alumbrado Público",
      igv: "IGV 18%",
      electrificacion: "Electrificación Rural",
      precioKwh: "Precio por kWh",
    };
    let foundCount = 0;
    for (const [key, label] of Object.entries(fieldLabels)) {
      if (extracted[key] !== null) {
        console.log(`  ✅ ${label}: ${extracted[key]}`);
        foundCount++;
      } else {
        console.log(`  ⚠️  ${label}: NO ENCONTRADO`);
      }
    }
    console.log(`\n📊 Resumen: ${foundCount}/6 valores encontrados\n`);

    return NextResponse.json(extracted);
  } catch (err) {
    console.error("❌ Error general procesando PDF:", err);
    return NextResponse.json(
      { error: `Error procesando PDF: ${err.message}`, details: err.message },
      { status: 500 }
    );
  }
}

function extractRegex(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleaned = match[1].replace(",", ".");
      const value = parseFloat(cleaned);
      if (!isNaN(value) && value > 0) return value;
    }
  }
  return null;
}
