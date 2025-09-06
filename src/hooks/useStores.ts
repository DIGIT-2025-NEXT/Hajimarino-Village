import { useState, useEffect, useCallback } from 'react';
import { Store, PaymentMethod } from '@/types/store';
import { SAMPLE_STORES } from '@/data/sampleStores';
import { searchMultipleStoreTypes, getPlaceDetails, GooglePlace } from '@/lib/googlePlaces';
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
  // 店舗情報を追加
  storeName?: string;
  storeAddress?: string;
}

// OSMデータの構造を正しく反映した型定義
interface OSMPaymentData {
  id: number;
  type: string;
  lat?: number;
  lng?: number;
  name: string;
  address: string;
  supportedPayments: string[];
  tags: Record<string, string>;
}

export const useStores = (lat: number, lng: number, useRealData: boolean = false) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OSMから決済方法データを取得
  const { paymentMethods, loading: paymentLoading, error: paymentError } = usePaymentMethods(lat, lng, 2000);

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
      trustScore: 'medium', // デフォルト値
      phoneNumber: details?.formatted_phone_number,
      businessHours: getBusinessHours(details?.opening_hours),
      // 写真情報を追加
      photos: details?.photos?.map(photo => ({
        photoReference: photo.photo_reference,
        height: photo.height,
        width: photo.width,
        htmlAttributions: photo.html_attributions,
      }))
    };
  };

  // OSMデータとGoogle Placesデータを照合する関数（改善版）
  const findOSMPaymentMethods = (
    place: GooglePlace, 
    details: GooglePlaceDetails | null, 
    osmData: Record<string, OSMPaymentMethod[]>
  ): OSMPaymentMethod[] => {
    const storeName = (details?.name || place.name).toLowerCase();
    const storeAddress = (details?.formatted_address || place.vicinity).toLowerCase();
    
    console.log(`照合開始: ${storeName} (${storeAddress})`);
    console.log('利用可能なOSMデータ:', Object.keys(osmData).length, '店舗');
    
    // OSMデータから店舗名や住所で照合
    for (const [storeId, methods] of Object.entries(osmData)) {
      if (methods.length > 0) {
        const firstMethod = methods[0];
        
        // 店舗名での照合
        if (firstMethod.storeName) {
          const osmName = firstMethod.storeName.toLowerCase();
          
          // 店舗名の部分一致で照合
          if (storeName.includes(osmName) || osmName.includes(storeName)) {
            console.log(`OSMデータと照合成功: ${storeName} <-> ${osmName}`);
            return methods;
          }
        }
        
        // 住所での照合
        if (firstMethod.storeAddress) {
          const osmAddress = firstMethod.storeAddress.toLowerCase();
          
          // 住所の部分一致で照合
          if (storeAddress.includes(osmAddress) || osmAddress.includes(storeAddress)) {
            console.log(`OSMデータと住所照合成功: ${storeAddress} <-> ${osmAddress}`);
            return methods;
          }
        }
      }
    }
    
    console.log(`OSMデータとの照合失敗: ${storeName}`);
    return [];
  };

  // 店舗カテゴリに応じたデフォルト決済方法
  const getDefaultPaymentMethods = (category: Store['category']): PaymentMethod[] => {
    // 配列の型を明示的に指定
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
        isSupported: true, // ほとんどの店舗で対応
        verifiedAt: new Date().toISOString(),
        category: 'card'
      },
      {
        id: 'mastercard',
        name: 'Mastercard',
        icon: '💳',
        isSupported: true, // ほとんどの店舗で対応
        verifiedAt: new Date().toISOString(),
        category: 'card'
      },
      {
        id: 'jcb',
        name: 'JCB',
        icon: '💳',
        isSupported: true, // 日本では一般的
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

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (useRealData) {
        // Google Places APIから実際のデータを取得
        console.log('Google Places APIから店舗データを取得中...');
        
        // 段階的に検索範囲を拡大
        const searchRadii = [2000, 5000, 10000]; // 2km, 5km, 10km
        let allPlaces: GooglePlace[] = [];
        
        for (const radius of searchRadii) {
          try {
            const places = await searchMultipleStoreTypes(lat, lng, radius);
            allPlaces = [...allPlaces, ...places];
            
            // 十分な店舗数が取得できたら停止
            if (allPlaces.length >= 100) {
              break;
            }
          } catch (error) {
            console.error(`Error searching with radius ${radius}:`, error);
          }
        }
        
        // 重複を除去
        const uniquePlaces = allPlaces.filter((place, index, self) => 
          index === self.findIndex(p => p.place_id === place.place_id)
        );
        
        // 最大100件に制限
        const limitedPlaces = uniquePlaces.slice(0, 100);
        
        // データを変換
        const convertedStores = await Promise.all(
          limitedPlaces.map(convertGooglePlaceToStore)
        );
        
        setStores(convertedStores);
        console.log(`${convertedStores.length}件の店舗データを取得しました`);
        
        // OSMデータの取得状況をログ出力
        if (paymentError) {
          console.warn('OSM決済方法データの取得に失敗:', paymentError);
        } else {
          console.log(`OSM決済方法データ: ${Object.keys(paymentMethods).length}店舗分を取得`);
        }
      } else {
        // サンプルデータを使用
        setStores(SAMPLE_STORES);
        console.log('サンプルデータを使用しています');
      }
    } catch (error) {
      console.error('店舗データの取得に失敗:', error);
      setError('店舗データの取得に失敗しました');
      // エラー時はサンプルデータを使用
      setStores(SAMPLE_STORES);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, useRealData, paymentMethods, paymentError]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return { 
    stores, 
    loading: loading || paymentLoading, 
    error: error || paymentError, 
    refetch: fetchStores 
  };
};