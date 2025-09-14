'use client';

import React from 'react';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';

interface EmailVerificationSentProps {
  email: string;
  onBackToLogin: () => void;
  onResendEmail: () => void;
}

export default function EmailVerificationSent({ 
  email, 
  onBackToLogin, 
  onResendEmail 
}: EmailVerificationSentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
          
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="flex justify-start mb-4">
              <button
                onClick={onBackToLogin}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="text-sm font-medium">ログイン画面へ</span>
              </button>
            </div>

            {/* 成功アイコン */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-10 w-10 text-green-500" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              認証メールを送信しました
            </h1>
            
            <p className="text-gray-600 mb-6">
              登録ありがとうございます！<br />
              以下のメールアドレスに認証メールを送信しました。
            </p>

            {/* メールアドレス表示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-blue-900">{email}</span>
              </div>
            </div>

            {/* 説明 */}
            <div className="text-left space-y-3 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  メールボックスを確認してください
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  認証メールのリンクをクリックしてください
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  認証完了後、ログインしてアプリをご利用ください
                </p>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="space-y-3">
              <button
                onClick={onResendEmail}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors font-medium"
              >
                <RefreshCw className="h-5 w-5" />
                <span>認証メールを再送信</span>
              </button>
              
              <button
                onClick={onBackToLogin}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors font-medium"
              >
                <span>ログイン画面に戻る</span>
              </button>
            </div>

            {/* 注意事項 */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
              <p className="text-sm text-yellow-800">
                <strong>注意:</strong> 認証メールが届かない場合は、迷惑メールフォルダもご確認ください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
