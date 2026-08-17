import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import csvParser from "csv-parser";

/*
 * AI WATCHTOWER DOCUMENT SERVICE
 *
 * Supported:
 * PDF
 * DOCX
 * TXT
 * CSV
 */

// =========================================================
// GET DOCUMENT TYPE
// =========================================================

export function getDocumentType(file) {
  if (!file) {
    return null;
  }

  const filename =
    file.originalname ||
    file.filename ||
    file.name ||
    (typeof file === "string" ? file : "");

  const extension = path
    .extname(filename)
    .toLowerCase();

  // Extension-based detection
  if (extension === ".pdf") {
    return "PDF";
  }

  if (extension === ".docx") {
    return "DOCX";
  }

  if (extension === ".txt") {
    return "TXT";
  }

  if (extension === ".csv") {
    return "CSV";
  }

  // MIME fallback
  const mimeType =
    file.mimetype ||
    file.type ||
    "";

  if (mimeType === "application/pdf") {
    return "PDF";
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "DOCX";
  }

  if (mimeType === "text/plain") {
    return "TXT";
  }

  if (
    mimeType === "text/csv" ||
    mimeType === "application/csv"
  ) {
    return "CSV";
  }

  return null;
}

// =========================================================
// GET FILE BUFFER
// =========================================================

async function getFileBuffer(file) {
  if (!file) {
    throw new Error("No file was provided.");
  }

  // Multer memoryStorage
  if (file.buffer) {
    return file.buffer;
  }

  // Multer diskStorage
  if (file.path) {
    const fs = await import("fs/promises");

    return await fs.readFile(file.path);
  }

  if (file.filepath) {
    const fs = await import("fs/promises");

    return await fs.readFile(file.filepath);
  }

  throw new Error(
    "Unable to access uploaded file data."
  );
}

// =========================================================
// PDF EXTRACTION
// pdf-parse v2.x API
// =========================================================

async function extractPdf(file) {
  const buffer = await getFileBuffer(file);

  if (!buffer || buffer.length === 0) {
    throw new Error(
      "PDF file buffer is missing."
    );
  }

  let parser = null;

  try {
    console.log(
      "Starting PDF text extraction..."
    );

    parser = new PDFParse({
      data: buffer,
    });

    const result =
      await parser.getText();

    const text =
      result?.text || "";

    console.log(
      `PDF extraction complete: ${text.length} characters`
    );

    return text.trim();
  } catch (error) {
    console.error(
      "PDF parser error:",
      error
    );

    throw new Error(
      `Unable to extract PDF text: ${
        error?.message ||
        "Unknown PDF parser error"
      }`
    );
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch (destroyError) {
        console.warn(
          "PDF parser cleanup warning:",
          destroyError?.message
        );
      }
    }
  }
}

// =========================================================
// DOCX EXTRACTION
// =========================================================

async function extractDocx(file) {
  const buffer =
    await getFileBuffer(file);

  try {
    console.log(
      "Starting DOCX text extraction..."
    );

    const result =
      await mammoth.extractRawText({
        buffer,
      });

    const text =
      result?.value || "";

    console.log(
      `DOCX extraction complete: ${text.length} characters`
    );

    return text.trim();
  } catch (error) {
    console.error(
      "DOCX parser error:",
      error
    );

    throw new Error(
      `Unable to extract DOCX text: ${
        error?.message ||
        "Unknown DOCX parser error"
      }`
    );
  }
}

// =========================================================
// TXT EXTRACTION
// =========================================================

async function extractTxt(file) {
  const buffer =
    await getFileBuffer(file);

  try {
    const text =
      buffer.toString("utf8");

    console.log(
      `TXT extraction complete: ${text.length} characters`
    );

    return text.trim();
  } catch (error) {
    console.error(
      "TXT parser error:",
      error
    );

    throw new Error(
      `Unable to extract TXT text: ${
        error?.message ||
        "Unknown TXT parser error"
      }`
    );
  }
}

// =========================================================
// CSV EXTRACTION
// =========================================================

async function extractCsv(file) {
  const buffer =
    await getFileBuffer(file);

  return new Promise(
    (resolve, reject) => {
      const rows = [];

      const parser = csvParser();

      parser.on(
        "data",
        (row) => {
          rows.push(row);
        }
      );

      parser.on(
        "end",
        () => {
          try {
            const text =
              rows
                .map((row) =>
                  Object.entries(row)
                    .map(
                      ([key, value]) =>
                        `${key}: ${value}`
                    )
                    .join(" | ")
                )
                .join("\n");

            console.log(
              `CSV extraction complete: ${text.length} characters`
            );

            resolve(
              text.trim()
            );
          } catch (error) {
            reject(
              new Error(
                `Unable to process CSV data: ${
                  error?.message ||
                  "Unknown CSV error"
                }`
              )
            );
          }
        }
      );

      parser.on(
        "error",
        (error) => {
          console.error(
            "CSV parser error:",
            error
          );

          reject(
            new Error(
              `Unable to extract CSV text: ${
                error?.message ||
                "Unknown CSV parser error"
              }`
            )
          );
        }
      );

      parser.end(buffer);
    }
  );
}

// =========================================================
// MAIN DOCUMENT EXTRACTION
// =========================================================

export async function extractDocumentText(
  file
) {
  if (!file) {
    throw new Error(
      "No document was provided."
    );
  }

  console.log(
    "----------------------------------------"
  );

  console.log(
    "Document extraction started"
  );

  console.log(
    "Original name:",
    file.originalname
  );

  console.log(
    "MIME type:",
    file.mimetype
  );

  console.log(
    "Size:",
    file.size
  );

  const documentType =
    getDocumentType(file);

  console.log(
    "Detected document type:",
    documentType
  );

  if (!documentType) {
    throw new Error(
      "Unsupported document type."
    );
  }

  let text = "";

  switch (documentType) {
    case "PDF":
      text =
        await extractPdf(file);
      break;

    case "DOCX":
      text =
        await extractDocx(file);
      break;

    case "TXT":
      text =
        await extractTxt(file);
      break;

    case "CSV":
      text =
        await extractCsv(file);
      break;

    default:
      throw new Error(
        `Unsupported document type: ${documentType}`
      );
  }

  console.log(
    `Final extracted text length: ${text.length}`
  );

  console.log(
    "Document extraction finished"
  );

  console.log(
    "----------------------------------------"
  );

  return text;
}

// =========================================================
// DEFAULT EXPORT
// =========================================================

export default {
  getDocumentType,
  extractDocumentText,
};