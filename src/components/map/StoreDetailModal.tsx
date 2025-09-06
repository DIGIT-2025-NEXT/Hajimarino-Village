'use client';

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  CheckCircle, 
  XCircle, 
  Heart, 
  Share2, 
  Navigation,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Eye,
  Download
} from 'lucide-react';
import { Store, PaymentMethod } from '@/types/store';
import PhotoPreviewModal from './PhotoPreviewModal';

interface StoreDetailModalProps {
  store: Store | null;
  onClose: () => void;
  onToggleFavorite?: (storeId: string) => void;
  isFavorite?: boolean;
}

export default function StoreDetailModal({ 
  store, 
  onClose, 
  onToggleFavorite, 
  isFavorite = false 
}: StoreDetailModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);

  if (!store) return null;

  // デバッグ用ログを追加
  console.log('Store photos:', store.photos);
  console.log('Photos length:', store.photos?.length);

  // 住所を短縮表示する関数
  const shortenAddress = (address: string, maxLength: number = 50) => {
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + '...';
  };

  // 店舗名を短縮表示する関数
  const shortenStoreName = (name: string, maxLength: number = 30) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      restaurant: '飲食店',
      retail: '小売店',
      convenience: 'コンビニ',
      supermarket: 'スーパー',
      other: 'その他'
    };
    return labels[category] || category;
  };

  const getTrustScoreColor = (score: string) => {
    const colors: Record<string, string> = {
      high: 'text-green-600 bg-green-100 border-green-200',
      medium: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      low: 'text-red-600 bg-red-100 border-red-200'
    };
    return colors[score] || 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const getTrustScoreLabel = (score: string) => {
    const labels: Record<string, string> = {
      high: '高',
      medium: '中',
      low: '低'
    };
    return labels[score] || score;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      restaurant: '🍽️',
      retail: '🛍️',
      convenience: '🏪',
      supermarket: '🛒',
      other: '🏢'
    };
    return icons[category] || '🏢';
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(store.id);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: store.name,
        text: `${store.name} - ${store.address}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('URLをクリップボードにコピーしました');
    }
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
    window.open(url, '_blank');
  };

  // 写真のURLを生成する関数
  const getPhotoUrl = (photoReference: string, maxWidth: number = 400) => {
    return `/api/places/photo?photo_reference=${photoReference}&maxwidth=${maxWidth}`;
  };

  // 写真の切り替え
  const nextPhoto = () => {
    if (store.photos && currentPhotoIndex < store.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
        {/* 写真セクション - 高さを制限 */}
        {store.photos && store.photos.length > 0 && (
          <div className="relative h-48 bg-gray-100 flex-shrink-0">
            <img
              src={getPhotoUrl(store.photos[currentPhotoIndex].photoReference)}
              alt={`${store.name}の写真`}
              className="w-full h-full object-cover"
              onLoad={() => setIsLoadingPhoto(false)}
              onError={() => setIsLoadingPhoto(false)}
            />
            
            {/* ローディング表示 */}
            {isLoadingPhoto && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* 写真ナビゲーション */}
            {store.photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  disabled={currentPhotoIndex === 0}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextPhoto}
                  disabled={currentPhotoIndex === store.photos.length - 1}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* 写真インディケーター */}
            {store.photos.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {store.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* 写真数表示 */}
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
              <ImageIcon className="h-3 w-3" />
              <span>{currentPhotoIndex + 1}/{store.photos.length}</span>
            </div>
          </div>
        )}

        {/* スクロール可能なコンテンツエリア - スクロールバー非表示 */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* ヘッダー */}
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-start space-x-3 pr-12">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-lg">
                {getCategoryIcon(store.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold mb-1 break-words">
                  {shortenStoreName(store.name)}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-white/90">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate" title={store.address}>
                    {shortenAddress(store.address)}
                  </span>
                </div>
              </div>
            </div>

            {/* アクションボタン - コンパクトに */}
            <div className="flex items-center space-x-2 mt-3">
              {/* 写真プレビューボタン */}
              {store.photos && store.photos.length > 0 && (
                <button
                  onClick={() => setShowPhotoPreview(true)}
                  className="flex items-center space-x-1 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
                >
                  <Eye className="h-3 w-3" />
                  <span className="font-medium">
                    写真を見る ({store.photos.length})
                  </span>
                </button>
              )}

              {onToggleFavorite && (
                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
                    isFavorite
                      ? 'bg-red-500/20 text-red-100 hover:bg-red-500/30'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart className={`h-3 w-3 ${isFavorite ? 'fill-current' : ''}`} />
                  <span className="font-medium">
                    {isFavorite ? 'お気に入り済み' : 'お気に入り'}
                  </span>
                </button>
              )}
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                <Share2 className="h-3 w-3" />
                <span className="font-medium">共有</span>
              </button>

              <button
                onClick={handleDirections}
                className="flex items-center space-x-1 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                <Navigation className="h-3 w-3" />
                <span className="font-medium">経路</span>
              </button>
            </div>
          </div>

          {/* 店舗情報 */}
          <div className="p-4 space-y-3">
            {/* カテゴリと信頼度 */}
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium border border-blue-200">
                {getCategoryLabel(store.category)}
              </span>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getTrustScoreColor(store.trustScore)}`}>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>信頼度: {getTrustScoreLabel(store.trustScore)}</span>
                </div>
              </div>
            </div>

            {/* 評価情報 */}
            {store.rating && (
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-yellow-800">{store.rating}</span>
                    <span className="text-xs text-yellow-600">
                      ({store.userRatingsTotal}件のレビュー)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 営業時間 */}
            {store.businessHours && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-4 w-4 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 mb-1">営業時間</p>
                  <p className="text-xs text-gray-600 break-words">
                    {store.businessHours}
                  </p>
                </div>
              </div>
            )}

            {/* 電話番号 */}
            {store.phoneNumber && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">電話番号</p>
                  <p className="text-xs text-gray-600">{store.phoneNumber}</p>
                </div>
              </div>
            )}

            {/* 完全な住所 */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">住所</p>
                  <p className="text-xs text-gray-600 break-words" title={store.address}>
                    {store.address}
                  </p>
                </div>
              </div>
            </div>

            {/* 最終更新日 */}
            <div className="text-xs text-gray-500 text-center">
              最終更新: {new Date(store.lastVerified).toLocaleDateString('ja-JP')}
            </div>
          </div>

          {/* 決済方法 */}
          <div className="px-4 pb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>対応決済方法</span>
            </h3>
            
            {/* 対応している決済方法 */}
            {store.paymentMethods && store.paymentMethods.length > 0 ? (
              <div className="space-y-2">
                {store.paymentMethods
                  .filter(pm => pm.isSupported)
                  .map(pm => (
                    <div key={pm.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {pm.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-green-800 text-sm">{pm.name}</div>
                        <div className="text-xs text-green-600 flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>対応確認済み</span>
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-2 w-2 text-white" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">決済方法情報を取得中...</p>
                </div>
              </div>
            )}

            {/* 対応していない決済方法 */}
            {store.paymentMethods && store.paymentMethods.some(pm => !pm.isSupported) && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <XCircle className="h-3 w-3 text-gray-500" />
                  <span>非対応の決済方法</span>
                </h4>
                <div className="space-y-1">
                  {store.paymentMethods
                    .filter(pm => !pm.isSupported)
                    .map(pm => (
                      <div key={pm.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-6 h-6 bg-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                          {pm.icon}
                        </div>
                        <span className="text-xs text-gray-500">{pm.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* フッターアクション - 固定 */}
        <div className="px-4 pb-4 pt-2 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="flex space-x-3">
            <button
              onClick={handleDirections}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Navigation className="h-4 w-4" />
              <span>経路を表示</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>

      {/* 写真プレビューモーダル */}
      {store.photos && store.photos.length > 0 && (
        <PhotoPreviewModal
          photos={store.photos}
          isOpen={showPhotoPreview}
          onClose={() => setShowPhotoPreview(false)}
        />
      )}
    </div>
  );
}