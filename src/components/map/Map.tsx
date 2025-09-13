'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Store } from '@/types/store';
import { useStores } from '@/hooks/useStores';
import { useStoreSearch } from '@/hooks/useStoreSearch';
import StoreDetailModal from './StoreDetailModal';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  MapPin, 
  Store as StoreIcon, 
  User, 
  Settings as SettingsIcon,
  Heart,
  Star,
  Navigation,
  Layers,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  X
} from 'lucide-react';
import Settings from '../Settings';

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
  const [useRealData, setUseRealData] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [dataSource, setDataSource] = useState<'google' | 'osm' | 'both'>('both');
  
  // 検索モードの状態管理
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // カスタムフックを使用して店舗データを取得
  const { stores, loading, error, refetch } = useStores(CENTER.lat, CENTER.lng, useRealData);
  
  // テキスト検索フック
  const { searchResults, isSearching, searchError, searchStores } = useStoreSearch(CENTER.lat, CENTER.lng);

  // 検索入力のハンドリング（デバウンス付き）
  const handleSearchChange = (value: string) => {
    setSearch(value);
    
    // 既存のタイムアウトをクリア
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (value.trim()) {
      setIsSearchMode(true);
      // 500ms後に検索を実行
      const timeout = setTimeout(() => {
        searchStores(value);
      }, 500);
      setSearchTimeout(timeout);
    } else {
      setIsSearchMode(false);
      setSearchTimeout(null);
    }
  };

  // 検索をクリア
  const clearSearch = () => {
    setSearch('');
    setIsSearchMode(false);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
  };

  // 表示する店舗データを決定
  const displayStores = isSearchMode ? searchResults : stores;

  // 有効な座標を持つ店舗のみをフィルタリング
  const validStores = displayStores.filter(store => {
    const isValid = store.latitude && 
      store.longitude && 
      typeof store.latitude === 'number' && 
      typeof store.longitude === 'number' &&
      !isNaN(store.latitude) &&
      !isNaN(store.longitude);
    
    return isValid;
  });

  const filteredStores = validStores.filter(store => {
    // 検索モードの場合は、テキスト検索結果をそのまま表示
    if (isSearchMode) {
      return true;
    }
    
    // 通常モードの場合は、カテゴリフィルターを適用
    const matchesCategory = selectedCategory === 'all' || store.category === selectedCategory;
    return matchesCategory;
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

  // 設定画面を表示している場合はSettingsコンポーネントを返す
  if (showSettings) {
    return (
      <Settings 
        userData={userData}
        onBackToMap={() => setShowSettings(false)}
      />
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* 地図 */}
      <GoogleMap
        mapContainerClassName="w-full h-full rounded-lg"
        center={CENTER}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={MAP_OPTIONS}
      >
        {/* 店舗マーカー */}
        {filteredStores.map((store) => (
          <Marker
            key={store.id}
            position={{
              lat: store.latitude!,
              lng: store.longitude!
            }}
            onClick={() => handleMarkerClick(store)}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/>
                  <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">🏪</text>
                </svg>
              `)}`,
              scaledSize: new google.maps.Size(40, 40),
            }}
          />
        ))}
      </GoogleMap>

      {/* UI要素 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 right-4 space-y-4 pointer-events-auto">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            {/* 戻るボタン */}
            <button
              onClick={onBackToTitle}
              className="flex items-center space-x-2 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-gray-800 font-medium">タイトルへ</span>
            </button>

            {/* データソース選択 */}
            <div className="flex items-center space-x-2 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
              <Layers className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">データソース</span>
              <select
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value as 'google' | 'osm' | 'both')}
                className="text-sm bg-transparent border-none outline-none"
              >
                <option value="both">OSM + Google</option>
                <option value="osm">OSM のみ</option>
                <option value="google">Google のみ</option>
              </select>
            </div>

            {/* ユーザー情報 */}
            {userData && (
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center space-x-3 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">{userData.username}</p>
                  <p className="text-xs text-gray-500">{userData.selectedMethods.length}個の決済方法</p>
                </div>
              </button>
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-gray-800 placeholder-gray-500"
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* 検索モード表示 */}
          {isSearchMode && (
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                <Search className="h-4 w-4 text-blue-600" />
                <span className="text-blue-600 text-sm font-medium">
                  {`検索モード: "${search}"`}
                </span>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ローディング・エラー表示 */}
          {(loading || isSearching) && (
            <div className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 rounded-xl">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-600 text-sm">
                {isSearching ? '検索中...' : '店舗データを読み込み中...'}
              </span>
            </div>
          )}

          {(error || searchError) && (
            <div className="flex items-center justify-between px-4 py-3 bg-red-50 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-600 text-sm">{error || searchError}</span>
              </div>
              <button
                onClick={isSearchMode ? clearSearch : refetch}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4 text-red-600" />
              </button>
            </div>
          )}

          {/* データモード切り替え（検索モードでない場合のみ表示） */}
          {!isSearchMode && (
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
                <span className={`text-sm font-medium ${!useRealData ? 'text-blue-600' : 'text-gray-500'}`}>
                  デモデータ
                </span>
                <button
                  onClick={() => setUseRealData(!useRealData)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  style={{
                    backgroundColor: useRealData ? '#3B82F6' : '#D1D5DB'
                  }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useRealData ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${useRealData ? 'text-blue-600' : 'text-gray-500'}`}>
                  リアルデータ
                </span>
              </div>
            </div>
          )}
        </div>

        {/* フィルター（検索モードでない場合のみ表示） */}
        {showFilters && !isSearchMode && (
          <div className="absolute top-32 left-4 right-4 p-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg pointer-events-auto">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">カテゴリフィルター</h3>
              <div className="grid grid-cols-2 gap-2">
                {['all', 'convenience', 'restaurant', 'supermarket', 'retail', 'other'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category === 'all' ? 'すべて' : 
                     category === 'convenience' ? 'コンビニ' :
                     category === 'restaurant' ? 'レストラン' :
                     category === 'supermarket' ? 'スーパー' :
                     category === 'retail' ? '小売店' : 'その他'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* お気に入り店舗 */}
        {favoriteStores.length > 0 && (
          <div className="absolute top-4 right-4 p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg pointer-events-auto">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-gray-800">お気に入り</span>
            </div>
            <div className="space-y-1">
              {favoriteStores.slice(0, 3).map((storeId) => {
                const store = stores.find(s => s.id === storeId);
                return store ? (
                  <div key={storeId} className="text-xs text-gray-600 truncate">
                    {store.name}
                  </div>
                ) : null;
              })}
              {favoriteStores.length > 3 && (
                <div className="text-xs text-gray-400">
                  +{favoriteStores.length - 3}件
                </div>
              )}
            </div>
          </div>
        )}

        {/* 店舗数表示 */}
        <div className="absolute bottom-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg pointer-events-auto">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-800">
              {filteredStores.length}件の店舗
              {isSearchMode && (
                <span className="text-blue-600 ml-1">(検索結果)</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 店舗詳細モーダル */}
      {selectedStore && (
        <StoreDetailModal
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
          onToggleFavorite={toggleFavorite}
          isFavorite={favoriteStores.includes(selectedStore.id)}
        />
      )}

      {children}
    </div>
  );
}