import type { NextConfig } from "next";
// @ts-expect-error - next-pwaの型定義が存在しないため
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  // 既存の設定
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // 開発モードでも有効にする
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-maps-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
      },
    },
    {
      urlPattern: /^https:\/\/maps\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-maps-static-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
  ],
});

export default pwaConfig(nextConfig);
