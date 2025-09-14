'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, MapPin, CreditCard, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import PaymentMethodSelection from './PaymentMethodSelection';
import EmailVerificationSent from './EmailVerificationSent';

interface LoginFormProps {
  onModeChange: (mode: 'login' | 'register') => void;
  currentMode: 'login' | 'register';
  onLoginSuccess: () => void;
  onRegistrationComplete: (userData: { email: string; username: string; selectedMethods: string[]}) => void;
  onBackToTitle: () => void;
}

export default function LoginForm({ onModeChange, currentMode, onLoginSuccess, onRegistrationComplete, onBackToTitle }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [tempUserData, setTempUserData] = useState<{ email: string; username: string; selectedMethods: string[] } | null>(null);

  const { signIn, signUp, updateUserProfile } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (currentMode === 'register') {
        // 新規登録を実行
        const { error } = await signUp(email, password, username);
        if (error) {
          setError(`登録に失敗しました: ${error.message}`);
        } else {
          // 登録成功後、決済方法選択画面に遷移
          setTempUserData({ email, username, selectedMethods: [] });
          setShowPaymentSelection(true);
        }
      } else {
        // ログイン処理
        const { error } = await signIn(email, password);
        if (error) {
          setError(`ログインに失敗しました: ${error.message}`);
        } else {
          onLoginSuccess();
        }
      }
    } catch (err) {
      setError('予期しないエラーが発生しました。');
      console.error('認証エラー:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSelectionComplete = async (userData: { email: string; username: string; selectedMethods: string[] }) => {
    if (!tempUserData) return;
    
    setIsLoading(true);
    
    try {
      // 決済方法を一時保存
      setTempUserData(prev => prev ? { ...prev, selectedMethods: userData.selectedMethods } : null);
      
      // 認証メール送信完了画面を表示
      setShowPaymentSelection(false);
      setShowEmailVerification(true);
      
      console.log('新規登録が完了しました。認証メールが送信されました。');
      console.log('選択された決済方法:', userData.selectedMethods);
      
    } catch (err) {
      setError('予期しないエラーが発生しました。');
      setShowPaymentSelection(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!tempUserData) return;
    
    setIsLoading(true);
    try {
      // メール再送信（同じメールアドレスで再度登録を試行）
      const { error } = await signUp(tempUserData.email, password, tempUserData.username);
      if (error) {
        setError('メールの再送信に失敗しました。');
      } else {
        setError('');
        // 成功メッセージを表示（簡易版）
        alert('認証メールを再送信しました。');
      }
    } catch (err) {
      setError('メールの再送信に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowEmailVerification(false);
    setTempUserData(null);
    onModeChange('login');
  };

  // 認証メール送信完了画面
  if (showEmailVerification && tempUserData) {
    return (
      <EmailVerificationSent
        email={tempUserData.email}
        onBackToLogin={handleBackToLogin}
        onResendEmail={handleResendEmail}
      />
    );
  }

  // 決済方法選択画面
  if (showPaymentSelection && tempUserData) {
    return (
      <PaymentMethodSelection
        onBack={() => {
          setShowPaymentSelection(false);
          setTempUserData(null);
        }}
        onComplete={handlePaymentSelectionComplete}
        onRegistrationComplete={handlePaymentSelectionComplete}
        userData={tempUserData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装飾 - より控えめに */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* メインカード - 他の画面と統一感のある色味 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
          {/* ヘッダー */}
          <div className="text-center mb-8">
             {/* 戻るボタン */}
             <div className="flex justify-start mb-4">
              <button
                onClick={onBackToTitle}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="text-sm font-medium">タイトルへ</span>
              </button>
            </div>

            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              PayMapKitaQ
            </h1>
            <p className="text-gray-600 text-sm">
              北九州市の店舗で使える決済方法を確認
            </p>
          </div>

          {/* タブ切り替え */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            <button
              onClick={() => onModeChange('login')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                currentMode === 'login'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              ログイン
            </button>
            <button
              onClick={() => onModeChange('register')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                currentMode === 'register'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              新規登録
            </button>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentMode === 'register' && (
              <div className="relative group">
                <div className="absolute left-4 top-4 z-10">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="ユーザー名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm"
                  required={currentMode === 'register'}
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute left-4 top-4 z-10">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-4 z-10">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  処理中...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {currentMode === 'login' ? (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      ログイン
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      新規登録
                    </>
                  )}
                </div>
              )}
            </button>
          </form>

          {/* フッター */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {currentMode === 'login' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
              <button
                onClick={() => onModeChange(currentMode === 'login' ? 'register' : 'login')}
                className="text-blue-600 hover:text-blue-700 font-medium ml-1 transition-colors"
              >
                {currentMode === 'login' ? '新規登録' : 'ログイン'}
              </button>
            </p>
          </div>
        </div>

        {/* 追加の装飾要素 - より控えめに */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-4 text-gray-500 text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              安全な認証
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              プライバシー保護
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
              リアルタイム更新
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}