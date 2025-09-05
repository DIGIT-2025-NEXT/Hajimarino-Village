'use client';

import { useState } from 'react';
import { TitleScreen } from '@/components/Kaishi';
import LoginForm from '@/components/LoginForm';
import PaymentMethodSelection from '@/components/PaymentMethodSelection';
import Map from '@/components/map/Map';

type AppState = 'title' | 'login' | 'payment' | 'map';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('title');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [userData, setUserData] = useState<{ email: string; username: string; selectedMethods: string[] } | null>(null);

  const handleLoginStart = () => {
    setAppState('login');
  };

  const handleGuestStart = () => {
    setAppState('payment');
  };

  const handleLoginSuccess = () => {
    setAppState('map');
  };

  const handleRegistrationComplete = (userData: { email: string; username: string; selectedMethods: string[] }) => {
    console.log('新規登録完了:', userData);
    setUserData(userData);
    setAppState('map');
  };

  const handlePaymentComplete = (userData: { email: string; username: string; selectedMethods: string[] }) => {
    console.log('決済方法選択完了:', userData);
    setUserData(userData);
    setAppState('map');
  };

  const handleBackToTitle = () => {
    setAppState('title');
  };

  const handleBackToLogin = () => {
    setAppState('login');
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