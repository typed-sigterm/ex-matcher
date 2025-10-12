/**
 * Parse Excel file and extract pairs from columns A and B
 * @param file - The Excel file to parse
 * @returns Array of pairs extracted from the Excel file
 */
export async function parseExcelFile(file: File): Promise<[string, string][]> {
  const XLSX = await import('./xlsx-wrapper');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  if (!workbook.SheetNames.length)
    throw new Error('No sheets found in Excel file');

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const columnA: string[] = [];
  const columnB: string[] = [];

  let rowIndex = 1;
  while (true) {
    const cellA = firstSheet[`A${rowIndex}`];
    const cellB = firstSheet[`B${rowIndex}`];
    if (!cellA && !cellB)
      break;
    columnA.push(cellA ? String(cellA.v).trim() : '');
    columnB.push(cellB ? String(cellB.v).trim() : '');
    rowIndex++;
  }

  if (columnA.length === 0 || columnB.length === 0)
    throw new Error('No valid pairs found in Excel file');

  if (columnA.length !== columnB.length)
    throw new Error(`Row count mismatch: Column A has ${columnA.length} rows, Column B has ${columnB.length} rows`);

  for (let i = 0; i < columnA.length; i++) {
    if (columnA[i] === '' || columnB[i] === '')
      throw new Error(`Empty cell found at row ${i + 1}`);
  }

  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < columnA.length; i++)
    pairs.push([columnA[i], columnB[i]]);

  const allValues = [...columnA, ...columnB];
  const uniqueValues = new Set(allValues);
  if (uniqueValues.size !== allValues.length) {
    const seen = new Set<string>();
    for (const value of allValues) {
      if (seen.has(value)) {
        throw new Error(`Duplicate value found: "${value}"`);
      }
      seen.add(value);
    }
  }
  return pairs;
}
