import { NextRequest, NextResponse } from 'next/server';

// OSM要素の型定義
interface OSMElement {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

// Overpass APIレスポンスの型定義
interface OverpassResponse {
  elements: OSMElement[];
}

// 決済方法データの型定義
interface PaymentData {
  id: number;
  type: string;
  lat?: number;
  lng?: number;
  name: string;
  address: string;
  supportedPayments: string[];
  tags: Record<string, string>;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '1000';

  console.log('OSM Payment Methods API called with:', { lat, lng, radius });

  if (!lat || !lng) {
    console.error('Missing required parameters: lat and lng');
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  try {
    // まずは最小限のテストクエリ
    const bbox = `${parseFloat(lng) - 0.005},${parseFloat(lat) - 0.005},${parseFloat(lng) + 0.005},${parseFloat(lat) + 0.005}`;
    
    console.log('Using bbox:', bbox);
    
    // 非常にシンプルなOverpass APIクエリ
    const overpassQuery = `
[out:json][timeout:10];
(
  node["shop"="convenience"](${bbox});
);
out tags;
`;

    console.log('Sending Overpass query:', overpassQuery);

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    console.log('Overpass API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Overpass API error response:', errorText);
      throw new Error(`Overpass API error! status: ${response.status}, response: ${errorText}`);
    }

    const data = await response.json() as OverpassResponse;
    console.log('Overpass API returned', data.elements?.length || 0, 'elements');
    
    // 決済方法タグを持つ店舗のみをフィルタリング
    const paymentData: PaymentData[] = data.elements?.filter((element: OSMElement) => {
      const tags = element.tags || {};
      return Object.keys(tags).some(tag => tag.startsWith('payment:'));
    }).map((element: OSMElement) => {
      const tags = element.tags || {};
      const supportedPayments: string[] = [];
      
      // payment:* タグをチェック
      Object.keys(tags).forEach(tag => {
        if (tag.startsWith('payment:') && tags[tag] === 'yes') {
          supportedPayments.push(tag);
        }
      });
      
      return {
        id: element.id,
        type: element.type,
        lat: element.lat,
        lng: element.lon,
        name: tags.name || 'Unknown',
        address: tags['addr:full'] || tags['addr:street'] || '',
        supportedPayments,
        tags
      };
    }) || [];

    console.log('Processed payment data:', paymentData.length, 'stores with payment methods');

    return NextResponse.json({
      success: true,
      data: paymentData,
      count: paymentData.length
    });

  } catch (error) {
    console.error('OSM Payment Methods API error:', error);
    
    // エラー時は空のデータを返す（アプリがクラッシュしないように）
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}