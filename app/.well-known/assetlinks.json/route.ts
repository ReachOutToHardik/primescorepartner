import { NextResponse } from 'next/server';

export async function GET() {
  const assetLinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'in.primescore.partner.twa',
        sha256_cert_fingerprints: [
          '6C:4F:6B:63:22:E6:4D:6B:AE:F6:0B:50:57:01:13:27:A0:6D:27:A6:1B:60:A3:06:3A:D3:45:69:E9:89:18:4D',
        ],
      },
    },
  ];

  return NextResponse.json(assetLinks, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
