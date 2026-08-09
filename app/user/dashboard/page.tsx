'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { createProfileIfNeeded, getProfile, UserProfile } from '../../../lib/users';

const chats = [
  { name: 'Maria Santos', message: 'Can we review the project later?', time: '10:32 AM', initials: 'MS', color: 'bg-rose-500', online: true },
  { name: 'Design Team', message: 'John: The new mockups are ready.', time: '9:15 AM', initials: 'DT', color: 'bg-violet-500', online: false },
  { name: 'Kevin Cruz', message: 'Thank you! See you tomorrow.', time: 'Yesterday', initials: 'KC', color: 'bg-amber-500', online: true },
  { name: 'Weekend Plans', message: 'Ana: I added a few places to visit.', time: 'Yesterday', initials: 'WP', color: 'bg-cyan-500', online: false },
];
const activeUsers = [{ name: 'Kevin Cruz', initials: 'KC', color: 'bg-amber-500' }, { name: 'Ana Reyes', initials: 'AR', color: 'bg-emerald-500' }, { name: 'Jules Tan', initials: 'JT', color: 'bg-pink-500' }];
const starterPosts = [
  { id: 1, name: 'Maria Santos', initials: 'MS', color: 'bg-rose-500', time: '25 min ago', text: 'Had such a productive morning with the team. Small progress still counts! ✨', image: 'from-rose-400 via-pink-500 to-violet-600', likes: 24, comments: 4, liked: false },
  { id: 2, name: 'Kevin Cruz', initials: 'KC', color: 'bg-amber-500', time: '1 hr ago', text: 'Coffee, a good playlist, and a clear plan for the week. What is everyone working on today?', image: '', likes: 18, comments: 7, liked: false },
  { id: 3, name: 'Ana Reyes', initials: 'AR', color: 'bg-emerald-500', time: '3 hrs ago', text: 'Sharing a few snapshots from our weekend hike. The view was worth every step. 🌿', image: 'from-emerald-500 via-teal-500 to-cyan-600', likes: 52, comments: 9, liked: false },
];
type DashboardView = 'home' | 'messages' | 'friends' | 'groups' | 'settings' | 'profile';

