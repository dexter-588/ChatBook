import { supabase } from './supabase';

export type UserProfile = {
  user_id: number;
  first_name: string;
  last_name: string;
  midd_name: string | null;
  role: string;
  phone: string;
  address: string;
  birth_date: string | null;
  email: string;
};

export type ProfileInput = Omit<UserProfile, 'user_id' | 'email'>;

const profileMetadataKey = 'profile';

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function readProfileMetadata(metadata: Record<string, unknown>): ProfileInput | null {
  const profile = metadata[profileMetadataKey];
  if (!profile || typeof profile !== 'object') return null;

  const data = profile as Record<string, unknown>;
  const first_name = stringValue(data.first_name);
  const last_name = stringValue(data.last_name);

  if (!first_name || !last_name) return null;

  return {
    first_name,
    last_name,
    midd_name: stringValue(data.midd_name) || null,
    role: stringValue(data.role) || 'user',
    phone: stringValue(data.phone),
    address: stringValue(data.address),
    birth_date: stringValue(data.birth_date) || null,
  };
}

export async function createProfileIfNeeded(
  email: string,
  metadata: Record<string, unknown>,
) {
  const { data: existing, error: findError } = await supabase
    .from('users')
    .select('user_id')
    .eq('email', email)
    .limit(1);

  if (findError) throw findError;
  if (existing && existing.length > 0) return;

  const profile = readProfileMetadata(metadata);
  if (!profile) return;

  const { error: insertError } = await supabase.from('users').insert({
    ...profile,
    email,
  });

  if (insertError) throw insertError;
}

export async function getProfile(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('user_id, first_name, last_name, midd_name, role, phone, address, birth_date, email')
    .eq('email', email)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as UserProfile | null;
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('users')
    .select('user_id, first_name, last_name, midd_name, role, phone, address, birth_date, email')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as UserProfile[];
}

export async function updateUserRole(userId: number, role: 'admin' | 'user') {
  const { error } = await supabase.from('users').update({ role }).eq('user_id', userId);
  if (error) throw error;
}
