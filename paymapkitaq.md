# PayMapKitaQ - 技術仕様書

## 概要

PayMapKitaQは、北九州市の決済対応店舗を検索・表示するWebアプリケーションです。ユーザーは地図上で店舗を検索し、各店舗で利用可能な決済方法を確認できます。

## アプリケーション情報

- **アプリ名**: PayMapKitaQ
- **バージョン**: 0.1.0
- **説明**: 北九州市の決済対応店舗マップ
- **デプロイURL**: https://hajimarino-village.vercel.app/

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 15.5.2 (App Router)
- **言語**: TypeScript 5
- **UI ライブラリ**: React 19.1.0
- **スタイリング**: Tailwind CSS 4
- **アイコン**: Lucide React 0.542.0

### バックエンド・データベース
- **認証**: Supabase Auth
- **データベース**: Supabase (PostgreSQL)
- **API**: Next.js API Routes

### 外部API・サービス
- **地図サービス**: Google Maps API
- **店舗データ**: Google Places API
- **決済方法データ**: OpenStreetMap (Overpass API)
- **デプロイ**: Vercel

### 開発ツール
- **リンター**: ESLint 9
- **型チェック**: TypeScript
- **パッケージマネージャー**: npm

## アーキテクチャ概要

### システム構成図

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   フロントエンド   │    │   バックエンド    │    │   外部サービス   │
│   (Next.js)     │    │   (API Routes)  │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React 19      │◄──►│ • /api/places   │◄──►│ • Google Maps   │
│ • TypeScript    │    │ • /api/osm-*    │    │ • Google Places │
│ • Tailwind CSS  │    │ • /api/auth/*   │    │ • Supabase      │
│ • Lucide Icons  │    │                 │    │ • OpenStreetMap │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### データフロー

1. **ユーザー認証**: Supabase Auth → AuthContext → アプリ全体
2. **店舗検索**: Google Places API → API Routes → useStores Hook → Map Component
3. **決済方法データ**: OpenStreetMap → API Routes → usePaymentMethods Hook → Store Details
4. **ユーザー設定**: Local Storage → Supabase User Metadata → Settings Component

## ディレクトリ構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── places/        # Google Places API統合
│   │   └── osm-payment-methods/ # OpenStreetMap統合
│   ├── auth/              # 認証関連ページ
│   │   └── callback/      # Supabase認証コールバック
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインページ
├── components/            # Reactコンポーネント
│   ├── map/              # 地図関連コンポーネント
│   │   ├── Map.tsx       # メイン地図コンポーネント
│   │   ├── StoreDetailModal.tsx
│   │   ├── FavoriteListModal.tsx
│   │   └── LoginPromptModal.tsx
│   ├── Kaishi.tsx        # タイトル画面
│   ├── LoginForm.tsx     # ログイン・登録フォーム
│   ├── PaymentMethodSelection.tsx
│   ├── PaymentMethodEditModal.tsx
│   ├── Settings.tsx      # 設定画面
│   ├── AuthConfirmation.tsx
│   ├── AuthError.tsx
│   └── EmailVerificationSent.tsx
├── contexts/             # React Context
│   └── AuthContext.tsx   # 認証状態管理
├── hooks/                # カスタムフック
│   ├── useAuth.ts
│   ├── useStores.ts      # 店舗データ管理
│   ├── usePaymentMethods.ts # 決済方法データ管理
│   └── useStoreSearch.ts
├── lib/                  # ユーティリティ・ライブラリ
│   ├── supabase.ts       # Supabase設定
│   └── googlePlaces.ts   # Google Places API統合
├── types/                # TypeScript型定義
│   ├── index.ts
│   └── store.ts
└── data/                 # マスターデータ
    ├── sampleStores.ts   # サンプル店舗データ
    └── paymentMethods.ts # 決済方法マスターデータ
```

## 主要コンポーネント

### 1. アプリケーション状態管理 (`src/app/page.tsx`)

**役割**: アプリ全体の状態管理と画面遷移制御

**主要な状態**:
- `appState`: 'title' | 'login' | 'payment' | 'map'
- `userMode`: 'authenticated' | 'guest'

**主要な機能**:
- ユーザー認証状態の管理
- ゲストユーザーとログインユーザーの分岐処理
- 画面遷移の制御

### 2. 認証システム (`src/contexts/AuthContext.tsx`)

**役割**: Supabase認証の統合とユーザー状態管理

**主要な機能**:
- ユーザー登録・ログイン・ログアウト
- ユーザープロフィール更新
- 認証状態の監視

**API**:
```typescript
interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateUserProfile: (updates: { username?: string; selectedMethods?: string[] }) => Promise<{ error: AuthError | null}>
}
```

### 3. 地図コンポーネント (`src/components/map/Map.tsx`)

**役割**: Google Maps統合と店舗表示

**主要な機能**:
- Google Maps表示
- 店舗マーカーの表示
- 店舗詳細モーダル
- お気に入り機能
- ゲストユーザー制限

**依存関係**:
- `@react-google-maps/api`
- `useStores` Hook
- `useAuth` Hook

### 4. 店舗データ管理 (`src/hooks/useStores.ts`)

**役割**: 店舗データの取得・管理

**データソース**:
- Google Places API (実際の店舗データ)
- OpenStreetMap (決済方法データ)
- サンプルデータ (フォールバック)

**主要な機能**:
- 複数店舗タイプでの検索
- 決済方法データとの照合
- デフォルト決済方法の設定

### 5. 決済方法管理 (`src/hooks/usePaymentMethods.ts`)

**役割**: OpenStreetMapからの決済方法データ取得

**データソース**:
- OpenStreetMap Overpass API
- 決済方法マスターデータ

**主要な機能**:
- OSM決済方法データの取得
- 決済方法の分類・正規化
- 店舗との照合

## API統合

### 1. Google Places API

**エンドポイント**: `/api/places`

**機能**:
- 周辺店舗検索 (`/api/places`)
- テキスト検索 (`/api/places/search`)
- 店舗詳細取得 (`/api/places/details`)
- 写真取得 (`/api/places/photo`)

**パラメータ**:
```typescript
interface PlacesSearchParams {
  lat: number
  lng: number
  radius?: number
  type?: string
  query?: string
}
```

### 2. OpenStreetMap API

**エンドポイント**: `/api/osm-payment-methods`

**機能**:
- 決済方法データの取得
- Overpass APIクエリ実行
- 決済方法タグの解析

**クエリ例**:
```overpass
[out:json][timeout:10];
(
  node["shop"="convenience"](bbox);
);
out tags;
```

### 3. Supabase Auth

**機能**:
- ユーザー認証
- プロフィール管理
- メール認証

**設定**:
- Site URL: https://hajimarino-village.vercel.app/
- Redirect URLs: 認証コールバック用

## データモデル

### 1. 店舗データ (`Store`)

```typescript
interface Store {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  category: StoreCategory
  paymentMethods: PaymentMethod[]
  trustScore: TrustScore
  businessHours?: string
  phoneNumber?: string
  website?: string
  rating?: number
  userRatingsTotal?: number
  lastVerified: string
  photos?: StorePhoto[]
  description?: string
}
```

### 2. 決済方法データ (`PaymentMethod`)

```typescript
interface PaymentMethod {
  id: string
  name: string
  icon: string
  category: PaymentCategory
  color: string
  description: string
}
```

### 3. ユーザーデータ

```typescript
interface UserData {
  email: string
  username: string
  selectedMethods: string[]
}
```

## 認証フロー

### 1. 新規登録フロー

1. ユーザーがメール・パスワード・ユーザー名を入力
2. Supabaseでアカウント作成
3. 決済方法選択画面表示
4. 選択した決済方法をLocalStorageに一時保存
5. 認証メール送信完了画面表示
6. ユーザーがメール認証
7. 認証コールバックでプロフィール更新
8. 地図画面に遷移

### 2. ログインフロー

1. ユーザーがメール・パスワードを入力
2. Supabaseで認証
3. 地図画面に遷移

### 3. ゲストフロー

1. 「ログインせずに始める」をクリック
2. 直接地図画面に遷移
3. 制限された機能（お気に入り、設定）は利用不可

## 決済方法カテゴリ

### 1. QRコード決済
- PayPay
- 楽天ペイ
- LINE Pay
- メルペイ
- d払い

### 2. NFC決済
- Apple Pay
- Google Pay
- Samsung Pay
- Edy
- nanaco
- WAON

### 3. カード決済
- Visa
- Mastercard
- JCB
- American Express

### 4. 交通系IC
- Suica
- PASMO
- ICOCA
- nimoca
- Kitaca

### 5. 現金
- 現金
- 硬貨
- 紙幣

## ユーザーインターフェース

### 1. タイトル画面
- アプリロゴと説明
- 機能紹介カード
- ログイン・ゲスト開始ボタン

### 2. 地図画面
- Google Maps表示
- 店舗マーカー
- 検索機能
- お気に入りボタン
- 設定ボタン

### 3. 店舗詳細モーダル
- 店舗基本情報
- 決済方法一覧
- お気に入り機能
- 写真表示

### 4. 設定画面
- プロフィール表示・編集
- 決済方法管理
- ログアウト機能

## パフォーマンス最適化

### 1. データ取得最適化
- 段階的な検索範囲拡大 (2km → 5km → 10km)
- 重複データの除去
- 最大100件の制限

### 2. UI最適化
- Suspense境界の使用
- ローディング状態の管理
- エラーハンドリング

### 3. キャッシュ戦略
- LocalStorageでの一時データ保存
- Supabase User Metadataでの永続化

## セキュリティ

### 1. 認証セキュリティ
- Supabase Auth使用
- メール認証必須
- セッション管理

### 2. API セキュリティ
- 環境変数でのAPI キー管理
- Next.js API Routesでのプロキシ
- CORS設定

### 3. データ保護
- ユーザーデータの暗号化
- 適切な権限管理

## デプロイメント

### 1. 環境設定
- **開発環境**: localhost:3000
- **本番環境**: https://hajimarino-village.vercel.app/

### 2. 環境変数
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. ビルド設定
- Next.js App Router
- TypeScript strict mode
- ESLint設定

## 今後の拡張予定

### 1. 機能拡張
- 店舗レビュー機能
- 決済方法のリアルタイム更新
- プッシュ通知
- オフライン対応

### 2. データ拡張
- より詳細な決済方法情報
- 店舗の営業時間データ
- 混雑状況情報

### 3. UI/UX改善
- ダークモード対応
- アクセシビリティ向上
- モバイル最適化

## 技術的課題と解決策

### 1. 決済方法データの精度
**課題**: OpenStreetMapの決済方法データが不完全
**解決策**: デフォルト決済方法の設定とユーザーフィードバック機能

### 2. API制限
**課題**: Google Places APIの使用制限
**解決策**: 効率的なクエリ設計とキャッシュ戦略

### 3. 認証フロー
**課題**: メール認証の複雑さ
**解決策**: 分かりやすいUIと適切なエラーハンドリング

## まとめ

PayMapKitaQは、現代的なWeb技術スタックを使用して構築された、ユーザーフレンドリーな決済対応店舗検索アプリケーションです。Next.js、TypeScript、Supabase、Google Maps APIを組み合わせることで、高性能で拡張性の高いアプリケーションを実現しています。

アプリケーションは段階的な開発アプローチを採用し、基本的な機能から始めて、ユーザーフィードバックに基づいて継続的に改善されています。認証システム、地図統合、決済方法データ管理など、複雑な機能を適切に分離し、保守性の高いコードベースを維持しています。
