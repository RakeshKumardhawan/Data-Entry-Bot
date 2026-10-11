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
        // Check if there is an actual header row in the first 5 rows
        let headerRowIndex = -1;
        for (let r = 0; r < Math.min(5, rawRows.length); r++) {
          const rowStr = (rawRows[r] || []).map((c: any) => String(c).toLowerCase()).join(' ');
          if (rowStr.includes('name') || rowStr.includes('mobile') || rowStr.includes('sl no') || rowStr.includes('sl.no') || rowStr.includes('phone') || rowStr.includes('designation')) {
            headerRowIndex = r;
            break;
          }
        }

        let normalizedData: DataRecord[] = [];

        if (headerRowIndex !== -1) {
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { range: headerRowIndex, defval: '' });

          normalizedData = jsonData.map((row, idx) => {
            let sNo = row['S.No'] || row['s.no'] || row['SNo'] || row['Serial No'] || row['SL.No'] || row['SL No'] || (idx + 1);
            let mobileKey = Object.keys(row).find(k => {
              const clean = k.toLowerCase().replace(/[\s_.]/g, '');
              return ['mobile', 'mobilenumber', 'mobileno', 'phone', 'phonenumber', 'cell', 'contact'].includes(clean);
            });
            let rawMobile = mobileKey ? row[mobileKey] : (row['Mobile'] || row['mobile'] || row['Phone'] || row['Phone Number'] || '');
            let cleanMobile = String(rawMobile).trim().replace(/\.0$/, '').replace(/\D/g, '').slice(-10);

            let nameKey = Object.keys(row).find(k => {
              const clean = k.toLowerCase().replace(/[\s_.]/g, '');
              return ['name', 'traineename', 'citizenname'].includes(clean);
            });
            let name = nameKey ? row[nameKey] : (row['Name'] || row['name'] || `Citizen ${idx + 1}`);

            return {
              ...row,
              'S.No': sNo,
              'Name': name,
              'Mobile': cleanMobile,
              'Status': 'Pending'
            };
          });
        } else {
          // File has NO header row! (Row 0 directly starts with Citizen 1 data)
          normalizedData = rawRows.filter(r => r && r.length > 1 && String(r[1] || '').trim() !== '').map((rowArr, idx) => {
            const rawMobile = rowArr[3] || rowArr[2] || '';
            const cleanMobile = String(rawMobile).trim().replace(/\.0$/, '').replace(/\D/g, '').slice(-10);
            return {
              'S.No': rowArr[0] || (idx + 1),
              'Name': String(rowArr[1] || `Citizen ${idx + 1}`).trim(),
              'Email': String(rowArr[2] && String(rowArr[2]).includes('@') ? rowArr[2] : '').trim(),
              'Mobile': cleanMobile,
              'Designation': String(rowArr[4] || 'Villager').trim(),
              'Organization': String(rowArr[5] || 'Gram Panchayat').trim(),
              'Gender': String(rowArr[6] || 'Male').trim(),
              'Category': String(rowArr[7] || 'SC').trim(),
              'Status': 'Pending'
            };
          });
        }

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
