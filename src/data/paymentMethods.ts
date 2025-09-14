// 決済方法のマスターデータ
export const PAYMENT_METHODS_MASTER = [
  // QRコード決済
  {
    id: 'paypay',
    name: 'PayPay',
    icon: '/paypay.png',
    category: 'qr',
    color: 'from-blue-500 to-blue-600',
    description: 'QRコード決済'
  },
  {
    id: 'rakuten-pay',
    name: '楽天ペイ',
    icon: '/rakutenpay.png',
    category: 'qr',
    color: 'from-red-500 to-red-600',
    description: 'QRコード決済'
  },
  // NFC決済
  {
    id: 'google-pay',
    name: 'Google Pay',
    icon: '/googlepay.png',
    category: 'nfc',
    color: 'from-blue-500 to-blue-700',
    description: 'NFC決済'
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    icon: '/applepay.png',
    category: 'nfc',
    color: 'from-gray-600 to-gray-800',
    description: 'NFC決済'
  },
  // カード決済
  {
    id: 'credit-card',
    name: 'クレジットカード',
    icon: '/credit.png',
    category: 'card',
    color: 'from-blue-600 to-blue-800',
    description: 'クレジットカード'
  },
  // 交通系IC
  {
    id: 'suica',
    name: 'Suica',
    icon: '/suica.png',
    category: 'ic',
    color: 'from-red-500 to-red-600',
    description: '交通系IC'
  },
  {
    id: 'pasmo',
    name: 'PASMO',
    icon: '/pasmo.png',
    category: 'ic',
    color: 'from-blue-500 to-blue-600',
    description: '交通系IC'
  },
  {
    id: 'nimoca',
    name: 'nimoca',
    icon: '/nimoca.png',
    category: 'ic',
    color: 'from-green-500 to-green-600',
    description: '交通系IC'
  },
  // 現金
  {
    id: 'cash',
    name: '現金',
    icon: '/genkin.png',
    category: 'cash',
    color: 'from-gray-500 to-gray-600',
    description: '現金決済'
  }
];

// カテゴリのアイコンと色
export const CATEGORY_INFO = {
  qr: { 
    icon: 'QrCode', 
    color: 'from-blue-500 to-blue-600', 
    name: 'QRコード決済',
    description: 'QRコードを読み取って決済'
  },
  nfc: { 
    icon: 'Smartphone', 
    color: 'from-green-500 to-green-600', 
    name: 'NFC決済',
    description: 'スマートフォンをかざして決済'
  },
  card: { 
    icon: 'CreditCard', 
    color: 'from-purple-500 to-purple-600', 
    name: 'カード決済',
    description: 'クレジットカードで決済'
  },
  ic: { 
    icon: 'Zap', 
    color: 'from-orange-500 to-orange-600', 
    name: '交通系IC',
    description: 'ICカードで決済'
  },
  cash: { 
    icon: 'Wallet', 
    color: 'from-gray-500 to-gray-600', 
    name: '現金',
    description: '現金で決済'
  }
};

// 決済方法の型定義
export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
  description: string;
}

// カテゴリ情報の型定義
export interface CategoryInfo {
  icon: string;
  color: string;
  name: string;
  description: string;
}



