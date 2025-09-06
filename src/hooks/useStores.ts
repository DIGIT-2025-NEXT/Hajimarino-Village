import { useState, useEffect, useCallback } from 'react';
import { Store } from '@/types/store';
import { SAMPLE_STORES } from '@/data/sampleStores';
import { searchMultipleStoreTypes, getPlaceDetails, GooglePlace } from '@/lib/googlePlaces';

export const useStores = (lat: number, lng: number, useRealData: boolean = false) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Places APIのデータをStore型に変換
  const convertGooglePlaceToStore = async (place: GooglePlace): Promise<Store> => {
    // 詳細情報を取得
    const details = await getPlaceDetails(place.place_id);
    
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

    return {
      id: place.place_id,
      name: details?.name || place.name,
      address: details?.formatted_address || place.vicinity,
      latitude: details?.geometry.location.lat || place.geometry.location.lat,
      longitude: details?.geometry.location.lng || place.geometry.location.lng,
      category: getCategory(place.types),
      paymentMethods: [], // 決済方法は後で追加
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
  }, [lat, lng, useRealData]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return { 
    stores, 
    loading, 
    error, 
    refetch: fetchStores 
  };
};