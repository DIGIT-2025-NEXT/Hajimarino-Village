// Google Places APIを使用して店舗情報を取得
export interface GooglePlace {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
  };
}

export interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_phone_number?: string;
  opening_hours?: {
    weekday_text: string[];
    open_now?: boolean;
  };
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  // 写真情報を追加
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
    html_attributions: string[];
  }>;
}

// 周辺の店舗を検索（Next.js API Route経由）
export const searchNearbyStores = async (
  lat: number, 
  lng: number, 
  radius: number = 1000,
  type: string = 'store'
): Promise<GooglePlace[]> => {
  try {
    const response = await fetch(
      `/api/places?lat=${lat}&lng=${lng}&radius=${radius}&type=${type}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    return data.results || [];
  } catch (error) {
    console.error('Google Places API error:', error);
    return [];
  }
};

// テキスト検索で店舗を検索（新機能）
export const searchStoresByText = async (
  query: string,
  lat?: number,
  lng?: number,
  radius: number = 50000
): Promise<GooglePlace[]> => {
  try {
    let apiUrl = `/api/places/search?query=${encodeURIComponent(query)}`;
    
    if (lat && lng) {
      apiUrl += `&lat=${lat}&lng=${lng}&radius=${radius}`;
    }

    console.log('Searching stores by text:', query);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    return data.results || [];
  } catch (error) {
    console.error('Google Places Text Search API error:', error);
    return [];
  }
};

// 店舗の詳細情報を取得（Next.js API Route経由）
export const getPlaceDetails = async (placeId: string): Promise<GooglePlaceDetails | null> => {
  try {
    const response = await fetch(`/api/places/details?place_id=${placeId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    return data.result;
  } catch (error) {
    console.error('Google Places API error:', error);
    return null;
  }
};

// 複数の店舗タイプで検索
export const searchMultipleStoreTypes = async (
  lat: number, 
  lng: number, 
  radius: number = 1000
): Promise<GooglePlace[]> => {
  const storeTypes = [
    'store',
    'convenience_store',
    'supermarket',
    'restaurant',
    'food',
    'shopping_mall',
    // 追加の店舗タイプ
    'bakery',
    'cafe',
    'clothing_store',
    'electronics_store',
    'furniture_store',
    'hardware_store',
    'jewelry_store',
    'shoe_store',
    'book_store',
    'pharmacy',
    'gas_station',
    'atm',
    'bank',
    'post_office'
  ];
  
  const allResults: GooglePlace[] = [];
  
  for (const type of storeTypes) {
    try {
      const results = await searchNearbyStores(lat, lng, radius, type);
      allResults.push(...results);
    } catch (error) {
      console.error(`Error searching for ${type}:`, error);
    }
  }
  
  // 重複を除去
  const uniqueResults = allResults.filter((place, index, self) => 
    index === self.findIndex(p => p.place_id === place.place_id)
  );
  
  return uniqueResults;
};


