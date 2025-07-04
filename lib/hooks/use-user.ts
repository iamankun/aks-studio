"use client";

import useSWR from 'swr';
import type { User } from '@/types/user';
import { useRouter } from 'next/navigation';

interface UserHook {
  user?: User;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: any;
  logout: () => Promise<void>;
  mutate: () => Promise<any>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUser(): UserHook {
  const { data, error, isLoading, mutate } = useSWR<{ isLoggedIn: boolean; user?: User }>('/api/auth/status', fetcher);
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await mutate({ isLoggedIn: false, user: undefined }, false); // Optimistic update
    router.push('/'); // Redirect to home or login page
  };

  return {
    user: data?.user,
    isLoggedIn: !!data?.isLoggedIn,
    isLoading,
    error,
    logout,
    mutate,
  };
}