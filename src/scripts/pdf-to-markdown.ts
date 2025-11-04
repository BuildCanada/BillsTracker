#!/usr/bin/env tsx

/*
Usage: tsx src/scripts/pdf-to-markdown.ts <path-to-pdf-file>

Example: tsx src/scripts/pdf-to-markdown.ts files/bill-c-123.pdf

This will create files/bill-c-123.md with the extracted content.
*/

import fs from "node:fs";
import path from "node:path";
import { PDFParse } from "pdf-parse";

async function main() {
  const args = process.argv.slice(2);
  const pdfPath = args[0];

  if (!pdfPath) {
    console.error(
      "Usage: tsx src/scripts/pdf-to-markdown.ts <path-to-pdf-file>",
    );
    console.error(
      "Example: tsx src/scripts/pdf-to-markdown.ts files/bill-c-123.pdf",
    );
    process.exit(1);
  }

  try {
    // Resolve the path - if absolute, use as-is; if relative, resolve from current directory
    const resolvedPdfPath = path.isAbsolute(pdfPath)
      ? pdfPath
      : path.resolve(pdfPath);

    // Check if the file exists
    if (!fs.existsSync(resolvedPdfPath)) {
      console.error(`Error: File not found: ${resolvedPdfPath}`);
      process.exit(1);
    }

    console.log(`Reading PDF: ${resolvedPdfPath}`);

    // Read the PDF file
    const dataBuffer = fs.readFileSync(resolvedPdfPath);

    // Create PDF parser instance
    const parser = new PDFParse({ data: dataBuffer });

    try {
      // Parse the PDF and extract text
      const result = await parser.getText();

      // Extract text content
      const markdownContent = result.text;

      // Create output path with .md extension
      const parsedPath = path.parse(resolvedPdfPath);
      const outputPath = path.join(parsedPath.dir, `${parsedPath.name}.md`);

      // Write the markdown file
      fs.writeFileSync(outputPath, markdownContent, "utf-8");

      console.log(`✓ Successfully converted PDF to markdown`);
      console.log(`  Input:  ${resolvedPdfPath}`);
      console.log(`  Output: ${outputPath}`);
      console.log(`  Pages:  ${result.total}`);
      console.log(`  Length: ${markdownContent.length} characters`);
    } finally {
      // Clean up parser resources
      await parser.destroy();
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