export default function DashboardPage({ initialView = 'home' }: { initialView?: DashboardView }) {
  const [user, setUser] = useState<{ email?: string; user_metadata: Record<string, unknown> } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>(['Hi! I am ChatBook Assist. How can I help you today?']);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>(initialView);
  const [posts, setPosts] = useState(starterPosts);
  const [postText, setPostText] = useState('');
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return router.replace('/login');
      setUser(authUser);
      try {
        if (!authUser.email) throw new Error('Your account does not have an email address.');
        await createProfileIfNeeded(authUser.email, authUser.user_metadata);
        setProfile(await getProfile(authUser.email));
      } catch (error) { setErrorMsg(error instanceof Error ? error.message : 'Unable to load your profile.'); }
      finally { setLoading(false); }
    };
    load();
  }, [router]);

  const filteredChats = useMemo(() => chats.filter((chat) => chat.name.toLowerCase().includes(search.toLowerCase())), [search]);
  const logout = async () => { await supabase.auth.signOut(); router.replace('/login'); };
  const sendMessage = (event: FormEvent) => { event.preventDefault(); if (!message.trim()) return; setMessages((current) => [...current, message.trim()]); setMessage(''); };
  const openView = (view: DashboardView) => { setActiveView(view); setMenuOpen(false); };
  const isMessageDashboard = initialView === 'messages';
  const publishPost = (event: FormEvent) => {
    event.preventDefault();
    if (!postText.trim()) return;
    setPosts((current) => [{ id: Date.now(), name: fullName, initials, color: 'bg-blue-600', time: 'Just now', text: postText.trim(), image: '', likes: 0, comments: 0, liked: false }, ...current]);
    setPostText('');
  };
  const toggleLike = (id: number) => setPosts((current) => current.map((post) => post.id === id ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post));
  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : 'My profile';
  const initials = profile ? `${profile.first_name[0] ?? ''}${profile.last_name[0] ?? ''}`.toUpperCase() : 'CB';

  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-950 text-sm text-slate-300"><span className="h-7 w-7 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" /></div>;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
        <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100 lg:hidden" aria-label="Toggle menu">☰</button>
        <div className="flex shrink-0 items-center gap-2 font-bold text-slate-900"><div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">C</div><span className="hidden sm:inline">ChatBook</span></div>
        <label className="mx-auto flex h-10 w-full max-w-xl items-center gap-2 rounded-xl bg-slate-100 px-3 text-slate-400"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" placeholder="Search chats or contacts" /></label>
        <button className="grid h-10 w-10 place-items-center rounded-lg text-lg hover:bg-slate-100" aria-label="Notifications">♧</button>
        <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700" aria-label="Profile">{initials}</button>
      </header>

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[240px_minmax(0,1fr)_280px]">
        <aside className={`${menuOpen ? 'block' : 'hidden'} fixed inset-x-0 top-16 z-20 border-b border-slate-200 bg-white p-4 shadow-lg lg:static lg:block lg:min-h-[calc(100vh-64px)] lg:border-b-0 lg:border-r lg:shadow-none`}>
          <nav className="space-y-1"><Nav label="Home" icon="⌂" active={activeView === 'home'} onClick={() => openView('home')} /><Nav label="Messages" icon="✉" active={activeView === 'messages'} onClick={() => isMessageDashboard ? openView('messages') : router.push('/user/message')} /><Nav label="Friends" icon="♙" active={activeView === 'friends'} onClick={() => openView('friends')} /><Nav label="Groups" icon="◉" active={activeView === 'groups'} onClick={() => openView('groups')} /><Nav label="Settings" icon="⚙" active={activeView === 'settings'} onClick={() => openView('settings')} /></nav>
          <div className="mt-8 border-t border-slate-200 pt-5"><p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Your account</p><button onClick={() => openView('profile')} className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-100"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{initials}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold">{fullName}</span><span className="block text-xs text-slate-500">{profile?.role ?? 'user'}</span></span></button>{profile?.role === 'admin' && <button onClick={() => router.push('/admin')} className="mt-2 w-full rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100">Admin panel</button>}<button onClick={logout} className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-100">Log out</button></div>
        </aside>

        <section className="min-w-0 p-4 sm:p-6">
          {errorMsg && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{errorMsg}</p>}
          <div className="mb-6 flex items-end justify-between"><div><p className="text-sm text-slate-500">Good day, {profile?.first_name || 'there'}!</p><h1 className="text-2xl font-bold tracking-tight">{activeView === 'home' && !isMessageDashboard ? 'Home feed' : activeView === 'home' || isMessageDashboard ? 'Your messages' : activeView[0].toUpperCase() + activeView.slice(1)}</h1></div><button onClick={() => isMessageDashboard ? openView('messages') : router.push('/user/message')} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">New chat</button></div>
          {activeView !== 'home' && !isMessageDashboard && <WorkspacePanel view={activeView as Exclude<DashboardView, 'home'>} profile={profile} email={user?.email} chats={filteredChats.length} />}
          {activeView === 'home' && !isMessageDashboard && <section className="mb-7 space-y-5"><form onSubmit={publishPost} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{initials}</span><textarea value={postText} onChange={(event) => setPostText(event.target.value)} className="min-h-20 flex-1 resize-none rounded-xl bg-slate-100 p-3 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-300" placeholder={`What's on your mind, ${profile?.first_name || 'friend'}?`} /></div><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-xs text-slate-400">Share an update with your community</span><button disabled={!postText.trim()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">Post</button></div></form><div className="flex items-center justify-between"><h2 className="font-bold">Community feed</h2><button className="text-sm font-medium text-blue-600">Latest posts</button></div>{posts.map((post) => <SocialPost key={post.id} post={post} onLike={() => toggleLike(post.id)} />)}</section>}
          <section><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Featured chats</h2><button className="text-sm font-medium text-blue-600">View all</button></div><div className="grid gap-3 sm:grid-cols-2"><Featured title="Design Team" text="12 new updates" icon="DT" color="bg-violet-500" /><Featured title="Weekend Plans" text="4 members online" icon="WP" color="bg-cyan-500" /></div></section>
          <section className="mt-7"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Recent chats</h2><span className="text-sm text-slate-500">{filteredChats.length} conversations</span></div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">{filteredChats.map((chat) => <button key={chat.name} className="flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left last:border-0 hover:bg-slate-50"><span className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full ${chat.color} text-xs font-bold text-white`}>{chat.initials}{chat.online && <i className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}</span><span className="min-w-0 flex-1"><span className="flex justify-between gap-4"><b className="truncate text-sm">{chat.name}</b><small className="shrink-0 text-xs text-slate-400">{chat.time}</small></span><span className="mt-1 block truncate text-sm text-slate-500">{chat.message}</span></span></button>)}{filteredChats.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No chats found.</p>}</div></section>
          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-4"><div><h2 className="font-bold">ChatBook Assist</h2><p className="text-xs text-emerald-600">● Online</p></div><button className="text-slate-400">•••</button></div><div className="min-h-40 space-y-3 bg-slate-50 p-4">{messages.map((item, index) => <p key={`${item}-${index}`} className={`w-fit max-w-[85%] rounded-2xl px-4 py-2 text-sm ${index === 0 ? 'bg-white text-slate-700 shadow-sm' : 'ml-auto bg-blue-600 text-white'}`}>{item}</p>)}</div><form onSubmit={sendMessage} className="border-t border-slate-100 p-3"><div className="flex gap-2"><button type="button" className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Attach a file">＋</button><input value={message} onChange={(event) => setMessage(event.target.value)} className="min-w-0 flex-1 rounded-xl bg-slate-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-300" placeholder="Write a message..." /><button className="rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">Send</button></div><div className="mt-2 flex gap-2 overflow-x-auto"><QuickReply text="Sounds good!" setMessage={setMessage} /><QuickReply text="Thank you" setMessage={setMessage} /><QuickReply text="I'll check it" setMessage={setMessage} /></div></form></section>
        </section>

        <aside className="hidden border-l border-slate-200 bg-white p-5 lg:block"><h2 className="font-bold">Active users</h2><div className="mt-4 space-y-3">{activeUsers.map((person) => <button className="flex w-full items-center gap-3 text-left" key={person.name}><span className={`relative grid h-9 w-9 place-items-center rounded-full ${person.color} text-xs font-bold text-white`}>{person.initials}<i className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" /></span><span className="text-sm font-medium">{person.name}</span></button>)}</div><h2 className="mt-9 font-bold">Trending topics</h2><div className="mt-3 space-y-3"><Trend tag="#WeekendVibes" posts="2.4k posts" /><Trend tag="#DesignTalk" posts="1.8k posts" /><Trend tag="#StudyBuddy" posts="964 posts" /></div><div className="mt-9 rounded-xl bg-blue-50 p-4"><p className="text-sm font-bold text-blue-900">People you may know</p><p className="mt-1 text-xs leading-5 text-blue-700">Connect with friends who share your interests.</p><button className="mt-3 text-sm font-semibold text-blue-700">View suggestions →</button></div></aside>
      </div>
      <footer className="border-t border-slate-200 bg-white px-5 py-5 text-center text-xs text-slate-500">Privacy · Terms · Help center <span className="mx-2">·</span> © {new Date().getFullYear()} ChatBook</footer>
    </main>
  );
}

