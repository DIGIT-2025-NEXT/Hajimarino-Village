'use client';

import React from 'react';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

interface AuthErrorProps {
  error: string;
  onRetry: () => void;
  onBack: () => void;
}

export default function AuthError({ error, onRetry, onBack }: AuthErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        
        {/* エラーアイコン */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-12 w-12 text-red-500" />
        </div>

        {/* エラーメッセージ */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          認証に失敗しました
        </h1>
        
        <p className="text-gray-600 mb-6">
          {error}
        </p>

        {/* アクションボタン */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <RefreshCw className="h-5 w-5" />
            <span>再試行</span>
          </button>
          
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>タイトルに戻る</span>
          </button>
        </div>

        {/* フッター */}
        <p className="text-xs text-gray-400 mt-6">
          PayMapKitaQ - 決済対応店舗マップ
        </p>
      </div>
    </div>
  );
}
