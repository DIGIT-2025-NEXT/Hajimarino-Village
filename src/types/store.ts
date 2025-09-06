// 決済方法の型定義
export interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    isSupported: boolean;
    verifiedAt: string;
    category: 'qr' | 'nfc' | 'card' | 'ic' | 'cash';
  }
  
  // 店舗カテゴリの型定義
  export type StoreCategory = 'restaurant' | 'retail' | 'convenience' | 'supermarket' | 'other';
  
  // 信頼度スコアの型定義
  export type TrustScore = 'high' | 'medium' | 'low';
  
  // 店舗情報の型定義
  export interface Store {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    category: StoreCategory;
    paymentMethods: PaymentMethod[];
    trustScore: TrustScore;
    businessHours?: string;
    phoneNumber?: string;
    website?: string;
    rating?: number;
    userRatingsTotal?: number;
    lastVerified: string;
    // 写真情報を追加
    photos?: StorePhoto[];
  }
  
  // 写真情報の型定義を追加
  export interface StorePhoto {
    photoReference: string;
    height: number;
    width: number;
    htmlAttributions: string[];
  }
  
  // 決済方法のカテゴリ別グループ化
  export interface PaymentMethodCategory {
    id: string;
    name: string;
    methods: PaymentMethod[];
  }