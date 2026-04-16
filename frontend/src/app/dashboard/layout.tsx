"use client";

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CurrencyToggle } from '@/components/CurrencyToggle';
import { useTripStore } from '@/store/tripStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const hydrateFromStorage = useAuthStore(state => state.hydrateFromStorage);
  const fetchRates = useTripStore(state => state.fetchRates);
  const router = useRouter();

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Hydrate store from localStorage on first client render to avoid SSR mismatch
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (user === null) {
      // Give a brief tick for hydration to complete before redirecting
      const timer = setTimeout(() => {
        if (!useAuthStore.getState().user) {
          router.push('/login');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-gray-100 flex flex-col transition-colors">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#09090b] top-0 sticky z-10 p-4 shadow-sm relative transition-colors">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Travel Planner
          </Link>
          <div className="flex items-center gap-4">
            <CurrencyToggle />
            <ThemeToggle />
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{user.email}</span>
            <button
              onClick={() => { setUser(null); router.push('/login'); }}
              className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg transition font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
