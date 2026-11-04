import { createClient } from '@supabase/supabase-js';

// Environment variables or fallback to provided project credentials
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 'https://qqnarhttmlcduifrkpnl.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_WHWbp84LhUJwv2AlWmtKqQ_Db4MFoxD';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
