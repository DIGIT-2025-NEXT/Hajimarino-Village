'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  CreditCard,
  Eye,
  Smartphone,
  Wallet,
  QrCode,
  Zap,
  Edit3,
  Save,
  X,
  Check
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { PAYMENT_METHODS_MASTER, CATEGORY_INFO, PaymentMethod, PaymentCategory } from '@/data/paymentMethods';
import PaymentMethodEditModal from './PaymentMethodEditModal';

// ローカルのPaymentMethod型定義を削除（インポートした型を使用）

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
  const { signOut, updateUserProfile } = useAuthContext();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode") || "false"));
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showPaymentMethods, setShowPaymentMethods] = useState(true);
  const [showPaymentEditModal, setShowPaymentEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedUsername, setEditedUsername] = useState(userData?.username || '');

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

  const ProfileView = () => setShowProfileModal(true);

  // 選択された決済方法をカテゴリ別にグループ化（型安全な実装）
  const getSelectedPaymentMethods = (): Record<PaymentCategory, PaymentMethod[]> => {
    if (!userData?.selectedMethods) return {} as Record<PaymentCategory, PaymentMethod[]>;
    
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
    }, {} as Record<PaymentCategory, PaymentMethod[]>);
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

  const handlePaymentMethodSave = async (selectedMethods: string[]) => {
    try {
      // Supabaseのユーザープロフィールを更新
      const { error } = await updateUserProfile({ selectedMethods });
      
      if (error) {
        console.error('決済方法の更新に失敗:', error);
        alert('決済方法の更新に失敗しました。');
      } else {
        console.log('決済方法を更新しました:', selectedMethods);
        // 成功メッセージを表示（オプション）
        alert('決済方法を更新しました。');
      }
    } catch (err) {
      console.error('決済方法の更新エラー:', err);
      alert('決済方法の更新に失敗しました。');
    }
  };

  const handleProfileSave = async () => {
    try {
      const { error } = await updateUserProfile({ username: editedUsername });
      if (error) {
        console.error('プロフィールの更新に失敗:', error);
        alert('プロフィールの更新に失敗しました。');
      } else {
        console.log('プロフィールを更新しました:', editedUsername);
        setIsEditingProfile(false);
        alert('プロフィールを更新しました。');
      }
    } catch (err) {
      console.error('プロフィールの更新エラー:', err);
      alert('プロフィールの更新に失敗しました。');
    }
  };

  const handleProfileCancel = () => {
    setEditedUsername(userData?.username || '');
    setIsEditingProfile(false);
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
          label: '決済方法の変更',
          description: `${userData?.selectedMethods.length || 0}個の決済方法`,
          action: () => setShowPaymentEditModal(true), 
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
      {/* 決済方法編集モーダル */}
      <PaymentMethodEditModal
        isOpen={showPaymentEditModal}
        onClose={() => setShowPaymentEditModal(false)}
        currentMethods={userData?.selectedMethods || []}
        onSave={handlePaymentMethodSave}
        userData={userData}
      />

      {/* 改善されたプロフィールモーダル */}
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
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-auto px-6 py-4 space-y-6">
              {/* ユーザー情報セクション */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold shadow-md mx-auto mb-4">
                  {userData?.username?.[0] || "U"}
                </div>
                
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ユーザー名
                      </label>
                      <input
                        type="text"
                        value={editedUsername}
                        onChange={(e) => setEditedUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ユーザー名を入力"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        メールアドレス
                      </label>
                      <input
                        type="email"
                        value={userData?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">メールアドレスは変更できません</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {userData?.username || "ゲストユーザー"}
                    </h3>
                    <p className="text-sm text-gray-500">{userData?.email || "未登録"}</p>
                  </div>
                )}
              </div>

              {/* 決済方法セクション */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                  設定済み決済方法
                </h4>
                
                {Object.keys(selectedMethodsByCategory).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(selectedMethodsByCategory).map(([category, methods]) => {
                      // 型安全なアクセス
                      const categoryKey = category as PaymentCategory;
                      const categoryInfo = CATEGORY_INFO[categoryKey];
                      const CategoryIcon = getCategoryIcon(categoryInfo.icon);
                      
                      return (
                        <div key={category} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <CategoryIcon className="h-5 w-5 mr-2" style={{ color: categoryInfo.color }} />
                            <h5 className="font-medium text-gray-900">{categoryInfo.name}</h5>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {methods.map((method) => (
                              <div key={method.id} className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-sm">
                                <Image
                                  src={method.icon}
                                  alt={method.name}
                                  width={20}
                                  height={20}
                                  className="rounded"
                                />
                                <span className="text-sm text-gray-700">{method.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>決済方法が設定されていません</p>
                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        setShowPaymentEditModal(true);
                      }}
                      className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
                    >
                      決済方法を設定する
                    </button>
                  </div>
                )}
              </div>

              {/* アカウント情報セクション */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">アカウント情報</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">登録日</span>
                    <span className="text-sm text-gray-900">2025年1月</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">お気に入り店舗</span>
                    <span className="text-sm text-gray-900">0件</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">利用回数</span>
                    <span className="text-sm text-gray-900">0回</span>
                  </div>
                </div>
              </div>
            </div>

            {/* フッター */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              {isEditingProfile ? (
                <>
                  <button
                    onClick={handleProfileCancel}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleProfileSave}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>保存</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>プロフィールを変更</span>
                </button>
              )}
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