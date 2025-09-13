import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '50000'; // デフォルト50km

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    let apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=ja&region=jp&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    // 位置情報が提供されている場合は、その周辺で検索
    if (lat && lng) {
      apiUrl += `&location=${lat},${lng}&radius=${radius}`;
    }

    console.log('Google Places Text Search API URL:', apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Google Places Text Search API error:', error);
    return NextResponse.json({ error: 'Failed to search places' }, { status: 500 });
  }
}