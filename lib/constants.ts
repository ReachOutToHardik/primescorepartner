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

export interface GiftCardDefinition {
  id: string;
  brand: string;
  image: string;
  logo?: string;
  color: string;
  denominations: number[];
  expiryMonths: number;
  category: string;
  description: string;
  terms?: string[];
}

export const HOW_TO_REDEEM_STEPS = [
  {
    step: 1,
    title: 'Select Value',
    description: 'Choose voucher amount and click Redeem.',
  },
  {
    step: 2,
    title: 'Confirm Points',
    description: 'Points deducted directly from your wallet balance.',
  },
  {
    step: 3,
    title: 'Admin Review',
    description: 'Fast verification and approval by our team.',
  },
  {
    step: 4,
    title: 'Instant Delivery',
    description: 'Voucher code & PIN sent via SMS and email.',
  },
];

export const GIFT_CARDS: GiftCardDefinition[] = [
  {
    id: 'ajio',
    brand: 'AJIO',
    image: '/gift_vouchers_images/gift_voucher-ajio.png',
    color: '#2C4152',
    denominations: [1000, 2000],
    expiryMonths: 12,
    category: 'Fashion & Apparel',
    description:
      'Redeem PrimePoints for an official AJIO Gift Voucher. Shop handpicked trends, clothing, footwear, and accessories from leading national and international fashion labels on the AJIO app and website.',
    terms: [
      'Valid for 12 months from the date of issuance.',
      'Redeemable on AJIO mobile app and website (ajio.com).',
      'Non-refundable, non-transferable, and cannot be exchanged for cash.',
      'Subject to partner merchant terms, promotional policies, and availability.',
    ],
  },
  {
    id: 'amazonpay',
    brand: 'Amazon Pay',
    image: '/gift_vouchers_images/gift_voucher_amazonpay.png',
    color: '#002F36',
    denominations: [1000],
    expiryMonths: 12,
    category: 'Payments & Bills',
    description:
      'Redeem PrimePoints for Amazon Pay balance. Pay utility bills, mobile recharges, book travel, or checkout across 10,000+ partner apps seamlessly.',
    terms: [
      'Valid for 12 months from the date of issue.',
      'Applicable on all Amazon Pay bill payments, recharges, and partner checkouts.',
      'Non-reloadable, non-refundable, and cannot be transferred to bank accounts.',
      'Usage subject to Amazon Pay terms of service and fair usage guidelines.',
    ],
  },
  {
    id: 'amazon',
    brand: 'Amazon Shopping',
    image: '/gift_vouchers_images/gift_voucher-amazon.png',
    color: '#FF9900',
    denominations: [1000, 2000, 5000],
    expiryMonths: 12,
    category: 'E-Commerce Marketplace',
    description:
      "Convert PrimePoints into Amazon.in Shopping vouchers. Valid on millions of electronics, fashion, home essentials, and groceries across India.",
    terms: [
      'Valid for 12 months from the date of issuance.',
      'Redeemable across all categories on Amazon.in (excluding gift card purchases).',
      'Non-refundable and cannot be exchanged or redeemed for cash.',
      'Subject to Amazon marketplace policies and product merchant availability.',
    ],
  },
  {
    id: 'croma',
    brand: 'Croma',
    image: '/gift_vouchers_images/gift_voucher-croma.png',
    color: '#00B1A9',
    denominations: [1000, 2000, 5000],
    expiryMonths: 12,
    category: 'Electronics & Gadgets',
    description:
      'Redeem for official Croma Gift Vouchers by Tata. Valid on smartphones, laptops, smart TVs, and home appliances online at croma.com and 500+ stores.',
    terms: [
      'Valid for 12 months from the date of issuance.',
      'Redeemable at 500+ Croma retail stores and online on croma.com.',
      'Non-refundable, non-cancellable, and cannot be encashed.',
      'Brand reserves the right to verify voucher details and amend policies.',
    ],
  },
  {
    id: 'dominos',
    brand: 'Dominos',
    image: '/gift_vouchers_images/gift_voucher-domino.png',
    color: '#006491',
    denominations: [1000],
    expiryMonths: 6,
    category: 'Food & Dining',
    description:
      "Redeem for official Domino's Pizza vouchers. Valid for hot pizzas, pastas, and sides on Domino's India app, website, and dine-in outlets.",
    terms: [
      'Valid for 6 months from the date of issuance.',
      "Redeemable on Domino's India mobile app, website, and dine-in outlets.",
      'Non-refundable and cannot be combined with certain promotional coupon codes.',
      'Subject to outlet operational hours, delivery radius, and stock availability.',
    ],
  },
  {
    id: 'flipkart',
    brand: 'Flipkart',
    image: '/gift_vouchers_images/gift_voucher-flipkart.png',
    color: '#2874F0',
    denominations: [1000, 2000],
    expiryMonths: 12,
    category: 'Online Shopping',
    description:
      'Redeem PrimePoints for Flipkart Gift Vouchers. Valid on electronics, mobiles, fashion, and home appliances on the Flipkart app and website.',
    terms: [
      'Valid for 12 months from the date of issue.',
      'Redeemable on Flipkart mobile app and website.',
      'Non-refundable, non-transferable, and cannot be reloaded or encashed.',
      'Subject to Flipkart standard platform guidelines and seller terms.',
    ],
  },
  {
    id: 'jockey',
    brand: 'Jockey',
    image: '/gift_vouchers_images/gift_voucher-jockey.png',
    color: '#002B49',
    denominations: [1000, 2000, 5000],
    expiryMonths: 12,
    category: 'Apparel & Athleisure',
    description:
      'Redeem for official Jockey Gift Vouchers. Valid for premium innerwear, activewear, loungewear, and athleisure at exclusive stores and jockey.in.',
    terms: [
      'Valid for 12 months from the date of issuance.',
      'Redeemable at exclusive Jockey stores and online at jockey.in.',
      'Non-refundable and cannot be exchanged for cash or credit balance.',
      'Subject to store inventory availability and partner retail policies.',
    ],
  },
  {
    id: 'levis',
    brand: "Levi's",
    image: '/gift_vouchers_images/gift_voucher-levis.png',
    color: '#C41230',
    denominations: [1000, 2000, 5000],
    expiryMonths: 12,
    category: 'Denim & Casuals',
    description:
      "Redeem for official Levi's Gift Vouchers. Valid on classic 501 jeans, denim jackets, shirts, and casual lifestyle apparel across Levi's stores and online.",
    terms: [
      'Valid for 12 months from the date of issuance.',
      "Redeemable at official Levi's retail outlets and levis.in.",
      'Non-refundable, non-negotiable, and cannot be redeemed for cash.',
      'Subject to seasonal promotional terms and partner brand guidelines.',
    ],
  },
  {
    id: 'makemytrip',
    brand: 'MakeMyTrip',
    image: '/gift_vouchers_images/gift_voucher-makemytrip.png',
    color: '#E42529',
    denominations: [1000, 2000, 5000],
    expiryMonths: 12,
    category: 'Travel & Holidays',
    description:
      'Convert PrimePoints into MakeMyTrip Gift Vouchers. Valid on domestic and international flights, hotel stays, holidays, and train bookings.',
    terms: [
      'Valid for 12 months from the date of issuance.',
      'Redeemable on MakeMyTrip website and mobile app.',
      'Non-refundable, non-cancellable, and cannot be encashed.',
      'Subject to airline/hotel availability, fair booking policies, and partner terms.',
    ],
  },
  {
    id: 'myntra',
    brand: 'Myntra',
    image: '/gift_vouchers_images/gift_voucher-myntra.png',
    color: '#FF3F6C',
    denominations: [1000, 2000, 2500],
    expiryMonths: 12,
    category: 'Fashion & Lifestyle',
    description:
      'Redeem for official Myntra Gift Vouchers. Access over 5,000+ top fashion, footwear, beauty, and lifestyle brands on the Myntra app and website.',
    terms: [
      'Valid for 12 months from the date of issuance.',
      'Redeemable on Myntra app and website.',
      'Non-refundable and cannot be transferred to another user account.',
      'Subject to Myntra marketplace terms and catalogue availability.',
    ],
  },
  {
    id: 'nykaa',
    brand: 'Nykaa',
    image: '/gift_vouchers_images/gift_voucher-naykaa.png',
    color: '#FC2779',
    denominations: [1000, 2000, 2500],
    expiryMonths: 12,
    category: 'Beauty & Cosmetics',
    description:
      "Redeem for official Nykaa Gift Vouchers. Valid on 100% authentic luxury cosmetics, skincare, haircare, and fragrances on Nykaa app and retail stores.",
    terms: [
      'Valid for 12 months from the date of issuance.',
      'Redeemable on Nykaa app, nykaa.com, and Nykaa Luxe stores.',
      'Non-refundable, non-transferable, and cannot be exchanged for cash.',
      'Subject to brand inventory availability and Nykaa terms of service.',
    ],
  },
  {
    id: 'pizzahut',
    brand: 'Pizza Hut',
    image: '/gift_vouchers_images/gift_voucher-pizzahut.png',
    color: '#EE3124',
    denominations: [1000],
    expiryMonths: 6,
    category: 'Food & Dining',
    description:
      'Redeem for official Pizza Hut vouchers. Valid for freshly baked pizzas, pastas, and appetizers across participating restaurants and the mobile app.',
    terms: [
      'Valid for 6 months from the date of issuance.',
      'Redeemable across participating Pizza Hut outlets and mobile app.',
      'Non-refundable and cannot be clubbed with selective promotional deals.',
      'Subject to store operating hours, local delivery radius, and availability.',
    ],
  },
];
