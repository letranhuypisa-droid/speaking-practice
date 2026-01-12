import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ixwiqbacxizbmmhywvjk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4d2lxYmFjeGl6Ym1taHl3dmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjY1NTYsImV4cCI6MjA4MzgwMjU1Nn0.NxnmtKt_Enmo_nbXnaj1JEeNHgFrI0KKIvUayGqI5vo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
