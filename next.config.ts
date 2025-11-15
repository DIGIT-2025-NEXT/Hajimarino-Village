import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 開発中はPWAを完全に無効にする
  // 本番環境でのみPWAを有効にする場合は、以下のコメントアウトを解除
};

// 開発中はPWAを無効にする
export default nextConfig;

// 本番環境でのみPWAを有効にする場合の設定は、必要に応じて別ファイルに移動
