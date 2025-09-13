'use client';

import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { TitleScreen } from '@/components/Kaishi';
import LoginForm from '@/components/LoginForm';
import PaymentMethodSelection from '@/components/PaymentMethodSelection';
import Map from '@/components/map/Map';

type AppState = 'title' | 'login' | 'payment' | 'map';

export default function Home() {
  const { user, loading, signOut } = useAuthContext();
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

  const handleLoginStart = () => {
    setAppState('login');
  };

  const handleGuestStart = () => {
    setAppState('payment');
  };

  const handleLoginSuccess = () => {
    // ログイン成功後、地図画面に遷移
    setAppState('map');
  };

  const handleRegistrationComplete = (userData: { email: string; username: string; selectedMethods: string[] }) => {
    console.log('新規登録完了:', userData);
    setShowPaymentSelection(false);
    // 新規登録完了後、地図画面に遷移
    setAppState('map');
  };

  const handlePaymentComplete = (userData: { email: string; username: string; selectedMethods: string[] }) => {
    console.log('決済方法選択完了:', userData);
    setAppState('map');
  };

  const handleBackToTitle = () => {
    setAppState('title');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setAppState('title');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // ユーザーがログイン済みで、地図画面を表示する場合
  if (user && appState === 'map') {
    return (
      <main className="h-screen">
        <Map 
          userData={{
            email: user.email || '',
            username: user.user_metadata.username || '',
            selectedMethods: user.user_metadata?.selectedMethods || []
          }}
          onBackToTitle={handleBackToTitle}
        /> 
      </main>
    );
  }

  // 開始画面
  if (appState === 'title') {
    return (
      <main>
        <TitleScreen 
          onLoginStart={handleLoginStart}
          onGuestStart={handleGuestStart}
          appName="PayMapKitaQ"
          onLogout={handleLogout}
          isLoggedIn={!!user}
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
          onBackToTitle={handleBackToTitle}
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

  // デフォルトは地図画面
  return (
    <main className="h-screen">
      <Map 
        userData={{
          email: user?.email || '',
          username: user?.user_metadata?.username || '',
          selectedMethods: user?.user_metadata?.selectedMethods || []
        }}
        onBackToTitle={handleBackToTitle}
      />
    </main>
  );
}