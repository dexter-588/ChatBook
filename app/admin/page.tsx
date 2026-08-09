'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { getAllProfiles, getProfile, updateUserRole, UserProfile } from '../../lib/users';

export default function AdminPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadAdminDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        router.replace('/login');
        return;
      }

      try {
        const profile = await getProfile(user.email);
        if (profile?.role !== 'admin') {
          router.replace('/user/dashboard');
          return;
        }
        setProfiles(await getAllProfiles());
      } catch (error) {
        setErrorMsg(error instanceof Error ? error.message : 'Unable to load users.');
      } finally {
        setLoading(false);
      }
    };

    loadAdminDashboard();
  }, [router]);

  const changeRole = async (profile: UserProfile, role: 'admin' | 'user') => {
    setUpdatingId(profile.user_id);
    setErrorMsg(null);
    try {
      await updateUserRole(profile.user_id, role);
      setProfiles((current) => current.map((item) => item.user_id === profile.user_id ? { ...item, role } : item));
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to update the role.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-900 p-6 text-white sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div><h1 className="text-2xl font-bold">Admin dashboard</h1><p className="mt-1 text-sm text-gray-400">Manage ChatBook user roles.</p></div>
          <button onClick={() => router.push('/user/dashboard')} className="rounded bg-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-600">My dashboard</button>
        </div>
        {errorMsg && <p className="mb-4 rounded border border-red-500 bg-red-500/20 p-3 text-sm text-red-200">{errorMsg}</p>}
        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-700 text-gray-400"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4">Role</th></tr></thead>
            <tbody>{profiles.map((profile) => <tr className="border-b border-gray-700 last:border-0" key={profile.user_id}>
              <td className="p-4">{profile.first_name} {profile.last_name}</td><td className="p-4 text-gray-300">{profile.email}</td><td className="p-4 text-gray-300">{profile.phone || '—'}</td>
              <td className="p-4"><select value={profile.role} disabled={updatingId === profile.user_id} onChange={(event) => changeRole(profile, event.target.value as 'admin' | 'user')} className="rounded border border-gray-600 bg-gray-700 px-2 py-1 disabled:opacity-50"><option value="user">User</option><option value="admin">Admin</option></select></td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
