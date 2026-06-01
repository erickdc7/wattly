// Helper script — uses CommonJS require which works correctly with pdf-parse v2
// Called by the API route as a child process to avoid ESM/worker issues
const { PDFParse } = require("pdf-parse");
const fs = require("fs");

const filePath = process.argv[2];
if (!filePath) {
  console.error(JSON.stringify({ error: "No file path provided" }));
  process.exit(1);
}

async function main() {
  const buf = fs.readFileSync(filePath);
  const uint8 = new Uint8Array(buf);

  const parser = new PDFParse({ data: uint8, verbosity: 0 });
  await parser.load();
  const result = await parser.getText();
  const text = result.text || "";
  parser.destroy();

  // Output JSON to stdout
  console.log(JSON.stringify({ text }));
}

main().catch((e) => {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
});
