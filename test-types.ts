interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  avatar_url?: string
  phone?: string
  department?: string
  created_at: string
  updated_at: string
}

type MyDatabase = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'created_at' | 'updated_at'>>
        Relationships: never[]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {}
  }
}

import { createClient } from '@supabase/supabase-js'
const client = createClient<MyDatabase>('http://localhost', 'key')

async function test() {
  const { error } = await client.from('profiles').insert({ id: '1', email: 'a@b.com' }).select().single()
}
