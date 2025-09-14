'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  MapPin,
  CreditCard,
  Eye,
  EyeOff,
  Smartphone,
  Wallet,
  QrCode,
  Zap,
  Edit3
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { PAYMENT_METHODS_MASTER, CATEGORY_INFO } from '@/data/paymentMethods';

// 決済方法の型定義
interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
  description: string;
}

interface SettingsItem {
  label: string;
  description: string;
  action?: () => void;
  showChevron?: boolean;
  toggle?: boolean;
  onToggle?: (value: boolean) => void;
}

interface SettingsSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SettingsItem[];
}

interface SettingsProps {
  userData?: { email: string; username: string; selectedMethods: string[] } | null;
  onBackToMap: () => void;
}

export default function Settings({ userData, onBackToMap }: SettingsProps) {
  const { signOut } = useAuthContext();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode") || "false"));
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showPaymentMethods, setShowPaymentMethods] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await signOut();
      onBackToMap();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const PaymentMethodView = () => setShowPaymentModal(true);
  const ProfileView = () => setShowProfileModal(true);

  // 選択された決済方法をカテゴリ別にグループ化（型を明示的に指定）
  const getSelectedPaymentMethods = (): Record<string, PaymentMethod[]> => {
    if (!userData?.selectedMethods) return {};
    
    const methods: PaymentMethod[] = userData.selectedMethods
      .map(methodId => 
        PAYMENT_METHODS_MASTER.find(method => method.id === methodId)
      )
      .filter((method): method is PaymentMethod => method !== undefined);

    return methods.reduce((acc, method) => {
      if (!acc[method.category]) {
        acc[method.category] = [];
      }
      acc[method.category].push(method);
      return acc;
    }, {} as Record<string, PaymentMethod[]>);
  };

  const selectedMethodsByCategory = getSelectedPaymentMethods();

  // アイコンコンポーネントのマッピング
  const getCategoryIcon = (iconName: string) => {
    const iconMap = {
      QrCode,
      Smartphone,
      CreditCard,
      Zap,
      Wallet
    };
    return iconMap[iconName as keyof typeof iconMap] || CreditCard;
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'アカウント',
      icon: User,
      items: [
        {
          label: 'プロフィール',
          description: userData?.username || 'ゲストユーザー',
          action: () => ProfileView(),
          showChevron: true
        },
        {
          label: '決済方法',
          description: `${userData?.selectedMethods.length || 0}個の決済方法`,
          action: () => PaymentMethodView(), 
          showChevron: true
        }
      ]
    },
    {
      title: '通知',
      icon: Bell,
      items: [
        {
          label: 'プッシュ通知',
          description: '新しい店舗情報やお得情報を受け取る',
          toggle: notifications,
          onToggle: setNotifications
        },
        {
          label: '音声通知',
          description: '通知音を有効にする',
          toggle: soundEnabled,
          onToggle: setSoundEnabled
        }
      ]
    },
    {
      title: '表示設定',
      icon: Eye,
      items: [
        {
          label: 'ダークモード',
          description: '暗いテーマを使用する',
          toggle: darkMode,
          onToggle: setDarkMode
        },
        {
          label: '位置情報表示',
          description: '現在地を地図に表示する',
          toggle: showLocation,
          onToggle: setShowLocation
        },
        {
          label: '決済方法表示',
          description: '店舗に決済方法を表示する',
          toggle: showPaymentMethods,
          onToggle: setShowPaymentMethods
        }
      ]
    },
    {
      title: 'プライバシー',
      icon: Shield,
      items: [
        {
          label: '位置情報の使用',
          description: '地図機能で位置情報を使用する',
          action: () => console.log('位置情報設定'),
          showChevron: true
        },
        {
          label: 'データの管理',
          description: 'アカウントデータの管理',
          action: () => console.log('データ管理'),
          showChevron: true
        }
      ]
    },
    {
      title: 'サポート',
      icon: HelpCircle,
      items: [
        {
          label: 'ヘルプセンター',
          description: 'よくある質問とサポート',
          action: () => console.log('ヘルプセンター'),
          showChevron: true
        },
        {
          label: 'お問い合わせ',
          description: 'サポートチームに連絡',
          action: () => console.log('お問い合わせ'),
          showChevron: true
        },
        {
          label: 'アプリについて',
          description: 'バージョン 1.0.0',
          action: () => console.log('アプリ情報'),
          showChevron: true
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToMap}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">設定</h1>
          </div>
        </div>
      </div>

      {/* ユーザー情報 */}
      <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {userData?.username || 'ゲストユーザー'}
              </h2>
              <p className="text-sm text-gray-500">
                {userData?.email || 'ゲストモードで利用中'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {userData?.selectedMethods.length || 0}個の決済方法を設定済み
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 改善された決済方法モーダル */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* ヘッダー */}
            <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-purple-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">決済方法</h2>
                    <p className="text-blue-100 text-sm">
                      {userData?.selectedMethods?.length || 0}個の決済方法を設定中
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-auto px-6 py-6">
              {Object.keys(selectedMethodsByCategory).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(selectedMethodsByCategory).map(([category, methods]) => {
                    const categoryInfo = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
                    const CategoryIcon = getCategoryIcon(categoryInfo.icon);
                    
                    return (
                      <div key={category} className="space-y-3">
                        {/* カテゴリヘッダー */}
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${categoryInfo.color} rounded-lg flex items-center justify-center`}>
                            <CategoryIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{categoryInfo.name}</h3>
                            <p className="text-sm text-gray-500">{methods.length}個の決済方法</p>
                          </div>
                        </div>

                        {/* 決済方法カード */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {methods.map((method) => (
                            <div
                              key={method.id}
                              className="group relative bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                                  <Image
                                    src={method.icon}
                                    alt={method.name}
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm truncate">
                                    {method.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 truncate">
                                    {method.description}
                                  </p>
                                </div>
                              </div>
                              
                              {/* ホバー時の編集アイコン */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Edit3 className="h-3 w-3 text-gray-600" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    決済方法が設定されていません
                  </h3>
                  <p className="text-gray-500 mb-6">
                    お好みの決済方法を設定して、<br />
                    より便利にアプリをご利用ください。
                  </p>
                </div>
              )}
            </div>

            {/* フッター */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => console.log("決済方法を追加")}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>決済方法を追加</span>
                </button>
                <button
                  onClick={() => console.log("決済方法を編集")}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>編集</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* プロフィールモーダル */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-lg h-5/6 flex flex-col overflow-hidden">
            
            {/* ヘッダー */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-500">
              <h2 className="text-lg font-semibold text-white">プロフィール</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {userData?.username?.[0] || "U"}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {userData?.username || "ゲストユーザー"}
                  </p>
                  <p className="text-sm text-gray-500">{userData?.email || "未登録"}</p>
                </div>
              </div>
            </div>

            {/* フッター */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => console.log("プロフィールを変更")}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
              >
                プロフィールを変更
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 設定セクション */}
      <div className="px-4 py-4 space-y-4">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <section.icon className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-700">{section.title}</h3>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {section.items.map((item, itemIndex) => (
                 <div
                 key={itemIndex}
                 className="px-4 py-3 cursor-pointer"   
                 onClick={item.action}                  
                 >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        </div>
                        
                        {/* 型安全な条件分岐 */}
                        {item.toggle !== undefined && item.onToggle ? (
                          <button
                            onClick={() => item.onToggle?.(!item.toggle)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              item.toggle ? 'bg-blue-500' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                item.toggle ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        ) : item.showChevron ? (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ログアウトボタン */}
      <div className="px-4 py-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">ログアウト</span>
        </button>
      </div>

      {/* フッター */}
      <div className="px-4 py-6">
        <div className="text-center">
          <p className="text-xs text-gray-400">
            PayMapKitaQ v1.0.0
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © 2025 PayMapKitaQ. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}