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
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

        // Normalize keys and check S.No & Mobile
        const normalizedData: DataRecord[] = jsonData.map((row, idx) => {
          // Normalize S.No if named 'sno', 's.no', 'S.No', 'Serial No', etc.
          let sNo = row['S.No'] || row['s.no'] || row['SNo'] || row['Serial No'] || (idx + 1);
          // Normalize Mobile if named 'Mobile', 'mobile', 'Phone', 'Cell', etc.
          let mobile = row['Mobile'] || row['mobile'] || row['Phone'] || row['Phone Number'] || '';
          
          return {
            ...row,
            'S.No': sNo,
            'Name': row['Name'] || row['name'] || `Citizen ${idx + 1}`,
            'Mobile': String(mobile).trim().replace(/\D/g, '').slice(-10),
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
