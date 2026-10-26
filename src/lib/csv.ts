function csvCell(value: string | number) {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function downloadCSV(filename: string, rows: Array<Record<string, string | number>>) {
  if (!rows.length) return false;
  const headers = Object.keys(rows[0]);
  const content = [headers.map(csvCell).join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? "")).join(","))].join("\r\n");
  const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}
