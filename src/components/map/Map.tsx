'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Store } from '@/types/store';
import { useStores } from '@/hooks/useStores';
import StoreDetailModal from './StoreDetailModal';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  MapPin, 
  Store as StoreIcon, 
  User, 
  Settings,
  Heart,
  Star,
  Navigation,
  Layers,
  RefreshCw,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

// 北九州市の中心座標（小倉駅周辺）
const CENTER = {
  lat: 33.8867,
  lng: 130.8828
};

const MAP_OPTIONS = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi.business',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

interface MapProps {
  children?: React.ReactNode;
  userData?: { email: string; username: string; selectedMethods: string[] } | null;
  onBackToTitle?: () => void;
}

export default function Map({ children, userData, onBackToTitle }: MapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const mapRef = useRef<google.maps.Map | undefined>(undefined);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favoriteStores, setFavoriteStores] = useState<string[]>([]);
  const [useRealData, setUseRealData] = useState(false); // 新規追加

  // カスタムフックを使用して店舗データを取得
  const { stores, loading, error, refetch } = useStores(CENTER.lat, CENTER.lng, useRealData);

  // 有効な座標を持つ店舗のみをフィルタリング
  const validStores = stores.filter(store => 
    store.latitude && 
    store.longitude && 
    typeof store.latitude === 'number' && 
    typeof store.longitude === 'number' &&
    !isNaN(store.latitude) &&
    !isNaN(store.longitude)
  );

  const filteredStores = validStores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(search.toLowerCase()) ||
                         store.address.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || store.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = undefined;
  }, []);

  const handleMarkerClick = (store: Store) => {
    setSelectedStore(store);
  };

  const toggleFavorite = (storeId: string) => {
    setFavoriteStores(prev => 
      prev.includes(storeId)
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            地図の読み込みに失敗しました
          </div>
          <div className="text-gray-600">
            APIキーの設定を確認してください
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-gray-600">地図を読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* 地図 */}
      <GoogleMap
        mapContainerClassName="w-full h-full rounded-lg"
        center={CENTER}
        zoom={15}
        options={MAP_OPTIONS}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* 店舗ピンの表示 */}
        {filteredStores.map((store) => (
          <Marker
            key={store.id}
            position={{ lat: store.latitude, lng: store.longitude }}
            title={store.name}
            onClick={() => handleMarkerClick(store)}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="20" fill="#3B82F6" opacity="0.9"/>
                  <circle cx="20" cy="20" r="12" fill="white"/>
                  <text x="20" y="25" text-anchor="middle" font-size="12" fill="#3B82F6" font-weight="bold">店</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 40)
            }}
          />
        ))}
      </GoogleMap>

      {/* 上部UI */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex flex-col space-y-3">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            {/* 戻るボタン */}
            <button
              onClick={() => {
                if (onBackToTitle) {
                  onBackToTitle();
                } else {
                  window.location.reload();
                }
              }}
              className="flex items-center space-x-2 px-4 py-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">戻る</span>
            </button>

            {/* データソース切り替え */}
            <div className="flex items-center space-x-2 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
              <span className="text-sm text-gray-600">リアルデータ</span>
              <button
                onClick={() => setUseRealData(!useRealData)}
                className="flex items-center space-x-1"
              >
                {useRealData ? (
                  <ToggleRight className="h-5 w-5 text-blue-500" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* ユーザー情報 */}
            {userData && (
              <div className="flex items-center space-x-3 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{userData.username}</p>
                  <p className="text-xs text-gray-500">{userData.selectedMethods.length}個の決済方法</p>
                </div>
              </div>
            )}
          </div>

          {/* 検索バー */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="店舗名や住所で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-gray-800 placeholder-gray-500"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* ローディング・エラー表示 */}
          {loading && (
            <div className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 rounded-xl">
              <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
              <span className="text-sm text-blue-600">店舗データを取得中...</span>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 bg-red-50 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* フィルター */}
          {showFilters && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center space-x-2 mb-3">
                <Layers className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">カテゴリで絞り込み</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedCategory === 'all'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  すべて
                </button>
                {['restaurant', 'convenience', 'retail', 'supermarket'].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category === 'restaurant' ? '飲食店' :
                     category === 'convenience' ? 'コンビニ' :
                     category === 'retail' ? '小売店' :
                     category === 'supermarket' ? 'スーパー' : category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 左下：店舗数表示 */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="flex items-center space-x-2 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
          <StoreIcon className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            {filteredStores.length}件の店舗
          </span>
          {useRealData && (
            <span className="text-xs text-blue-500">(リアルデータ)</span>
          )}
        </div>
      </div>

      {/* 右下：お気に入り店舗 */}
      {favoriteStores.length > 0 && (
        <div className="absolute bottom-4 right-4 z-10">
          <div className="flex items-center space-x-2 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
            <Heart className="h-5 w-5 text-red-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">
              {favoriteStores.length}件のお気に入り
            </span>
          </div>
        </div>
      )}

      {/* 店舗詳細モーダル */}
      <StoreDetailModal 
        store={selectedStore} 
        onClose={() => setSelectedStore(null)}
        onToggleFavorite={toggleFavorite}
        isFavorite={selectedStore ? favoriteStores.includes(selectedStore.id) : false}
      />
    </div>
  );
}