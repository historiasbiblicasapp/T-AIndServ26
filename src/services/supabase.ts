import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://rbkojlhvpqjfhyhonfcr.supabase.co'
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia29qbGh2cHFqZmh5aG9uZmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzUwOTksImV4cCI6MjEwMDIxMTA5OX0.3GZhMJ741lXvLbn5FjVXAqijH_5eeuInlsKJSIuCAOo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
