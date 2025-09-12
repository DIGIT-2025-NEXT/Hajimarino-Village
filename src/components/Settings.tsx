'use client';

import React, { useState } from 'react';
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
  EyeOff
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

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
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showPaymentMethods, setShowPaymentMethods] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut();
      onBackToMap();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const PaymentMethodView = () => setShowPaymentModal(true);

  const settingsSections: SettingsSection[] = [
    {
      title: 'アカウント',
      icon: User,
      items: [
        {
          label: 'プロフィール',
          description: userData?.username || 'ゲストユーザー',
          action: () => console.log('プロフィール編集'),
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

      {showPaymentModal && (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl p-4 w-9/10 max-w-md h-5/6 shadow-lg overflow-auto">
          <h2>ここに設定した決済方法を表示</h2>
          <ul>
            {userData?.selectedMethods.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-center space-x-4">
          <button
          onClick={() => setShowPaymentModal(false)}
          className="px-7 py-2 bg-blue-500 text-white font-medium rounded-lg"
          >
          閉じる
          </button>
          <button
          onClick={() => console.log('決済方法を変更')}
          className="px-7 py-2 bg-blue-500 text-white font-medium rounded-lg"
          >
          決済方法を変更
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