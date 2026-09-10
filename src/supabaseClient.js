import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zsnrjapfmsvkyjeiwxmk.supabase.co'
const supabaseAnonKey = 'sb_publishable_apAFjK94Dolcr-8ZXM6ydw_pLeep978'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

