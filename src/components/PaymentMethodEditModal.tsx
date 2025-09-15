'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Wallet, 
  QrCode, 
  Zap,
  Check,
  Plus
} from 'lucide-react';
import { PAYMENT_METHODS_MASTER, CATEGORY_INFO, PaymentMethod } from '@/data/paymentMethods';

interface PaymentMethodEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMethods: string[];
  onSave: (selectedMethods: string[]) => void;
  userData?: { email: string; username: string; selectedMethods: string[] } | null;
}

export default function PaymentMethodEditModal({ 
  isOpen, 
  onClose, 
  currentMethods, 
  onSave,
}: PaymentMethodEditModalProps) {
  const [selectedMethods, setSelectedMethods] = useState<string[]>(currentMethods);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    setSelectedMethods(currentMethods);
  }, [currentMethods]);

  // カテゴリ別に決済方法をグループ化
  const groupedMethods = PAYMENT_METHODS_MASTER.reduce((acc, method) => {
    if (!acc[method.category]) {
      acc[method.category] = [];
    }
    acc[method.category].push(method);
    return acc;
  }, {} as Record<string, PaymentMethod[]>);

  // 検索とカテゴリフィルタリング
  const filteredMethods = Object.entries(groupedMethods).reduce((acc, [category, methods]) => {
    const filtered = methods.filter(method => {
      const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           method.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, PaymentMethod[]>);

  const toggleMethod = (methodId: string) => {
    setSelectedMethods(prev => 
      prev.includes(methodId)
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    );
  };

  const handleSave = () => {
    onSave(selectedMethods);
    onClose();
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* ヘッダー */}
        <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-purple-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">決済方法を編集</h2>
                <p className="text-blue-100 text-sm">
                  {selectedMethods.length}個の決済方法を選択中
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 検索とフィルター */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 検索バー */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="決済方法を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* カテゴリフィルター */}
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                すべて
              </button>
              {Object.entries(CATEGORY_INFO).map(([category, info]) => {
                const CategoryIcon = getCategoryIcon(info.icon);
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <CategoryIcon className="h-4 w-4" />
                    <span>{info.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-auto px-6 py-6">
          {Object.keys(filteredMethods).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(filteredMethods).map(([category, methods]) => {
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
                        <p className="text-sm text-gray-500">{categoryInfo.description}</p>
                      </div>
                    </div>

                    {/* 決済方法グリッド */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {methods.map((method) => {
                        const isSelected = selectedMethods.includes(method.id);
                        return (
                          <div
                            key={method.id}
                            onClick={() => toggleMethod(method.id)}
                            className={`group relative cursor-pointer border-2 rounded-2xl p-4 transition-all duration-200 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                            }`}
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
                            
                            {/* 選択状態インジケーター */}
                            <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                            }`}>
                              {isSelected ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        );
                      })}
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
                決済方法が見つかりません
              </h3>
              <p className="text-gray-500">
                検索条件を変更してお試しください。
              </p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedMethods.length}個の決済方法を選択中
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
