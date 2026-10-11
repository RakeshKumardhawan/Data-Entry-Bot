import * as XLSX from 'xlsx';
import { DataRecord, DuplicateGroup } from '../types';

export const parseExcelFile = async (file: File): Promise<DataRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });
        let headerRowIndex = 0;
        // Check if row 0 is a title banner (e.g. 'Orientation on GPDP...') and row 1 contains 'SL No', 'Name', 'Mobile No.'
        if (rawRows.length > 1) {
          const row1Str = (rawRows[1] || []).map((c: any) => String(c).toLowerCase()).join(' ');
          if (row1Str.includes('name') || row1Str.includes('mobile') || row1Str.includes('sl no') || row1Str.includes('phone')) {
            headerRowIndex = 1;
          }
        }
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { range: headerRowIndex, defval: '' });

        // Normalize keys and check S.No & Mobile
        const normalizedData: DataRecord[] = jsonData.map((row, idx) => {
          // Normalize S.No if named 'sno', 's.no', 'S.No', 'Serial No', etc.
          let sNo = row['S.No'] || row['s.no'] || row['SNo'] || row['Serial No'] || (idx + 1);
          // Smart search for Mobile column regardless of spaces or case
          let mobileKey = Object.keys(row).find(k => {
            const clean = k.toLowerCase().replace(/[\s_.]/g, '');
            return ['mobile', 'mobilenumber', 'mobileno', 'phone', 'phonenumber', 'cell', 'contact'].includes(clean);
          });
          let rawMobile = mobileKey ? row[mobileKey] : (row['Mobile'] || row['mobile'] || row['Phone'] || row['Phone Number'] || '');
          let cleanMobile = String(rawMobile).trim().replace(/\.0$/, '').replace(/\D/g, '').slice(-10);
          
          return {
            ...row,
            'S.No': sNo,
            'Name': row['Name'] || row['name'] || `Citizen ${idx + 1}`,
            'Mobile': cleanMobile,
            'Status': 'Pending'
          };
        });

        resolve(normalizedData);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (data: DataRecord[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
};

export const findDuplicateMobiles = (data: DataRecord[]): DuplicateGroup[] => {
  const mobileMap = new Map<string, DataRecord[]>();

  data.forEach((row) => {
    const mobile = String(row['Mobile'] || '').trim();
    if (!mobile) return;

    if (!mobileMap.has(mobile)) {
      mobileMap.set(mobile, []);
    }
    mobileMap.get(mobile)!.push(row);
  });

  const duplicateGroups: DuplicateGroup[] = [];

  mobileMap.forEach((records, mobile) => {
    if (records.length > 1) {
      duplicateGroups.push({
        mobile,
        records,
        count: records.length
      });
    }
  });

  return duplicateGroups;
};
