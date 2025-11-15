import { useState, useCallback } from 'react';
import { Store, PaymentMethod } from '@/types/store';
import { searchStoresByText, getPlaceDetails, GooglePlace } from '@/lib/googlePlaces';
import { usePaymentMethods } from './usePaymentMethods';

// Google Places APIの詳細情報の型定義
interface GooglePlaceDetails {
  name?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  opening_hours?: {
    weekday_text?: string[];
    open_now?: boolean;
  };
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
    html_attributions: string[];
  }>;
}

// OSM決済方法データの型定義（店舗情報を含む）
interface OSMPaymentMethod {
  id: string;
  name: string;
  icon: string;
  isSupported: boolean;
  verifiedAt: string;
  category: 'qr' | 'nfc' | 'card' | 'ic' | 'cash';
  storeName?: string;
  storeAddress?: string;
}

export const useStoreSearch = (lat: number, lng: number) => {
  const [searchResults, setSearchResults] = useState<Store[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // OSMから決済方法データを取得
  const { paymentMethods } = usePaymentMethods(lat, lng, 2000);

  // Google Places APIのデータをStore型に変換
  const convertGooglePlaceToStore = async (place: GooglePlace): Promise<Store> => {
    // 詳細情報を取得
    const details = await getPlaceDetails(place.place_id) as GooglePlaceDetails | null;
    
    // カテゴリを判定
    const getCategory = (types: string[]): Store['category'] => {
      if (types.includes('convenience_store')) return 'convenience';
      if (types.includes('restaurant') || types.includes('food')) return 'restaurant';
      if (types.includes('supermarket')) return 'supermarket';
      if (types.includes('store') || types.includes('shopping_mall')) return 'retail';
      return 'other';
    };

    // 営業時間を文字列に変換
    const getBusinessHours = (openingHours?: {
      weekday_text?: string[];
      open_now?: boolean;
    }): string => {
      if (!openingHours || !openingHours.weekday_text) {
        return '営業時間不明';
      }
      return openingHours.weekday_text.join(', ');
    };

    const category = getCategory(place.types);
    
    // OSMから取得した決済方法データを取得（店舗名と住所で照合）
    const osmPaymentMethods = findOSMPaymentMethods(place, details, paymentMethods);

    return {
      id: place.place_id,
      name: details?.name || place.name,
      address: details?.formatted_address || place.vicinity,
      latitude: details?.geometry.location.lat || place.geometry.location.lat,
      longitude: details?.geometry.location.lng || place.geometry.location.lng,
      category: category,
      paymentMethods: osmPaymentMethods.length > 0 ? osmPaymentMethods : getDefaultPaymentMethods(category),
      lastVerified: new Date().toISOString().split('T')[0],
      trustScore: 'medium',
      phoneNumber: details?.formatted_phone_number,
      businessHours: getBusinessHours(details?.opening_hours),
      photos: details?.photos?.map(photo => ({
        photoReference: photo.photo_reference,
        height: photo.height,
        width: photo.width,
        htmlAttributions: photo.html_attributions,
      }))
    };
  };

  // OSMデータとGoogle Placesデータを照合する関数
  const findOSMPaymentMethods = (
    place: GooglePlace, 
    details: GooglePlaceDetails | null, 
    osmData: Record<string, OSMPaymentMethod[]>
  ): OSMPaymentMethod[] => {
    const storeName = (details?.name || place.name).toLowerCase();
    const storeAddress = (details?.formatted_address || place.vicinity).toLowerCase();
    
    // OSMデータから店舗名や住所で照合
    for (const [storeId, methods] of Object.entries(osmData)) {
      if (methods.length > 0) {
        const firstMethod = methods[0];
        
        // 店舗名での照合
        if (firstMethod.storeName) {
          const osmName = firstMethod.storeName.toLowerCase();
          if (storeName.includes(osmName) || osmName.includes(storeName)) {
            return methods;
          }
        }
        
        // 住所での照合
        if (firstMethod.storeAddress) {
          const osmAddress = firstMethod.storeAddress.toLowerCase();
          if (storeAddress.includes(osmAddress) || osmAddress.includes(storeAddress)) {
            return methods;
          }
        }
      }
    }
    
    return [];
  };

  // 店舗カテゴリに応じたデフォルト決済方法
  const getDefaultPaymentMethods = (category: Store['category']): PaymentMethod[] => {
    const baseMethods: PaymentMethod[] = [
      {
        id: 'cash',
        name: '現金',
        icon: '💴',
        isSupported: true,
        verifiedAt: new Date().toISOString(),
        category: 'cash'
      },
      {
        id: 'visa',
        name: 'Visa',
        icon: '💳',
        isSupported: true,
        verifiedAt: new Date().toISOString(),
        category: 'card'
      },
      {
        id: 'mastercard',
        name: 'Mastercard',
        icon: '💳',
        isSupported: true,
        verifiedAt: new Date().toISOString(),
        category: 'card'
      },
      {
        id: 'jcb',
        name: 'JCB',
        icon: '💳',
        isSupported: true,
        verifiedAt: new Date().toISOString(),
        category: 'card'
      }
    ];

    // コンビニやスーパーは電子マネーも対応
    if (category === 'convenience' || category === 'supermarket') {
      baseMethods.push(
        {
          id: 'edy',
          name: 'Edy',
          icon: '💳',
          isSupported: true,
          verifiedAt: new Date().toISOString(),
          category: 'nfc'
        },
        {
          id: 'nanaco',
          name: 'nanaco',
          icon: '💳',
          isSupported: true,
          verifiedAt: new Date().toISOString(),
          category: 'nfc'
        },
        {
          id: 'waon',
          name: 'WAON',
          icon: '💳',
          isSupported: true,
          verifiedAt: new Date().toISOString(),
          category: 'nfc'
        },
        {
          id: 'suica',
          name: 'Suica',
          icon: '🍎',
          isSupported: true,
          verifiedAt: new Date().toISOString(),
          category: 'ic'
        },
        {
          id: 'pasmo',
          name: 'PASMO',
          icon: '🟦',
          isSupported: true,
          verifiedAt: new Date().toISOString(),
          category: 'ic'
        }
      );
    }

    // コンビニはQRコード決済も対応
    if (category === 'convenience') {
      baseMethods.push(
        {
          id: 'paypay',
          name: 'PayPay',
          icon: '💰',
          isSupported: true,
          verifiedAt: new Date().toISOString(),
          category: 'qr'
        },
        {
          id: 'rakutenpay',
          name: '楽天ペイ',
          icon: '🎁',
          isSupported: true,
          verifiedAt: new Date().toISOString(),
          category: 'qr'
        },
        {
          id: 'linepay',
          name: 'LINE Pay',
          icon: '💬',
          isSupported: true,
          verifiedAt: new Date().toISOString(),
          category: 'qr'
        }
      );
    }

    return baseMethods;
  };

  // テキスト検索を実行
  const searchStores = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      console.log('テキスト検索を実行:', query);
      
      // Google Places Text Search APIを使用
      const places = await searchStoresByText(query, lat, lng, 50000);
      
      if (places.length === 0) {
        setSearchResults([]);
        return;
      }

      // 最大20件に制限（パフォーマンス考慮）
      const limitedPlaces = places.slice(0, 20);
      
      // データを変換
      const convertedStores = await Promise.all(
        limitedPlaces.map(convertGooglePlaceToStore)
      );
      
      setSearchResults(convertedStores);
      console.log(`${convertedStores.length}件の検索結果を取得しました`);
      
    } catch (error) {
      console.error('テキスト検索に失敗:', error);
      setSearchError('検索に失敗しました');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [lat, lng]); // paymentMethodsを依存配列から削除

  return {
    searchResults,
    isSearching,
    searchError,
    searchStores
  };
};
