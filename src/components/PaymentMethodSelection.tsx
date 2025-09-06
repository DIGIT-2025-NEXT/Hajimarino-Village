'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Check, CreditCard, Smartphone, Wallet, Train, Search, Filter, Star, Zap } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'qr' | 'nfc' | 'card' | 'ic' | 'cash';
  color: string;
  popularity?: number; // 人気度
  features?: string[]; // 特徴
}

const PAYMENT_METHODS: PaymentMethod[] = [
  // QRコード決済
  {
    id: 'paypay',
    name: 'PayPay',
    icon: 'paypay.png',
    description: 'QRコード決済',
    category: 'qr',
    color: 'from-blue-500 to-blue-600',
    popularity: 95,
    features: ['ポイント還元', '簡単決済', '全国対応']
  },
  {
    id: 'rakuten-pay',
    name: '楽天ペイ',
    icon: 'rakutenpay.png',
    description: 'QRコード決済',
    category: 'qr',
    color: 'from-red-500 to-red-600',
    popularity: 85,
    features: ['楽天ポイント', '還元率高い', '楽天市場連携']
  },
  // NFC決済
  {
    id: 'google-pay',
    name: 'Google Pay',
    icon: 'googlepay.png',
    description: 'NFC決済',
    category: 'nfc',
    color: 'from-green-500 to-green-600',
    popularity: 70,
    features: ['Android対応', 'セキュア', 'クイック決済']
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    icon: 'applepay.png',
    description: 'NFC決済',
    category: 'nfc',
    color: 'from-gray-800 to-gray-900',
    popularity: 80,
    features: ['iPhone対応', 'Face ID', 'プライバシー重視']
  },
  // カード決済
  {
    id: 'credit-card',
    name: 'クレジットカード',
    icon: 'credit.png',
    description: '磁気・ICチップ',
    category: 'card',
    color: 'from-purple-500 to-purple-600',
    popularity: 90,
    features: ['ポイント還元', '分割払い', '保険付き']
  },
  // 交通系IC
  {
    id: 'nimoca',
    name: 'nimoca',
    icon: 'nimoca.png',
    description: '交通系IC',
    category: 'ic',
    color: 'from-orange-500 to-orange-600',
    popularity: 60,
    features: ['北九州エリア', '交通連携', 'ポイント還元']
  },
  {
    id: 'suica',
    name: 'Suica',
    icon: 'suica.png',
    description: '交通系IC',
    category: 'ic',
    color: 'from-blue-600 to-blue-700',
    popularity: 75,
    features: ['関東エリア', '交通連携', '全国利用可能']
  },
  {
    id: 'pasmo',
    name: 'PASMO',
    icon: 'pasmo.png',
    description: '交通系IC',
    category: 'ic',
    color: 'from-pink-500 to-pink-600',
    popularity: 65,
    features: ['関東エリア', '交通連携', 'ポイント還元']
  },
  // 現金
  {
    id: 'cash',
    name: '現金',
    icon: 'genkin.png',
    description: '現金決済',
    category: 'cash',
    color: 'from-green-600 to-green-700',
    popularity: 100,
    features: ['確実', '手数料なし', 'どこでも使える']
  }
];

const CATEGORIES = {
  qr: { name: 'QRコード決済', icon: Smartphone, color: 'bg-blue-100 text-blue-800 border-blue-200', gradient: 'from-blue-500 to-blue-600' },
  nfc: { name: 'NFC決済', icon: Smartphone, color: 'bg-green-100 text-green-800 border-green-200', gradient: 'from-green-500 to-green-600' },
  card: { name: 'カード決済', icon: CreditCard, color: 'bg-purple-100 text-purple-800 border-purple-200', gradient: 'from-purple-500 to-purple-600' },
  ic: { name: '交通系IC', icon: Train, color: 'bg-orange-100 text-orange-800 border-orange-200', gradient: 'from-orange-500 to-orange-600' },
  cash: { name: '現金', icon: Wallet, color: 'bg-green-100 text-green-800 border-green-200', gradient: 'from-green-600 to-green-700' }
};

interface PaymentMethodSelectionProps {
  onBack: () => void;
  onComplete: (userData: { email: string; username: string; selectedMethods: string[]}) => void;
  onRegistrationComplete: (userData: { email: string; username: string; selectedMethods: string[]}) => void;
  userData?: { email: string; username: string };
}

