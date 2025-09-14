'use client';

import React from 'react';
import { 
  X, 
  User, 
  LogIn,
  ArrowLeft
} from 'lucide-react';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToLogin: () => void;
}

export default function LoginPromptModal({ 
  isOpen, 
  onClose, 
  onGoToLogin
}: LoginPromptModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* モーダル */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">ログインが必要です</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              この機能はログイン後に使用できます
            </h3>
            <p className="text-gray-600">
              設定やお気に入り機能を利用するには、アカウントにログインしてください。
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onGoToLogin}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium"
            >
              <LogIn className="h-5 w-5" />
              <span>ログインする</span>
            </button>
            
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>戻る</span>
            </button>
          </div>
        </div>

        {/* フッター */}
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-500 text-center">
            ゲストユーザーでも地図の閲覧は可能です
          </p>
        </div>
      </div>
    </>
  );
}
