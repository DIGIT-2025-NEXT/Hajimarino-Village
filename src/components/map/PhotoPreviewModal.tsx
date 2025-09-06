import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2 } from 'lucide-react';
import { StorePhoto } from '@/types/store';

interface PhotoPreviewModalProps {
  photos: StorePhoto[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function PhotoPreviewModal({ 
  photos, 
  isOpen, 
  onClose, 
  initialIndex = 0 
}: PhotoPreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];
  const photoUrl = `/api/places/photo?photo_reference=${currentPhoto.photoReference}&maxwidth=800`;

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `store_photo_${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download photo:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '店舗写真',
          text: 'この店舗の写真をシェアします',
          url: photoUrl,
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // フォールバック: クリップボードにコピー
      try {
        await navigator.clipboard.writeText(photoUrl);
        alert('写真のURLをクリップボードにコピーしました');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 bg-black/50 text-white">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold">
              {currentIndex + 1} / {photos.length}
            </span>
            {currentPhoto.htmlAttributions.length > 0 && (
              <span className="text-sm text-gray-300">
                {currentPhoto.htmlAttributions[0]}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="ダウンロード"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="シェア"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* メイン画像 */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
          <img
            src={photoUrl}
            alt={`店舗写真 ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.jpg'; // フォールバック画像
            }}
          />

          {/* ナビゲーションボタン */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* サムネイル - スクロールバー非表示 */}
        {photos.length > 1 && (
          <div className="p-4 bg-black/50">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-white'
                      : 'border-transparent hover:border-white/50'
                  }`}
                >
                  <img
                    src={`/api/places/photo?photo_reference=${photo.photoReference}&maxwidth=100`}
                    alt={`サムネイル ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}