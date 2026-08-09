import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rtflapmipoqrrxjbblfa.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_5Ezqd3Z2e84I0LR7cZiwwQ_-LTXcsBZ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);