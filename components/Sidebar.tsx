'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/invoices', label: 'Invoices', icon: '📄' },
  { href: '/clients', label: 'Clients', icon: '👥' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          {session?.user?.image && (
            <Image
              src={session.user.image}
              alt="Avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-white border-r border-gray-100 flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">
            Papr<span className="text-blue-600">work</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Freelance invoicing</p>
        </div>
        <NavContent />
      </aside>

      {/* ── MOBILE TOP NAV ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          Papr<span className="text-blue-600">work</span>
        </h1>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-xl">
            <div className="px-6 py-5 border-b border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900">
                Papr<span className="text-blue-600">work</span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Freelance invoicing</p>
            </div>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}