'use client';

import React from 'react';
import { 
  X, 
  MapPin, 
  Star, 
  Heart, 
  Navigation,
  Trash2,
  Store as StoreIcon
} from 'lucide-react';
import { Store } from '@/types/store';

interface FavoriteListModalProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteStores: Store[];
  onStoreSelect: (store: Store) => void;
  onRemoveFavorite: (storeId: string) => void;
}

export default function FavoriteListModal({ 
  isOpen, 
  onClose, 
  favoriteStores, 
  onStoreSelect,
  onRemoveFavorite
}: FavoriteListModalProps) {
  if (!isOpen) return null;

  // カテゴリアイコンを取得する関数
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'restaurant': return '🍴';
      case 'convenience': return '🏪';
      case 'supermarket': return '🛒';
      case 'retail': return '🛍️';
      default: return '🏪';
    }
  };

  // カテゴリ名を日本語に変換
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'restaurant': return 'レストラン';
      case 'convenience': return 'コンビニ';
      case 'supermarket': return 'スーパー';
      case 'retail': return '小売店';
      default: return 'その他';
    }
  };

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* モーダル */}
      <div className="fixed inset-x-4 top-4 bottom-4 md:inset-x-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:h-auto md:max-h-[80vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">お気に入り店舗</h2>
              <p className="text-sm text-gray-500">{favoriteStores.length}件登録中</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          {favoriteStores.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                お気に入り店舗がありません
              </h3>
              <p className="text-gray-500">
                気になる店舗を見つけたら、ハートアイコンをタップしてお気に入りに追加しましょう。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteStores.map((store) => (
                <div
                  key={store.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onStoreSelect(store)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 店舗名とカテゴリ */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(store.category)}</span>
                        <h3 className="font-semibold text-gray-900 text-lg">{store.name}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {getCategoryName(store.category)}
                        </span>
                      </div>

                      {/* 住所 */}
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="text-sm">{store.address}</span>
                      </div>

                      {/* 評価 */}
                      {store.rating && (
                        <div className="flex items-center text-yellow-500 mb-3">
                          <Star className="h-4 w-4 mr-1 fill-current" />
                          <span className="text-sm font-medium">{store.rating}</span>
                          {store.userRatingsTotal && (
                            <span className="text-gray-500 text-sm ml-1">
                              ({store.userRatingsTotal}件)
                            </span>
                          )}
                        </div>
                      )}

                      {/* 決済方法 */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {store.paymentMethods.slice(0, 4).map((method) => (
                          <span
                            key={method.id}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                          >
                            {method.name}
                          </span>
                        ))}
                        {store.paymentMethods.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{store.paymentMethods.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* アクション */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFavorite(store.id);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="お気に入りから削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Google Mapsで開く
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
                          window.open(url, '_blank');
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="経路を検索"
                      >
                        <Navigation className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 p-6">
          <p className="text-sm text-gray-500 text-center">
            店舗をタップすると詳細情報を表示します
          </p>
        </div>
      </div>
    </>
  );
}