export default function PaymentMethodSelection({ onBack, onComplete, onRegistrationComplete, userData }: PaymentMethodSelectionProps) {
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleComplete = async () => {
    if (selectedMethods.length === 0) {
      alert('少なくとも1つの決済方法を選択してください');
      return;
    }

    setIsLoading(true);
    const userDataToPass = userData || { email: '', username: '' };
    
    setTimeout(() => {
      setIsLoading(false);
      onRegistrationComplete({ ...userDataToPass, selectedMethods });
    }, 1000);
  };

  const toggleMethod = (methodId: string) => {
    setSelectedMethods(prev => 
      prev.includes(methodId)
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    );
  };

  // フィルタリング
  const filteredMethods = PAYMENT_METHODS.filter(method => {
    const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         method.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || method.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedMethods = filteredMethods.reduce((acc, method) => {
    if (!acc[method.category]) {
      acc[method.category] = [];
    }
    acc[method.category].push(method);
    return acc;
  }, {} as Record<string, PaymentMethod[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <button
              onClick={onBack}
              className="p-3 hover:bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div className="ml-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                決済方法を選択
              </h1>
              <p className="text-gray-600 mt-1">
                よく使う決済方法を選択してください • 複数選択可能
              </p>
            </div>
          </div>

          {/* 検索・フィルター */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="決済方法を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-600 hover:bg-white'
                }`}
              >
                すべて
              </button>
              {Object.entries(CATEGORIES).map(([key, category]) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                      selectedCategory === key
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 選択状況表示 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                選択状況
              </h3>
              <p className="text-gray-600">
                {selectedMethods.length}個の決済方法を選択中
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {selectedMethods.length}
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          {selectedMethods.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedMethods.map(methodId => {
                const method = PAYMENT_METHODS.find(m => m.id === methodId);
                return (
                  <span
                    key={methodId}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-full font-medium shadow-lg"
                  >
                    <Check className="h-4 w-4" />
                    <span>{method?.name}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* 決済方法カテゴリ */}
        <div className="space-y-8">
          {Object.entries(groupedMethods).map(([category, methods]) => {
            const categoryInfo = CATEGORIES[category as keyof typeof CATEGORIES];
            const IconComponent = categoryInfo.icon;
            
            return (
              <div key={category} className="space-y-4">
                {/* カテゴリヘッダー */}
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${categoryInfo.color} border-2`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {categoryInfo.name}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                </div>
                
                {/* 決済方法グリッド */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {methods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => toggleMethod(method.id)}
                      className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        selectedMethods.includes(method.id)
                          ? 'ring-4 ring-blue-500 ring-opacity-50 shadow-2xl'
                          : 'hover:shadow-xl'
                      }`}
                    >
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 h-full">
                        {/* 選択チェックマーク */}
                        {selectedMethods.includes(method.id) && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        )}
                        
                        {/* 人気度表示 */}
                        {method.popularity && (
                          <div className="absolute top-4 left-4 flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium text-gray-600">{method.popularity}%</span>
                          </div>
                        )}
                        
                        {/* 決済方法アイコン */}
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${method.color} flex items-center justify-center text-white text-2xl mb-4 mx-auto shadow-lg`}>
                          {method.id === 'paypay' ? (
                            <Image
                              src="/paypay.png"
                              alt="PayPay"
                              width={60}
                              height={60}
                              className="rounded-lg"
                            />
                          ) : method.id === 'rakuten-pay' ? (
                            <Image
                              src="/rakutenpay.png"
                              alt="楽天ペイ"
                              width={60}
                              height={60}
                              className="rounded-lg"
                            />
                          ) : method.id === 'google-pay' ? (
                            <Image
                              src="/googlepay.png"
                              alt="Google Pay"
                              width={60}
                              height={60}
                              className="rounded-lg"
                            />
                          ) : method.id === 'apple-pay' ? (
                            <Image
                              src="/applepay.png"
                              alt="Apple Pay"
                              width={60}
                              height={60}
                              className="rounded-lg"
                            />
                          ) : method.id === 'credit-card' ? (
                            <Image
                              src="/credit.png"
                              alt="クレジットカード"
                              width={60}
                              height={60}
                              className="rounded-lg"
                            />
                          ) : method.id === 'nimoca' ? (
                            <Image
                              src="/nimoca.png"
                              alt="nimoca"
                              width={60}
                              height={60}
                              className="rounded-lg"
                            />
                          ) : method.id === 'suica' ? (
                            <Image
                              src="/suica.png"
                              alt="Suica"
                              width={60}
                              height={60}
                              className="rounded-lg"
                            />
                          ) : method.id === 'pasmo' ? (
                            <Image
                              src="/pasmo.png"
                              alt="PASMO"
                              width={60}
                              height={60}
                              className="rounded-lg"
                            />
                          ) : method.id === 'cash' ? (
                            <Image
                              src="/genkin.png"
                              alt="現金"
                              width={60}
                              height={60}
                              className="rounded-lg"
                            />
                          ) : (
                            method.icon
                          )}
                        </div>
                        
                        {/* 決済方法名 */}
                        <h3 className="font-bold text-gray-800 text-center mb-2 text-lg">
                          {method.name}
                        </h3>
                        
                        {/* 説明 */}
                        <p className="text-sm text-gray-600 text-center mb-3">
                          {method.description}
                        </p>

                        {/* 特徴 */}
                        {method.features && (
                          <div className="space-y-1">
                            {method.features.slice(0, 2).map((feature, index) => (
                              <div key={index} className="flex items-center space-x-1">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span className="text-xs text-gray-500">{feature}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 完了ボタン */}
        <div className="mt-12 text-center">
          <button
            onClick={handleComplete}
            disabled={selectedMethods.length === 0 || isLoading}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-12 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="flex items-center justify-center space-x-3">
              <Zap className="w-6 h-6" />
              <span>
                {isLoading ? '登録中...' : `登録完了 (${selectedMethods.length}個選択)`}
              </span>
              <Check className="w-6 h-6" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </div>
  );
}