// Production Application Constants

export const STATE_NAME_TO_ID: Record<string, string> = {
  'Andaman and Nicobar Islands': 'IN-AN',
  'Andhra Pradesh': 'IN-AP',
  'Arunachal Pradesh': 'IN-AR',
  'Assam': 'IN-AS',
  'Bihar': 'IN-BR',
  'Chandigarh': 'IN-CH',
  'Chhattisgarh': 'IN-CT',
  'Dadra and Nagar Haveli and Daman and Diu': 'IN-DN',
  'Delhi': 'IN-DL',
  'Goa': 'IN-GA',
  'Gujarat': 'IN-GJ',
  'Haryana': 'IN-HR',
  'Himachal Pradesh': 'IN-HP',
  'Jammu and Kashmir': 'IN-JK',
  'Jharkhand': 'IN-JH',
  'Karnataka': 'IN-KA',
  'Kerala': 'IN-KL',
  'Ladakh': 'IN-LA',
  'Lakshadweep': 'IN-LD',
  'Madhya Pradesh': 'IN-MP',
  'Maharashtra': 'IN-MH',
  'Manipur': 'IN-MN',
  'Meghalaya': 'IN-ML',
  'Mizoram': 'IN-MZ',
  'Nagaland': 'IN-NL',
  'Odisha': 'IN-OR',
  'Puducherry': 'IN-PY',
  'Punjab': 'IN-PB',
  'Rajasthan': 'IN-RJ',
  'Sikkim': 'IN-SK',
  'Tamil Nadu': 'IN-TN',
  'Telangana': 'IN-TG',
  'Tripura': 'IN-TR',
  'Uttar Pradesh': 'IN-UP',
  'Uttarakhand': 'IN-UT',
  'West Bengal': 'IN-WB',
};

export const STATE_ID_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_NAME_TO_ID).map(([name, id]) => [id, name])
);

export const INDIAN_STATES: string[] = Object.keys(STATE_NAME_TO_ID);

export const PROFESSION_OPTIONS = [
  'Direct Selling Agent (DSA)',
  'Chartered Accountant (CA)',
  'Company Secretary (CS)',
  'Loan Consultant',
  'Financial Advisor',
  'Insurance Agent',
  'Real Estate Agent',
  'Business Consultant',
  'Other',
];

export const SERVICE_OPTIONS = [
  'Bureau Report (All 4 Bureaus)',
  'Multi-Bureau Report',
  'Credit Rectification',
  'Loan Advisory',
  'Credit Score Improvement',
  'Dispute Resolution',
];

export const GIFT_CARDS = [
  { id: 'amazon', brand: 'Amazon Pay', logo: '🛒', color: '#FF9900', denominations: [100, 250, 500, 1000] },
  { id: 'flipkart', brand: 'Flipkart', logo: '🛍️', color: '#2874F0', denominations: [100, 250, 500, 1000] },
  { id: 'swiggy', brand: 'Swiggy', logo: '🍔', color: '#FC8019', denominations: [100, 250, 500] },
  { id: 'phonepay', brand: 'PhonePe', logo: '📱', color: '#5F259F', denominations: [100, 250, 500, 1000] },
  { id: 'myntra', brand: 'Myntra', logo: '👗', color: '#FF3F6C', denominations: [250, 500, 1000] },
  { id: 'irctc', brand: 'IRCTC', logo: '🚂', color: '#003580', denominations: [500, 1000] },
];
