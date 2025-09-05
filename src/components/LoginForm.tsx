'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import PaymentMethodSelection from './PaymentMethodSelection';

interface LoginFormProps {
  onModeChange: (mode: 'login' | 'register') => void;
  currentMode: 'login' | 'register';
  onLoginSuccess: () => void;
  onRegistrationComplete: (userData: { email: string; username: string; selectedMethods: string[]}) => void;
}

export default function LoginForm({ onModeChange, currentMode, onLoginSuccess, onRegistrationComplete }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [tempUserData, setTempUserData] = useState<{ email: string; username: string } | null>(null);

  const { signIn, signUp, updateUserProfile } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (currentMode === 'register') {
        // 新規登録を直接実行
        const { error } = await signUp(email, password, username);
        if (error) {
          setError(`登録に失敗しました: ${error.message}`);
        } else {
          // 登録成功後、決済方法選択画面に遷移
          setTempUserData({ email, username });
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
      // 決済方法選択後にSupabaseに登録
      const { error } = await signUp(tempUserData.email, password, tempUserData.username);
      
      if (error) {
        setError('登録に失敗しました。メールアドレスが既に使用されている可能性があります。');
        setShowPaymentSelection(false);
        setIsLoading(false);
        return;
      }
      
      // 登録成功後、認証セッションが確立されるまで待機
      console.log('新規登録が完了しました。決済方法を保存中...');
      
      // 認証セッションの確立を待つ（最大10秒）
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        try {
          const { error: updateError } = await updateUserProfile({
            selectedMethods: userData.selectedMethods
          });
          
          if (!updateError) {
            console.log('決済方法の保存に成功しました');
            break;
          }
          
          // エラーの場合は1秒待ってからリトライ
          console.log(`決済方法の保存を試行中... (${attempts + 1}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        } catch (err) {
          console.log(`決済方法の保存を試行中... (${attempts + 1}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
      }
      
      if (attempts >= maxAttempts) {
        console.log('決済方法の保存に失敗しました。設定画面で再設定してください。');
      }
      
      onRegistrationComplete({
        email: tempUserData.email,
        username: tempUserData.username,
        selectedMethods: userData.selectedMethods
      });
    } catch (err) {
      setError('予期しないエラーが発生しました。');
      setShowPaymentSelection(false);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PayMapKitaQ
          </h1>
          <p className="text-gray-600">
            北九州市の店舗で使える決済方法を確認
          </p>
        </div>

        {/* タブ切り替え */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => onModeChange('login')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              currentMode === 'login'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ログイン
          </button>
          <button
            onClick={() => onModeChange('register')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              currentMode === 'register'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            新規登録
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentMode === 'register' && (
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ユーザー名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={currentMode === 'register'}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                処理中...
              </div>
            ) : (
              currentMode === 'login' ? 'ログイン' : '新規登録'
            )}
          </button>
        </form>

        {/* フッター */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {currentMode === 'login' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
            <button
              onClick={() => onModeChange(currentMode === 'login' ? 'register' : 'login')}
              className="text-blue-600 hover:text-blue-700 font-medium ml-1"
            >
              {currentMode === 'login' ? '新規登録' : 'ログイン'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}