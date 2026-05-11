import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oasmoieyxitvyvgjwxyu.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hc21vaWV5eGl0dnl2Z2p3eHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTg1NzMsImV4cCI6MjA5Mjg3NDU3M30.Yr0-17Y13OVPX0FKefQ8PoQF9JlmX1S08iO88kZw3IY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
