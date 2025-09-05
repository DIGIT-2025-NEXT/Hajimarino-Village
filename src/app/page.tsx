'use client';

import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { TitleScreen } from '@/components/Kaishi';
import LoginForm from '@/components/LoginForm';
import PaymentMethodSelection from '@/components/PaymentMethodSelection';
import Map from '@/components/map/Map';

type AppState = 'title' | 'login' | 'payment' | 'map';

export default function Home() {
  const { user, loading } = useAuthContext();
  const [appState, setAppState] = useState<AppState>('title');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);

  //ローディング中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-blue-600"></div>
      </div>
    );
  }

  // ユーザーがログイン済みの場合は地図画面を表示
  if (user) {
    return (
      <main className="h-screen">
        <Map userData={{
        email: user.email || '',
        username: user.user_metadata.username || '',
        selectedMethods: user.user_metadata?.selectedMethods || []
       }} /> 
      </main>
    );
  }

  const handleLoginStart = () => {
    setAppState('login');
  };

  const handleGuestStart = () => {
    setAppState('payment');
  };

  const handleLoginSuccess = () => {
    // Supabase認証が成功すると自動的にuserが設定されるので、何もしない
    console.log('ログイン成功');
  };

  const handleRegistrationComplete = (userData: { email: string; username: string; selectedMethods: string[] }) => {
    console.log('新規登録完了:', userData);
    setShowPaymentSelection(false);
    // Supabase認証が成功すると自動的にuserが設定される
  };

  const handlePaymentComplete = (userData: { email: string; username: string; selectedMethods: string[] }) => {
    console.log('決済方法選択完了:', userData);
    setAppState('map');
  };

  const handleBackToTitle = () => {
    setAppState('title');
  };

  
  // 開始画面
  if (appState === 'title') {
    return (
      <main>
        <TitleScreen 
          onLoginStart={handleLoginStart}
          onGuestStart={handleGuestStart}
          appName="PayMapKitaQ"
        />
      </main>
    );
  }

  // ログイン画面
  if (appState === 'login') {
    return (
      <main>
        <LoginForm 
          currentMode={mode} 
          onModeChange={setMode}
          onLoginSuccess={handleLoginSuccess}
          onRegistrationComplete={handleRegistrationComplete}
        />
      </main>
    );
  }

  // 決済方法選択画面（ゲスト用）
  if (appState === 'payment') {
    return (
      <main>
        <PaymentMethodSelection 
          onBack={handleBackToTitle}
          onComplete={handlePaymentComplete}
          onRegistrationComplete={handlePaymentComplete}
        />
      </main>
    );
  }

  // 地図画面
  return (
    <main className="h-screen">
      <Map />
    </main>
  );
}