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
    // より安全なbbox計算
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = parseFloat(radius);
    
    // 座標の有効性をチェック
    if (isNaN(latNum) || isNaN(lngNum) || isNaN(radiusNum)) {
      throw new Error('Invalid coordinates or radius');
    }
    
    // 緯度の範囲チェック
    if (latNum < -90 || latNum > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    
    // 経度の範囲チェック
    if (lngNum < -180 || lngNum > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
    
    // より安全な半径計算（最大5kmに制限）
    const maxRadius = Math.min(radiusNum, 5000);
    const latDelta = maxRadius / 111000; // 緯度1度は約111km
    const lngDelta = maxRadius / (111000 * Math.cos(latNum * Math.PI / 180));
    
    // bboxの境界を計算
    const south = latNum - latDelta;
    const north = latNum + latDelta;
    const west = lngNum - lngDelta;
    const east = lngNum + lngDelta;
    
    // 緯度の範囲を-90から90に制限
    const clampedSouth = Math.max(-90, Math.min(90, south));
    const clampedNorth = Math.max(-90, Math.min(90, north));
    
    // 経度の範囲を-180から180に制限
    const clampedWest = Math.max(-180, Math.min(180, west));
    const clampedEast = Math.max(-180, Math.min(180, east));
    
    const bbox = `${clampedWest},${clampedSouth},${clampedEast},${clampedNorth}`;
    
    console.log('Using bbox:', bbox);
    console.log('Original coords:', { lat: latNum, lng: lngNum });
    console.log('Calculated bounds:', { south: clampedSouth, north: clampedNorth, west: clampedWest, east: clampedEast });
    
    // より安全で効率的なOverpass APIクエリ
    const overpassQuery = `[out:json][timeout:15];
(
  node["shop"~"^(convenience|supermarket|restaurant)$"](${bbox});
  way["shop"~"^(convenience|supermarket|restaurant)$"](${bbox});
);
out center tags;`;

    console.log('Sending Overpass query:', overpassQuery);

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'PayMapKitaQ/1.0'
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    console.log('Overpass API response status:', response.status);

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('Overpass API error response:', errorText);
      } catch (textError) {
        console.error('Failed to read error response:', textError);
        errorText = 'Failed to read error response';
      }
      
      // より詳細なエラー情報を返す
      return NextResponse.json({
        success: false,
        error: `Overpass API error! status: ${response.status}, response: ${errorText}`,
        data: [],
        count: 0
      }, { status: 200 }); // エラーでも200を返してアプリがクラッシュしないように
    }

    let data: OverpassResponse;
    try {
      data = await response.json() as OverpassResponse;
      console.log('Overpass API returned', data.elements?.length || 0, 'elements');
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse Overpass API response',
        data: [],
        count: 0
      }, { status: 200 });
    }
    
    // 決済方法タグを持つ店舗のみをフィルタリング
    const paymentData: PaymentData[] = (data.elements || []).filter((element: OSMElement) => {
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
      
      // 座標を取得（nodeの場合は直接、wayの場合はcenter）
      const elementLat = element.lat || element.center?.lat;
      const elementLng = element.lon || element.center?.lon;
      
      return {
        id: element.id,
        type: element.type,
        lat: elementLat,
        lng: elementLng,
        name: tags.name || 'Unknown',
        address: tags['addr:full'] || tags['addr:street'] || '',
        supportedPayments,
        tags
      };
    });

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