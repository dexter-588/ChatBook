'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { ProfileInput } from '../../lib/users';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [profile, setProfile] = useState<ProfileInput>({
    first_name: '', last_name: '', midd_name: '', role: 'user', phone: '', address: '', birth_date: '',
  });
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { profile } },
        });
        if (error) throw error;
        alert('Account created. Confirm your email, then log in to finish creating your profile.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/user/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? 'Create an Account' : 'Welcome to ChatBook'}
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-300 rounded text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="First name" required value={profile.first_name} onChange={(value) => setProfile({ ...profile, first_name: value })} />
                <Field label="Last name" required value={profile.last_name} onChange={(value) => setProfile({ ...profile, last_name: value })} />
              </div>
              <Field label="Middle name" value={profile.midd_name ?? ''} onChange={(value) => setProfile({ ...profile, midd_name: value })} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Phone" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} />
                <Field label="Birth date" type="date" value={profile.birth_date ?? ''} onChange={(value) => setProfile({ ...profile, birth_date: value })} />
              </div>
              <Field label="Address" value={profile.address} onChange={(value) => setProfile({ ...profile, address: value })} />
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={profile.role}
                  onChange={(event) => setProfile({ ...profile, role: event.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin" disabled>Admin (assigned by an administrator)</option>
                </select>
                <p className="mt-1 text-xs text-gray-400">New accounts start as users. Promote an account from the admin dashboard.</p>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 font-semibold rounded transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:underline font-medium"
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </div>

        <div className="mt-4 text-center text-sm">
          <button
            type="button"
            onClick={() => router.push('/user/dashboard')}
            className="text-blue-400 hover:underline font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required, type = 'text' }: {
  label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500" />
    </div>
  );
}
