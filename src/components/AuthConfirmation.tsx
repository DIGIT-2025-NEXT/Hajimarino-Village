'use client';

import React, { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { CheckCircle, ArrowRight, User } from 'lucide-react';

interface AuthConfirmationProps {
  onComplete: () => void;
}

export default function AuthConfirmation({ onComplete }: AuthConfirmationProps) {
  const { user } = useAuthContext();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // 3秒後に自動的にメイン画面に遷移
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        
        {/* 成功アイコン */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>

        {/* メッセージ */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          メールの認証が完了しました
        </h1>
        
        <p className="text-gray-600 mb-6">
          アカウントの登録が正常に完了しました。<br />
          ログインしてアプリケーションをご利用ください。
        </p>

        {/* ユーザー情報 */}
        {user && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">登録されたアカウント</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{user.email}</p>
          </div>
        )}

        {/* カウントダウン */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">
            {countdown}秒後に自動的にログイン画面に移動します
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* 手動で進むボタン */}
        <button
          onClick={onComplete}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium"
        >
          <span>ログイン画面に進む</span>
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* フッター */}
        <p className="text-xs text-gray-400 mt-6">
          PayMapKitaQ - 決済対応店舗マップ
        </p>
      </div>
    </div>
  );
}
