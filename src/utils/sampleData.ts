import { DataRecord } from '../types';

export const SAMPLE_GRAM_PANCHAYATS = [
  { name: 'Akkalapalli', district: 'Anantapur / Sri Sathya Sai', mandal: 'Hindupur' },
  { name: 'Gollapalli', district: 'Karimnagar', mandal: 'Gollapalli' },
  { name: 'Kothapalli', district: 'Warangal', mandal: 'Kothapalli' },
  { name: 'Rampur', district: 'Nizamabad', mandal: 'Rampur' },
  { name: 'Peddapalli', district: 'Peddapalli', mandal: 'Peddapalli' }
];

export const INITIAL_AKKALAPALLI_DATA: DataRecord[] = [
  {
    'S.No': 1,
    'Name': 'K. Ramanjaneyulu (కె. రామాంజనేయులు)',
    'Mobile': '9848022338',
    'Aadhaar': '5432-8976-1201',
    'RationCard': 'WAP12089301',
    'Ward': 'Ward 1 - Old Village',
    'Status': 'Pending'
  },
  {
    'S.No': 2,
    'Name': 'B. Lakshmi Devi (బి. లక్ష్మీ దేవి)',
    'Mobile': '9440155672',
    'Aadhaar': '6721-9043-4412',
    'RationCard': 'WAP12089302',
    'Ward': 'Ward 2 - Market Road',
    'Status': 'Pending'
  },
  {
    'S.No': 3,
    'Name': 'M. Srinivasulu (ఎం. శ్రీనివాసులు)',
    'Mobile': '9848022338', // DUPLICATE with S.No 1
    'Aadhaar': '3819-2201-9983',
    'RationCard': 'WAP12089303',
    'Ward': 'Ward 1 - Old Village',
    'Status': 'Pending'
  },
  {
    'S.No': 4,
    'Name': 'P. Venkata Subbamma (పి. వెంకట సుబ్బమ్మ)',
    'Mobile': '8008123456',
    'Aadhaar': '4901-8872-3341',
    'RationCard': 'WAP12089304',
    'Ward': 'Ward 3 - Near School',
    'Status': 'Pending'
  },
  {
    'S.No': 5,
    'Name': 'C. Narayana Swamy (సి. నారాయణ స్వామి)',
    'Mobile': '9949876543',
    'Aadhaar': '7823-1190-6542',
    'RationCard': 'WAP12089305',
    'Ward': 'Ward 4 - Temple Street',
    'Status': 'Pending'
  },
  {
    'S.No': 6,
    'Name': 'S. Anjaneyulu (ఎస్. ఆంజనేయులు)',
    'Mobile': '9440155672', // DUPLICATE with S.No 2
    'Aadhaar': '9012-3345-6789',
    'RationCard': 'WAP12089306',
    'Ward': 'Ward 2 - Market Road',
    'Status': 'Pending'
  },
  {
    'S.No': 7,
    'Name': 'G. Pushpavathi (జి. పుష్పవతి)',
    'Mobile': '9177234561',
    'Aadhaar': '2345-6789-0123',
    'RationCard': 'WAP12089307',
    'Ward': 'Ward 3 - Near School',
    'Status': 'Pending'
  },
  {
    'S.No': 8,
    'Name': 'V. Shiva Kumar (వి. శివ కుమార్)',
    'Mobile': '9866543210',
    'Aadhaar': '3456-7890-1234',
    'RationCard': 'WAP12089308',
    'Ward': 'Ward 5 - Colony Area',
    'Status': 'Pending'
  }
];