function Nav({ label, icon, active = false, onClick }: { label: string; icon: string; active?: boolean; onClick: () => void }) { return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}><span className="text-lg">{icon}</span>{label}</button>; }
function WorkspacePanel({ view, profile, email, chats: chatCount }: { view: Exclude<DashboardView, 'home'>; profile: UserProfile | null; email?: string; chats: number }) {
  const details: Record<Exclude<DashboardView, 'home'>, { title: string; description: string; items: string[] }> = {
    messages: { title: 'All messages', description: `${chatCount} chat conversations are available. Select one below or use ChatBook Assist.`, items: ['Search messages from the bar above', 'Open a recent chat to continue the conversation', 'Use quick replies to respond faster'] },
    friends: { title: 'Friends and contacts', description: 'See people who are active and discover new connections.', items: activeUsers.map((person) => `${person.name} is online`) },
    groups: { title: 'Your groups', description: 'Keep shared conversations organized in group spaces.', items: ['Design Team — 12 new updates', 'Weekend Plans — 4 members online'] },
    settings: { title: 'Account settings', description: 'Your profile settings are linked to your ChatBook account.', items: ['Notifications are enabled', 'Use the profile card to review your account details', 'Contact support for account changes'] },
    profile: { title: 'My profile', description: email ?? 'Email not available', items: [`Name: ${profile ? `${profile.first_name} ${profile.last_name}` : 'Not added'}`, `Phone: ${profile?.phone || 'Not added'}`, `Role: ${profile?.role || 'user'}`] },
  };
  const content = details[view];
  return <section className="mb-7 rounded-2xl border border-blue-100 bg-blue-50/60 p-5"><p className="text-sm font-bold text-blue-900">{content.title}</p><p className="mt-1 text-sm text-blue-700">{content.description}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{content.items.map((item) => <div key={item} className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">{item}</div>)}</div></section>;
}
function Featured({ title, text, icon, color }: { title: string; text: string; icon: string; color: string }) { return <button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-blue-200"><span className={`grid h-11 w-11 place-items-center rounded-xl ${color} text-xs font-bold text-white`}>{icon}</span><span><b className="block text-sm">{title}</b><small className="text-slate-500">{text}</small></span></button>; }
function QuickReply({ text, setMessage }: { text: string; setMessage: (value: string) => void }) { return <button type="button" onClick={() => setMessage(text)} className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700">{text}</button>; }
function Trend({ tag, posts }: { tag: string; posts: string }) { return <button className="block text-left"><b className="block text-sm text-slate-700">{tag}</b><small className="text-xs text-slate-400">{posts}</small></button>; }
function SocialPost({ post, onLike }: { post: typeof starterPosts[number]; onLike: () => void }) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [extraComments, setExtraComments] = useState<string[]>([]);
  const submitComment = (event: FormEvent) => { event.preventDefault(); if (!comment.trim()) return; setExtraComments((items) => [...items, comment.trim()]); setComment(''); };
  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center gap-3 p-4"><span className={`grid h-10 w-10 place-items-center rounded-full ${post.color} text-xs font-bold text-white`}>{post.initials}</span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{post.name}</p><p className="text-xs text-slate-400">{post.time} · Public</p></div><button className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100">•••</button></div><p className="px-4 pb-4 text-sm leading-6 text-slate-700">{post.text}</p>{post.image && <div className={`mx-4 mb-4 grid h-52 place-items-center rounded-xl bg-gradient-to-br ${post.image} text-center text-4xl shadow-inner`}>✦</div>}<div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 text-xs text-slate-500"><span>♥ {post.likes} reactions</span><span>{post.comments + extraComments.length} comments</span></div><div className="grid grid-cols-3 p-1"><button onClick={onLike} className={`rounded-lg py-2 text-sm font-medium hover:bg-slate-100 ${post.liked ? 'text-blue-600' : 'text-slate-600'}`}>{post.liked ? '♥ Liked' : '♡ Like'}</button><button onClick={() => setCommentOpen(!commentOpen)} className="rounded-lg py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">◌ Comment</button><button className="rounded-lg py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">↗ Share</button></div>{commentOpen && <form onSubmit={submitComment} className="border-t border-slate-100 p-3"><div className="flex gap-2"><input value={comment} onChange={(event) => setComment(event.target.value)} className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300" placeholder="Write a comment..." /><button className="rounded-full bg-blue-600 px-4 text-sm font-semibold text-white">Send</button></div>{extraComments.map((item, index) => <p key={`${item}-${index}`} className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">{item}</p>)}</form>}</article>;
}
