import * as XLSX from 'xlsx';

export interface ParseResult {
  success: boolean
  pairs?: Array<[string, string]>
  error?: string
}

/**
 * Parse Excel file and extract pairs from columns A and B
 * @param file - The Excel file to parse
 * @returns ParseResult with pairs or error message
 */
export async function parseExcelFile(file: File): Promise<ParseResult> {
  try {
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Get first sheet
    if (!workbook.SheetNames.length) {
      return {
        success: false,
        error: 'No sheets found in Excel file',
      };
    }

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Extract columns A and B
    const columnA: string[] = [];
    const columnB: string[] = [];
    
    let rowIndex = 1;
    while (true) {
      const cellA = firstSheet[`A${rowIndex}`];
      const cellB = firstSheet[`B${rowIndex}`];
      
      // Stop when both cells are undefined
      if (!cellA && !cellB) {
        break;
      }
      
      columnA.push(cellA ? String(cellA.v).trim() : '');
      columnB.push(cellB ? String(cellB.v).trim() : '');
      rowIndex++;
    }
    
    // Validation: Check if we have any data
    if (columnA.length === 0 || columnB.length === 0) {
      return {
        success: false,
        error: 'No valid pairs found in Excel file',
      };
    }
    
    // Validation: Check if A and B have same row count
    if (columnA.length !== columnB.length) {
      return {
        success: false,
        error: `Row count mismatch: Column A has ${columnA.length} rows, Column B has ${columnB.length} rows`,
      };
    }
    
    // Validation: Check for empty cells
    for (let i = 0; i < columnA.length; i++) {
      if (columnA[i] === '' || columnB[i] === '') {
        return {
          success: false,
          error: `Empty cell found at row ${i + 1}`,
        };
      }
    }
    
    // Create pairs
    const pairs: Array<[string, string]> = [];
    for (let i = 0; i < columnA.length; i++) {
      pairs.push([columnA[i], columnB[i]]);
    }
    
    // Validation: Check for duplicate values (fail early)
    const allValues = [...columnA, ...columnB];
    const uniqueValues = new Set(allValues);
    if (uniqueValues.size !== allValues.length) {
      // Find the first duplicate
      const seen = new Set<string>();
      for (const value of allValues) {
        if (seen.has(value)) {
          return {
            success: false,
            error: `Duplicate value found: "${value}"`,
          };
        }
        seen.add(value);
      }
    }
    
    return {
      success: true,
      pairs,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
