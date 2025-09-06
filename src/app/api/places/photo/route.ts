import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const photoReference = searchParams.get('photo_reference');
  const maxWidth = searchParams.get('maxwidth') || '400';

  if (!photoReference) {
    return NextResponse.json({ error: 'Photo reference is required' }, { status: 400 });
  }

  try {
    // Google Places Photo APIを呼び出し
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/photo?photo_reference=${photoReference}&maxwidth=${maxWidth}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 画像データをそのまま返す
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 24時間キャッシュ
      },
    });
  } catch (error) {
    console.error('Google Places Photo API error:', error);
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 });
  }
}
