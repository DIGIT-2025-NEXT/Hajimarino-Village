'use client';

import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { TitleScreen } from '@/components/Kaishi';
import LoginForm from '@/components/LoginForm';
import PaymentMethodSelection from '@/components/PaymentMethodSelection';
import Map from '@/components/map/Map';

type AppState = 'title' | 'login' | 'payment' | 'map';
type UserMode = 'authenticated' | 'guest';

export default function Home() {
  const { user, loading, signOut } = useAuthContext();
  const [appState, setAppState] = useState<AppState>('title');
  const [userMode, setUserMode] = useState<UserMode>('authenticated'); // ユーザーモードを追加
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
    setUserMode('authenticated');
  };

  const handleGuestStart = () => {
    // ゲストで始める場合は直接マップ画面に遷移
    setAppState('map');
    setUserMode('guest'); // ゲストモードに設定
  };

  const handleLoginSuccess = () => {
    // ログイン成功後、地図画面に遷移
    setAppState('map');
    setUserMode('authenticated');
  };

  const handleRegistrationComplete = (userData: { email: string; username: string; selectedMethods: string[] }) => {
    console.log('新規登録完了:', userData);
    setShowPaymentSelection(false);
    // 新規登録完了後、地図画面に遷移
    setAppState('map');
    setUserMode('authenticated');
  };

  const handlePaymentComplete = (userData: { email: string; username: string; selectedMethods: string[] }) => {
    console.log('決済方法選択完了:', userData);
    setAppState('map');
    setUserMode('authenticated');
  };

  const handleBackToTitle = () => {
    setAppState('title');
    setUserMode('authenticated'); // タイトルに戻る際は認証モードに戻す
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setAppState('title');
      setUserMode('authenticated');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // ユーザーがログイン済みで、地図画面を表示する場合
  if (user && appState === 'map' && userMode === 'authenticated') {
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

  // ゲストユーザーで地図画面を表示する場合
  if (appState === 'map' && userMode === 'guest') {
    return (
      <main className="h-screen">
        <Map 
          userData={{
            email: '',
            username: 'ゲストユーザー',
            selectedMethods: []
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

  // デフォルトは地図画面（フォールバック）
  return (
    <main className="h-screen">
      <Map 
        userData={{
          email: user?.email || '',
          username: user?.user_metadata?.username || 'ゲストユーザー',
          selectedMethods: user?.user_metadata?.selectedMethods || []
        }}
        onBackToTitle={handleBackToTitle}
      />
    </main>
  );
}