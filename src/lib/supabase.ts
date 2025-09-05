import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// デバッグ用ログ
console.log('=== Supabase設定確認 ===')
console.log('URL:', supabaseUrl ? '設定済み' : '❌ 未設定')
console.log('Key:', supabaseAnonKey ? '設定済み' : '❌ 未設定')
console.log('========================')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabaseの環境変数が設定されていません！')
  console.error('URL:', supabaseUrl)
  console.error('Key:', supabaseAnonKey)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 認証関連の型定義
export type AuthUser = {
    id: string
    email: string 
    username: string
    selectedMethods: string[]
}