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
            let mobileKey = Object.keys(row).find(k => {
              const clean = k.toLowerCase().replace(/[\s_.]/g, '');
              return ['mobile', 'mobilenumber', 'mobileno', 'phone', 'phonenumber', 'cell', 'contact', 'మొబైల్', 'మొబైల్నంబర్', 'ఫోన్', 'ఫోన్నంబర్'].some(alias => clean.includes(alias));
            });
            let rawMobile = mobileKey ? row[mobileKey] : (row['Mobile'] || row['mobile'] || row['Phone'] || row['Phone Number'] || '');
            let cleanMobile = String(rawMobile).trim().replace(/\.0$/, '').replace(/\D/g, '').slice(-10);

            // Fallback: If cleanMobile is empty or not 10 digits, scan other columns for a 10-digit phone number
            if (!cleanMobile || cleanMobile.length < 10) {
              for (const [k, v] of Object.entries(row)) {
                if (k.toLowerCase().includes('aadhaar') || k.toLowerCase().includes('ration')) continue;
                const digits = String(v).replace(/\.0$/, '').replace(/\D/g, '');
                if (digits.length === 10 && ['6', '7', '8', '9'].includes(digits[0])) {
                  cleanMobile = digits;
                  break;
                }
              }
            }

            let nameKey = Object.keys(row).find(k => {
              const clean = k.toLowerCase().replace(/[\s_.]/g, '');
              return ['name', 'traineename', 'citizenname', 'candidatename', 'beneficiaryname', 'పేరు', 'ట్రైనీపేరు'].some(alias => clean.includes(alias));
            });
            let sNo = row['SL No'] || row['SL.No'] || row['SL. No'] || row['S.No'] || row['s.no'] || row['SNo'] || row['Serial No'] || row['క్రమ సంఖ్య'] || row['క్ర.సం'] || (idx + 1);

            let genderKey = Object.keys(row).find(k => {
              const clean = k.toLowerCase().replace(/[\s_./]/g, '');
              return ['gender', 'sex', 'malefemale', 'male', 'female', 'లింగము'].some(a => clean.includes(a));
            });
            let gender = genderKey ? String(row[genderKey]).trim() : (row['Male/Female'] || row['Gender'] || 'Male');

            let categoryKey = Object.keys(row).find(k => {
              const clean = k.toLowerCase().replace(/[\s_./()]/g, '');
              return clean.startsWith('category') || ['caste', 'community', 'సామాజికవర్గం', 'కులం'].some(a => clean.includes(a));
            });
            let category = categoryKey ? String(row[categoryKey]).trim() : (row['Category (General, OC, OBC, SC ST)'] || row['Category'] || 'SC');

            let orgKey = Object.keys(row).find(k => {
              const clean = k.toLowerCase().replace(/[\s_./]/g, '');
              return clean.startsWith('org') || clean.includes('organization');
            });
            let organization = orgKey && String(row[orgKey]).trim() ? String(row[orgKey]).trim() : 'Gram Panchayat';

            let desigKey = Object.keys(row).find(k => {
              const clean = k.toLowerCase().replace(/[\s_./]/g, '');
              return clean.startsWith('desig') || clean.includes('designation') || clean.includes('occupation');
            });
            let designation = desigKey && String(row[desigKey]).trim() ? String(row[desigKey]).trim() : (row['Designation'] || 'Villager');

            let emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('mail'));
            let email = emailKey ? String(row[emailKey]).trim() : (row['Email'] || 'NA');

            return {
              ...row,
              'SL No': sNo,
              'S.No': sNo,
              'Name': name,
              'Email': email,
              'Mobile No.': cleanMobile,
              'Mobile': cleanMobile,
              'Designation': designation,
              'Organization': organization,
              'Male/Female': gender,
              'Gender': gender,
              'Category (General, OC, OBC, SC ST)': category,
              'Category': category,
              'Status': 'Pending'
            };
          });
        } else {
          // File has NO header row! (Row 0 directly starts with Citizen 1 data)
          normalizedData = rawRows.filter(r => r && r.length > 1 && String(r[1] || '').trim() !== '').map((rowArr, idx) => {
            const rawMobile = rowArr[3] || rowArr[2] || '';
            const cleanMobile = String(rawMobile).trim().replace(/\.0$/, '').replace(/\D/g, '').slice(-10);
            return {
              'SL No': rowArr[0] || (idx + 1),
              'S.No': rowArr[0] || (idx + 1),
              'Name': String(rowArr[1] || `Citizen ${idx + 1}`).trim(),
              'Email': String(rowArr[2] && String(rowArr[2]).includes('@') ? rowArr[2] : 'NA').trim(),
              'Mobile No.': cleanMobile,
              'Mobile': cleanMobile,
              'Designation': String(rowArr[4] || 'Villager').trim(),
              'Organization': String(rowArr[5] || 'Gram Panchayat').trim(),
              'Male/Female': String(rowArr[6] || 'Male').trim(),
              'Gender': String(rowArr[6] || 'Male').trim(),
              'Category (General, OC, OBC, SC ST)': String(rowArr[7] || 'SC').trim(),
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

export const downloadStandardTemplate = () => {
  const wb = XLSX.utils.book_new();

  // Exact TMP Portal Format matching user template
  const tmpSampleData = [
    {
      'SL No': 1,
      'Name': 'arikilla Srinadh',
      'Email': 'NA',
      'Mobile No.': '9701420587',
      'Designation': 'pravet job',
      'Organization': 'Gram Panchayat',
      'Male/Female': 'Male',
      'Category (General, OC, OBC, SC ST)': 'SC'
    },
    {
      'SL No': 2,
      'Name': 'chapidi mallesh',
      'Email': 'NA',
      'Mobile No.': '9010684220',
      'Designation': 'agriculture',
      'Organization': 'Gram Panchayat',
      'Male/Female': 'Male',
      'Category (General, OC, OBC, SC ST)': 'SC'
    },
    {
      'SL No': 3,
      'Name': 'Durgam Santhosh',
      'Email': 'NA',
      'Mobile No.': '8179128619',
      'Designation': 'Mee seva',
      'Organization': 'Gram Panchayat',
      'Male/Female': 'Male',
      'Category (General, OC, OBC, SC ST)': 'SC'
    },
    {
      'SL No': 4,
      'Name': 'Durgam Mallaiah',
      'Email': 'NA',
      'Mobile No.': '6305785303',
      'Designation': 'agriculture',
      'Organization': 'Gram Panchayat',
      'Male/Female': 'Male',
      'Category (General, OC, OBC, SC ST)': 'SC'
    },
    {
      'SL No': 5,
      'Name': 'kota Lachaiah',
      'Email': 'NA',
      'Mobile No.': '9010138995',
      'Designation': 'labour',
      'Organization': 'Gram Panchayat',
      'Male/Female': 'Male',
      'Category (General, OC, OBC, SC ST)': 'SC'
    },
    {
      'SL No': 6,
      'Name': 'Takire Anitha',
      'Email': 'NA',
      'Mobile No.': '8555918940',
      'Designation': 'agriculture',
      'Organization': 'Gram Panchayat',
      'Male/Female': 'Female',
      'Category (General, OC, OBC, SC ST)': 'OBC'
    },
    {
      'SL No': 7,
      'Name': 'Takire Srinivas',
      'Email': 'NA',
      'Mobile No.': '8555918941',
      'Designation': 'Lebour',
      'Organization': 'Gram Panchayat',
      'Male/Female': 'Male',
      'Category (General, OC, OBC, SC ST)': 'OBC'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(tmpSampleData);
  XLSX.utils.book_append_sheet(wb, ws, 'TMP_Portal_Template');
  XLSX.writeFile(wb, 'TMP_Portal_Template.xlsx');
};

export const exportToExcel = (data: DataRecord[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
};

export const getCleanMobile = (row: DataRecord): string => {
  let raw = '';
  if (row['Mobile No.']) raw = String(row['Mobile No.']);
  else if (row['Mobile']) raw = String(row['Mobile']);
  else if (row['Mobile No']) raw = String(row['Mobile No']);
  else if (row['Mobile Number']) raw = String(row['Mobile Number']);
  else if (row['Phone']) raw = String(row['Phone']);
  else {
    for (const [k, v] of Object.entries(row)) {
      const cleanK = k.toLowerCase().replace(/[\s_.]/g, '');
      if (['mobile', 'mobilenumber', 'mobileno', 'phone', 'phonenumber', 'cell', 'contact', 'మొబైల్', 'ఫోన్'].some(a => cleanK.includes(a))) {
        raw = String(v);
        break;
      }
    }
  }
  return raw.trim().replace(/\.0$/, '').replace(/\D/g, '').slice(-10);
};

export const findDuplicateMobiles = (data: DataRecord[]): DuplicateGroup[] => {
  const mobileMap = new Map<string, DataRecord[]>();

  data.forEach((row) => {
    const mobile = getCleanMobile(row);
    if (!mobile || mobile.length !== 10) return;

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

