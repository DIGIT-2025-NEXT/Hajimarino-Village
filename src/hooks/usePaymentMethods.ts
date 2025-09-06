import { useState, useEffect, useCallback } from 'react';
import { PaymentMethod } from '@/types/store';

// OSM決済方法データの型定義
interface OSMPaymentData {
  id: number;
  type: string;
  lat?: number;
  lng?: number;
  name: string;
  address: string;
  supportedPayments: string[];
  tags: Record<string, string>;
}

// APIレスポンスの型定義
interface PaymentMethodsResponse {
  success: boolean;
  data: OSMPaymentData[];
  count: number;
  error?: string;
}

// 決済方法カテゴリの型定義
type PaymentCategory = 'qr' | 'nfc' | 'card' | 'ic' | 'cash';

// OSMの決済方法データを取得するフック
export const usePaymentMethods = (lat: number, lng: number, radius: number = 1000) => {
  const [paymentMethods, setPaymentMethods] = useState<Record<string, PaymentMethod[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching payment methods from OSM...');
      const response = await fetch(
        `/api/osm-payment-methods?lat=${lat}&lng=${lng}&radius=${radius}`
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          errorMessage += `, message: ${errorData.error || 'Unknown error'}`;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage += ', message: Failed to parse error response';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json() as PaymentMethodsResponse;
      console.log('OSM API Response:', data);
      
      if (data.success) {
        // 店舗IDをキーとして決済方法をマッピング
        const paymentMap: Record<string, PaymentMethod[]> = {};
        
        data.data.forEach((item: OSMPaymentData) => {
          const storeId = `${item.type}_${item.id}`;
          const methods: PaymentMethod[] = item.supportedPayments.map((paymentTag: string) => {
            // payment:visa -> visa に変換
            const paymentKey = paymentTag.replace('payment:', '');
            return {
              id: paymentKey,
              name: getPaymentMethodName(paymentKey),
              icon: getPaymentMethodIcon(paymentKey),
              isSupported: true,
              verifiedAt: new Date().toISOString(),
              category: getPaymentMethodCategory(paymentKey),
              // 店舗情報を追加
              storeName: item.name,
              storeAddress: item.address
            };
          });
          
          paymentMap[storeId] = methods;
        });
        
        setPaymentMethods(paymentMap);
        console.log(`${Object.keys(paymentMap).length}店舗の決済方法データを取得しました`);
      } else {
        console.warn('OSM API returned success: false, using empty data');
        setPaymentMethods({});
      }
    } catch (error) {
      console.error('決済方法データの取得に失敗:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      // エラー時は空のデータを設定
      setPaymentMethods({});
    } finally {
      setLoading(false);
    }
  }, [lat, lng, radius]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    refetch: fetchPaymentMethods
  };
};

// 決済方法の詳細情報を取得するヘルパー関数
const getPaymentMethodName = (key: string): string => {
  const details: Record<string, string> = {
    paypay: 'PayPay',
    rakutenpay: '楽天ペイ',
    linepay: 'LINE Pay',
    merpay: 'メルペイ',
    dpay: 'd払い',
    origami: 'Origami Pay',
    alipay: 'Alipay',
    wechat: 'WeChat Pay',
    suica: 'Suica',
    pasmo: 'PASMO',
    icoca: 'ICOCA',
    kitaca: 'Kitaca',
    toica: 'TOICA',
    manaca: 'manaca',
    pitapa: 'PiTaPa',
    nimoca: 'nimoca',
    hayakaken: 'はやかけん',
    sugoca: 'SUGOCA',
    visa: 'Visa',
    mastercard: 'Mastercard',
    jcb: 'JCB',
    amex: 'American Express',
    diners: 'Diners Club',
    discover: 'Discover',
    debit: 'デビットカード',
    edy: 'Edy',
    nanaco: 'nanaco',
    waon: 'WAON',
    cash: '現金',
    coins: '硬貨',
    notes: '紙幣',
    cheque: '小切手',
    contactless: '非接触決済',
    applepay: 'Apple Pay',
    googlepay: 'Google Pay',
    samsungpay: 'Samsung Pay',
  };
  return details[key] || key;
};

const getPaymentMethodIcon = (key: string): string => {
  const icons: Record<string, string> = {
    paypay: '💰',
    rakutenpay: '',
    linepay: '💬',
    merpay: '🦄',
    dpay: '📱',
    origami: '🦋',
    alipay: '🅰️',
    wechat: '💚',
    suica: '🍎',
    pasmo: '🟦',
    icoca: '🟪',
    kitaca: '🟨',
    toica: '🟧',
    manaca: '🟩',
    pitapa: '🟫',
    nimoca: '🟥',
    hayakaken: '🟪',
    sugoca: '🟦',
    visa: '💳',
    mastercard: '💳',
    jcb: '💳',
    amex: '💳',
    diners: '💳',
    discover: '💳',
    debit: '💳',
    edy: '💳',
    nanaco: '💳',
    waon: '💳',
    cash: '💴',
    coins: '🪙',
    notes: '💵',
    cheque: '💰',
    contactless: '📱',
    applepay: '🍎',
    googlepay: '📱',
    samsungpay: '📱',
  };
  return icons[key] || '💳';
};

const getPaymentMethodCategory = (key: string): PaymentCategory => {
  const categories: Record<string, PaymentCategory> = {
    paypay: 'qr',
    rakutenpay: 'qr',
    linepay: 'qr',
    merpay: 'qr',
    dpay: 'qr',
    origami: 'qr',
    alipay: 'qr',
    wechat: 'qr',
    suica: 'ic',
    pasmo: 'ic',
    icoca: 'ic',
    kitaca: 'ic',
    toica: 'ic',
    manaca: 'ic',
    pitapa: 'ic',
    nimoca: 'ic',
    hayakaken: 'ic',
    sugoca: 'ic',
    visa: 'card',
    mastercard: 'card',
    jcb: 'card',
    amex: 'card',
    diners: 'card',
    discover: 'card',
    debit: 'card',
    edy: 'nfc',
    nanaco: 'nfc',
    waon: 'nfc',
    cash: 'cash',
    coins: 'cash',
    notes: 'cash',
    cheque: 'cash',
    contactless: 'nfc',
    applepay: 'nfc',
    googlepay: 'nfc',
    samsungpay: 'nfc',
  };
  return categories[key] || 'cash'; // デフォルト値を'cash'に設定
};
