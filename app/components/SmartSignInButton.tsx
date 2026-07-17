"use client";

import { useState } from "react";
import { LogIn, UserPlus, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function SmartSignInButton() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Smart sign-in with role-based redirect
  async function handleSignIn() {
    setIsLoading(true);
    try {
      if (session?.user) {
        // User is logged in, get smart redirect based on role
        const response = await fetch('/api/auth/redirect');
        const data = await response.json();
        
        console.log(`[SMART REDIRECT] Redirecting ${session.user.email} to: ${data.redirect}`);
        router.push(data.redirect);
      } else {
        // User not logged in, redirect to login page
        router.push('/login');
      }
    } catch (error) {
      console.error('Smart redirect error:', error);
      // Fallback to login page
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignOut() {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md h-10 w-20"></div>
    );
  }

  if (session?.user) {
    // User is logged in - show smart dashboard/admin button
    return (
      <div className="flex items-center space-x-3">
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Shield className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Loading...' : 'Dashboard'}
        </button>
        
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // User not logged in - show sign in/up options
  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <LogIn className="h-4 w-4 mr-2" />
        )}
        {isLoading ? 'Loading...' : 'Sign In'}
      </button>
      
      <button
        onClick={() => router.push('/register')}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Sign Up
      </button>
    </div>
  );
}