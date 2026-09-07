import React from 'react';

interface BrandLogoProps {
  id: string;
  brand: string;
  className?: string;
}

const BRAND_IMAGE_MAP: Record<string, string> = {
  ajio: '/gift_vouchers_images/gift_voucher-ajio.png',
  amazonpay: '/gift_vouchers_images/gift_voucher_amazonpay.png',
  amazon: '/gift_vouchers_images/gift_voucher-amazon.png',
  croma: '/gift_vouchers_images/gift_voucher-croma.png',
  dominos: '/gift_vouchers_images/gift_voucher-domino.png',
  flipkart: '/gift_vouchers_images/gift_voucher-flipkart.png',
  jockey: '/gift_vouchers_images/gift_voucher-jockey.png',
  levis: '/gift_vouchers_images/gift_voucher-levis.png',
  makemytrip: '/gift_vouchers_images/gift_voucher-makemytrip.png',
  myntra: '/gift_vouchers_images/gift_voucher-myntra.png',
  nykaa: '/gift_vouchers_images/gift_voucher-naykaa.png',
  pizzahut: '/gift_vouchers_images/gift_voucher-pizzahut.png',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ id, brand, className = 'h-8' }) => {
  const normId = (id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Direct match or lookup
  let imageSrc = BRAND_IMAGE_MAP[normId] || BRAND_IMAGE_MAP[id];

  if (!imageSrc) {
    if (normId.includes('ajio')) imageSrc = BRAND_IMAGE_MAP.ajio;
    else if (normId.includes('amazonpay') || normId.includes('pay')) imageSrc = BRAND_IMAGE_MAP.amazonpay;
    else if (normId.includes('amazon')) imageSrc = BRAND_IMAGE_MAP.amazon;
    else if (normId.includes('croma')) imageSrc = BRAND_IMAGE_MAP.croma;
    else if (normId.includes('domino')) imageSrc = BRAND_IMAGE_MAP.dominos;
    else if (normId.includes('flipkart')) imageSrc = BRAND_IMAGE_MAP.flipkart;
    else if (normId.includes('jockey')) imageSrc = BRAND_IMAGE_MAP.jockey;
    else if (normId.includes('levi')) imageSrc = BRAND_IMAGE_MAP.levis;
    else if (normId.includes('trip') || normId.includes('makemytrip')) imageSrc = BRAND_IMAGE_MAP.makemytrip;
    else if (normId.includes('myntra')) imageSrc = BRAND_IMAGE_MAP.myntra;
    else if (normId.includes('nykaa') || normId.includes('naykaa')) imageSrc = BRAND_IMAGE_MAP.nykaa;
    else if (normId.includes('pizza') || normId.includes('hut')) imageSrc = BRAND_IMAGE_MAP.pizzahut;
  }

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={brand}
        className={`${className} object-contain rounded-md`}
        loading="lazy"
      />
    );
  }

  return (
    <div className="font-display font-bold text-slate-800 text-sm tracking-tight">{brand}</div>
  );
};

