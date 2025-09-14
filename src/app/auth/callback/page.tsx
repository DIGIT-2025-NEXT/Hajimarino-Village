'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import AuthConfirmation from '@/components/AuthConfirmation';
import AuthError from '@/components/AuthError';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, updateUserProfile } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [authCompleted, setAuthCompleted] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started');
        console.log('URL params:', Object.fromEntries(searchParams.entries()));
        console.log('User:', user);
        console.log('Loading:', loading);
        
        // URLパラメータからエラーをチェック
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          console.error('Auth error:', errorParam, errorDescription);
          setError(errorDescription || '認証中にエラーが発生しました');
          setIsProcessing(false);
          return;
        }

        // 認証が完了している場合
        if (!loading && user && !authCompleted) {
          console.log('User authenticated, processing...');
          setAuthCompleted(true);
          
          // 決済方法の設定を試行（ローカルストレージから取得）
          try {
            const savedMethods = localStorage.getItem('tempSelectedMethods');
            if (savedMethods) {
              console.log('Found saved methods:', savedMethods);
              const selectedMethods = JSON.parse(savedMethods);
              const { error: updateError } = await updateUserProfile({ selectedMethods });
              
              if (updateError) {
                console.error('Failed to update profile:', updateError);
              } else {
                console.log('Profile updated successfully');
                localStorage.removeItem('tempSelectedMethods');
              }
            }
          } catch (err) {
            console.log('決済方法の保存に失敗しました:', err);
          }
          
          setIsProcessing(false);
          return;
        }

        // 認証待機中のタイムアウト処理
        if (!user && !loading) {
          const timeout = setTimeout(() => {
            console.log('Auth timeout');
            setError('認証のタイムアウトが発生しました。再度お試しください。');
            setIsProcessing(false);
          }, 10000);

          return () => clearTimeout(timeout);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('認証の処理中にエラーが発生しました');
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, user, loading, updateUserProfile, authCompleted]);

  const handleComplete = () => {
    console.log('Redirecting to home...');
    router.push('/');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleBack = () => {
    router.push('/');
  };

  if (loading || isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">認証を確認中...</p>
          <p className="text-gray-400 text-sm mt-2">しばらくお待ちください</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AuthError 
        error={error}
        onRetry={handleRetry}
        onBack={handleBack}
      />
    );
  }

  if (user && authCompleted) {
    return <AuthConfirmation onComplete={handleComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-4"></div>
        </div>
        <p className="text-gray-600 text-lg">認証を処理中...</p>
        <p className="text-gray-400 text-sm mt-2">自動的にリダイレクトされます</p>
      </div>
    </div>
  );
}
