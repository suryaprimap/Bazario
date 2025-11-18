import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://miyqpyedbpqvwcbesfff.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1peXFweWVkYnBxdndjYmVzZmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTMxOTgsImV4cCI6MjA3NTU2OTE5OH0.uJq7RJc_odFP9ONqPoDxTwJnKN1iWUrHW8YYfwEBfM4'

// one shared instance for the whole app
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const DEFAULT_VENDOR_ID = '00000000-0000-0000-0000-000000000001';