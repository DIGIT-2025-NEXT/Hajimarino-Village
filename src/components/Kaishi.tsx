import React from "react";
import { MapPin, CreditCard, Smartphone, Users, ArrowRight } from "lucide-react";

type TitleScreenProps = {
  onLoginStart: () => void;
  onGuestStart: () => void;
  appName?: string;
  onLogout?: () => void;
  isLoggedIn?: boolean;
};

const ModernLogo: React.FC = () => (
  <div className="flex flex-col items-center space-y-4">
    {/* メインロゴ */}
    <div className="relative">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
        <MapPin className="w-10 h-10 text-white" />
      </div>
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
        <CreditCard className="w-3 h-3 text-white" />
      </div>
    </div>
    
    {/* アプリ名 */}
    <div className="text-center">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        PayMapKitaQ
      </h1>
      <p className="text-gray-600 mt-2 text-lg">
        北九州市の決済対応店舗マップ
      </p>
    </div>
  </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ 
  icon, 
  title, 
  description 
}) => (
  <div className="flex items-center space-x-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onLoginStart,
  onGuestStart,
  onLogout,
  isLoggedIn = false
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* ログアウトボタンのセクションを削除 */}

      {/* メインコンテンツ */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* ロゴセクション */}
        <div className="text-center mb-12">
          <ModernLogo />
        </div>

        {/* 機能紹介カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-4xl w-full">
          <FeatureCard
            icon={<MapPin className="w-6 h-6" />}
            title="店舗検索"
            description="地図で簡単に店舗を探せます"
          />
          <FeatureCard
            icon={<CreditCard className="w-6 h-6" />}
            title="決済方法確認"
            description="対応決済方法を事前に確認"
          />
          <FeatureCard
            icon={<Smartphone className="w-6 h-6" />}
            title="モバイル対応"
            description="スマートフォンでも快適に利用"
          />
        </div>

        {/* アクションボタン */}
        <div className="space-y-4 w-full max-w-md">
          <button
            onClick={onLoginStart}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700"
          >
            <div className="flex items-center justify-center space-x-3">
              <Users className="w-6 h-6" />
              <span>ログインして始める</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={onGuestStart}
            className="w-full group bg-white/90 backdrop-blur-sm text-gray-700 py-4 px-8 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white border border-gray-200 hover:border-gray-300"
          >
            <div className="flex items-center justify-center space-x-3">
              <MapPin className="w-6 h-6" />
              <span>ログインせずに始める</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </button>
        </div>

        {/* フッター情報 */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>北九州市の決済対応店舗を簡単に検索</p>
          <p className="mt-1">PayPay、楽天ペイ、クレジットカードなど対応</p>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;
