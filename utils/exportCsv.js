// utils/exportCsv.js
// Turns the alumni list into a CSV file and opens the phone's Share menu.
// CSV = "Comma Separated Values": a simple text table that Excel / Google Sheets can open.
// Each line is one row, and commas separate the columns.

import { File, Paths } from "expo-file-system"; // writes files on the phone
import * as Sharing from "expo-sharing"; // opens the phone's Share menu

// Put one value in quotes so commas or quotes inside it don't break the table.
// Example: Google, Inc  ->  "Google, Inc"     and   say "hi"  ->  "say ""hi"""
function csvCell(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return '"' + text.replace(/"/g, '""') + '"';
}

// Build the CSV text from a list of alumni objects.
export function buildAlumniCsv(alumni) {
  const header = [
    "Name",
    "Email",
    "Branch",
    "Graduation Year",
    "Company",
    "Job Title",
    "Phone",
    "LinkedIn",
    "Verified",
  ];

  // One row per alumnus, in the same order as the header.
  const rows = alumni.map((person) => [
    person.name,
    person.email,
    person.branch,
    person.graduationYear,
    person.company,
    person.jobTitle,
    person.phone,
    person.linkedin,
    person.verified ? "Yes" : "No",
  ]);

  // Join cells with commas, and rows with new lines.
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

// Save the CSV to a file and open the Share menu (WhatsApp, Gmail, Drive...).
export async function shareAlumniCsv(alumni) {
  // 1. Create (or replace) a file called alumni.csv in the app's cache folder.
  const file = new File(Paths.cache, "alumni.csv");
  file.create({ overwrite: true });

  // 2. Write the CSV text into it.
  await file.write(buildAlumniCsv(alumni));

  // 3. Open the Share menu with that file.
  await Sharing.shareAsync(file.uri, {
    mimeType: "text/csv", // tells Android it's a CSV file
    UTI: "public.comma-separated-values-text", // tells iPhone it's a CSV file
    dialogTitle: "Share alumni data",
  });
}
