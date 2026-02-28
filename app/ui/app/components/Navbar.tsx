'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoginModal from './LoginModal';

type User = { id: number; username: string; user_wallet_seed: string };

const LS_KEY = 'xrp_user';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* invalid data */ }
    }
  }, []);

  function handleSuccess(userData: User) {
    localStorage.setItem(LS_KEY, JSON.stringify(userData));
    setUser(userData);
    setOpen(false);
  }

  function handleSignOut() {
    localStorage.removeItem(LS_KEY);
    setUser(null);
  }

  return (
    <>
      <nav className="bg-green-700 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="SafeFund logo" width={64} height={64} className="rounded-full" />
          <span className="font-bold text-lg tracking-wide">SafeFund</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-green-800 rounded-full px-3 py-1.5 flex-1 max-w-sm mx-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search projects…"
            className="bg-transparent text-sm text-white placeholder-green-400 outline-none w-full px-2"
          />
        </div>

        <div className="flex items-center gap-4 text-sm font-medium">
          <a href="#" className="hidden md:block hover:text-green-300 transition-colors">Discover</a>
          <a href="#" className="hidden md:block hover:text-green-300 transition-colors">Start a Project</a>

          {user ? (
            <button
              onClick={handleSignOut}
              className="bg-green-400 hover:bg-green-300 text-green-900 font-bold px-5 py-2 rounded-full text-sm transition-colors"
            >
              {user.username}
            </button>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="bg-green-400 hover:bg-green-300 text-green-900 font-bold px-5 py-2 rounded-full text-sm transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {open && <LoginModal onSuccess={handleSuccess} onClose={() => setOpen(false)} />}
    </>
  );
}
